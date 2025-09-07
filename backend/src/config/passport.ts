import passport, { Profile } from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile, VerifyCallback as GoogleVerifyCallback } from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { Strategy as AppleStrategy, Profile as AppleProfile } from 'passport-apple';
import { pool } from './database';
import { v4 as uuidv4 } from 'uuid';

const findOrCreateUser = async (profile: any, providerName: string) => {
    const client = await pool.connect();
    try {
        // 1. Find user by provider_name and provider_user_id
        const oauthQuery = `
            SELECT u.*
            FROM users u
            JOIN auth_providers ap ON u.user_id = ap.user_id
            WHERE ap.provider_name = $1 AND ap.provider_user_id = $2
        `;
        const oauthResult = await client.query(oauthQuery, [providerName, profile.id]);

        if (oauthResult.rows.length > 0) {
            const user = oauthResult.rows[0];
            console.log('🔍 OAuth user found, updating avatar if needed');
            console.log('🔍 Google Profile Data:', {
                email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
                givenName: profile.name?.givenName,
                familyName: profile.name?.familyName,
                photos: profile.photos,
                photoUrl: profile.photos && profile.photos[0] ? profile.photos[0].value : null
            });

            // Update avatar_url if we have one from the provider (always update to keep it fresh)
            const avatarUrl = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
            if (avatarUrl) {
                console.log('💾 Updating OAuth user avatar_url:', avatarUrl);
                await client.query('UPDATE users SET avatar_url = $1 WHERE user_id = $2', [avatarUrl, user.user_id]);
                user.avatar_url = avatarUrl; // Update local object
            }

            return user;
        }

        // 3. If no linked account, find user by email
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (!email) {
            throw new Error('No email found from provider.');
        }

        let userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        let user;
        let userId;

        if (userResult.rows.length > 0) {
            // User with this email already exists, link account
            user = userResult.rows[0];
            userId = user.user_id;

            console.log('🔍 Existing user found, updating avatar if needed');
            console.log('🔍 Google Profile Data:', {
                email,
                givenName: profile.name?.givenName,
                familyName: profile.name?.familyName,
                photos: profile.photos,
                photoUrl: profile.photos && profile.photos[0] ? profile.photos[0].value : null
            });

            // Update avatar_url if we have one from the provider (always update to keep it fresh)
            const avatarUrl = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
            if (avatarUrl) {
                console.log('💾 Updating existing user avatar_url:', avatarUrl);
                await client.query('UPDATE users SET avatar_url = $1 WHERE user_id = $2', [avatarUrl, userId]);
                user.avatar_url = avatarUrl; // Update local object
            }
        } else {
            // 4. If no user with that email, create a new user
            console.log('🔍 Google Profile Data:', {
                email,
                givenName: profile.name?.givenName,
                familyName: profile.name?.familyName,
                photos: profile.photos,
                photoUrl: profile.photos && profile.photos[0] ? profile.photos[0].value : null
            });

            const newUserQuery = `
                INSERT INTO users (email, first_name, last_name, username, avatar_url, role)
                VALUES ($1, $2, $3, $4, $5, 'user')
                RETURNING *
            `;
            const username = profile.username || (email.split('@')[0] + `_${Math.random().toString(36).substring(2, 8)}`);
            const avatarUrl = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

            console.log('💾 Saving user with avatar_url:', avatarUrl);

            const newUserResult = await client.query(newUserQuery, [
                email,
                profile.name?.givenName || '',
                profile.name?.familyName || '',
                username,
                avatarUrl
            ]);
            user = newUserResult.rows[0];
            userId = user.user_id;
        }

        // 5. Create the entry in auth_providers
        const newOauthAccountQuery = `
            INSERT INTO auth_providers (user_id, provider_name, provider_user_id)
            VALUES ($1, $2, $3)
        `;
        await client.query(newOauthAccountQuery, [userId, providerName, profile.id]);

        // Return the user
        const finalUserQuery = `
            SELECT u.*
            FROM users u
            WHERE u.user_id = $1
        `;
        const finalUserResult = await client.query(finalUserQuery, [userId]);
        return finalUserResult.rows[0];

    } finally {
        client.release();
    }
};

// Configuración de la estrategia de Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/api/auth/google/callback",
    scope: ['profile', 'email']
}, async (accessToken: string, refreshToken: string, profile: GoogleProfile, done: GoogleVerifyCallback) => {
    try {
        const user = await findOrCreateUser(profile, 'google');
        done(null, user);
    } catch (error: any) {
        done(error);
    }
}));

// Configuración de la estrategia de Microsoft
passport.use(new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_CLIENT_ID!,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
    callbackURL: "/api/auth/microsoft/callback",
    scope: ['user.read']
}, async (accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: any) => void) => {
    try {
        const user = await findOrCreateUser(profile, 'microsoft');
        done(null, user);
    } catch (error: any) {
        done(error);
    }
}));

// Configuración de la estrategia de Apple
passport.use(new AppleStrategy({
    clientID: process.env.APPLE_CLIENT_ID!,
    teamID: process.env.APPLE_TEAM_ID!,
    keyID: process.env.APPLE_KEY_ID!,
    privateKeyLocation: process.env.APPLE_PRIVATE_KEY_LOCATION!,
    callbackURL: "/api/auth/apple/callback",
    scope: ['name', 'email'],
    passReqToCallback: false
}, async (accessToken: string, refreshToken: string, idToken: any, profile: AppleProfile, done: (error: any, user?: any) => void) => {
    try {
        const email = idToken.email;
        const userProfile = {
            id: profile.id,
            displayName: idToken.name ? `${idToken.name.firstName} ${idToken.name.lastName}` : (email ? email.split('@')[0] : 'User'),
            name: {
                givenName: idToken.name ? idToken.name.firstName : '',
                familyName: idToken.name ? idToken.name.lastName : ''
            },
            emails: [{ value: email }],
            _json: idToken
        };
        const user = await findOrCreateUser(userProfile, 'apple');
        done(null, user);
    } catch (error: any) {
        done(error);
    }
}));

// Serialización y deserialización del usuario
passport.serializeUser((user: any, done) => {
    done(null, user.user_id);
});

passport.deserializeUser(async (id: string, done) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT u.*
            FROM users u
            WHERE u.user_id = $1
        `, [id]);
        if (result.rows.length > 0) {
            done(null, result.rows[0]);
        } else {
            done(new Error('User not found'));
        }
    } catch (error) {
        done(error);
    } finally {
        client.release();
    }
});

export default passport;