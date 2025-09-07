import { pool } from '../config/database';
import bcrypt from 'bcryptjs';

interface AdminUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const adminUsers: AdminUser[] = [
  {
    firstName: 'Administrador',
    lastName: 'del Sistema',
    email: 'admin@sharedmelody.com',
    password: 'admin'
  },
  {
    firstName: 'Omar',
    lastName: 'Frometa',
    email: 'omar.frometa@fvtech.net',
    password: 'Of12345*'
  }
];

async function createAdminUsers() {
  const client = await pool.connect();

  try {
    console.log('🚀 Iniciando creación de usuarios administradores...');
    
    // Crear usuarios administradores
    for (const user of adminUsers) {
      try {
        // Verificar si el usuario ya existe
        const existingUserQuery = `
          SELECT user_id FROM users WHERE email = $1
        `;
        const existingUser = await client.query(existingUserQuery, [user.email]);

        if (existingUser.rows.length > 0) {
          console.log(`⚠️  Usuario ${user.email} ya existe, saltando...`);
          continue;
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(user.password, 12);

        // Crear el usuario
        const createUserQuery = `
          INSERT INTO users (
            first_name,
            last_name,
            email,
            password_hash,
            role,
            is_active,
            registration_date
          )
          VALUES ($1, $2, $3, $4, 'admin', true, NOW())
          RETURNING user_id, email, first_name, last_name
        `;

        const result = await client.query(createUserQuery, [
          user.firstName,
          user.lastName,
          user.email,
          hashedPassword
        ]);

        const createdUser = result.rows[0];
        console.log(`✅ Usuario administrador creado:`, {
          id: createdUser.user_id,
          email: createdUser.email,
          name: `${createdUser.first_name} ${createdUser.last_name}`
        });

      } catch (error) {
        console.error(`❌ Error creando usuario ${user.email}:`, error);
      }
    }
    
    console.log('🎉 Proceso completado!');

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    client.release();
  }
}

// Ejecutar el script
if (require.main === module) {
  createAdminUsers()
    .then(() => {
      console.log('✅ Script ejecutado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error ejecutando script:', error);
      process.exit(1);
    });
}

export default createAdminUsers;
