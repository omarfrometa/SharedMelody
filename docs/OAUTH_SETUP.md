# Configuración de Proveedores OAuth

Para habilitar el inicio de sesión con Google, Microsoft y Apple, necesitas obtener las credenciales de API (Client ID, Client Secret, etc.) de cada proveedor y configurarlas como variables de entorno en tu servidor.

A continuación se detallan los pasos para cada proveedor.

---

## 1. Google

### Pasos para obtener las credenciales:

1.  **Ir a la Consola de APIs de Google:**
    *   Abre la [Consola de APIs de Google](https://console.developers.google.com/).
    *   Si no tienes un proyecto, crea uno nuevo.

2.  **Crear credenciales de OAuth:**
    *   En el menú de la izquierda, ve a **Credenciales**.
    *   Haz clic en **Crear credenciales** y selecciona **ID de cliente de OAuth**.
    *   Si se te solicita, configura la **pantalla de consentimiento de OAuth**.
        *   Selecciona **Externo** y haz clic en **Crear**.
        *   Rellena la información requerida (nombre de la aplicación, correo electrónico de soporte, etc.).
        *   En la sección **Dominios autorizados**, añade el dominio de tu aplicación (p. ej., `localhost` para desarrollo, `tudominio.com` para producción).
        *   Guarda y continúa.
    *   Vuelve a la creación del ID de cliente.

3.  **Configurar el ID de cliente de OAuth:**
    *   Selecciona **Aplicación web** como tipo de aplicación.
    *   Dale un nombre (p. ej., "SharedMelody Web App").
    *   En **Orígenes de JavaScript autorizados**, añade la URL de tu frontend (p. ej., `http://localhost:3000`).
    *   En **URIs de redireccionamiento autorizados**, añade la URL de callback de tu backend:
        *   `http://localhost:3001/api/auth/google/callback` (para desarrollo)
        *   `https://tu-api.com/api/auth/google/callback` (para producción)
    *   Haz clic en **Crear**.

4.  **Obtener Client ID y Client Secret:**
    *   Después de crear el ID de cliente, se te mostrará tu **ID de cliente** y tu **Secreto de cliente**. Cópialos.

### Variables de entorno:

Añade las siguientes variables a tu archivo `.env` en el directorio `server`:

```
GOOGLE_CLIENT_ID=TU_ID_DE_CLIENTE_DE_GOOGLE
GOOGLE_CLIENT_SECRET=TU_SECRETO_DE_CLIENTE_DE_GOOGLE
```

---

## 2. Microsoft

### Pasos para obtener las credenciales:

1.  **Ir al Portal de Azure:**
    *   Abre el [Portal de Azure](https://portal.azure.com/).
    *   Busca y selecciona **Azure Active Directory**.

2.  **Registrar una nueva aplicación:**
    *   En el menú de la izquierda, ve a **Registros de aplicaciones**.
    *   Haz clic en **Nuevo registro**.
    *   Dale un nombre a tu aplicación (p. ej., "SharedMelody").
    *   En **Tipos de cuenta admitidos**, selecciona **Cuentas en cualquier directorio organizativo (cualquier directorio de Azure AD: multiinquilino) y cuentas personales de Microsoft (por ejemplo, Skype, Xbox)**.
    *   En **URI de redirección**, selecciona **Web** y añade la URL de callback de tu backend:
        *   `http://localhost:3001/api/auth/microsoft/callback`
    *   Haz clic en **Registrar**.

3.  **Obtener el ID de cliente:**
    *   Una vez registrada la aplicación, verás el **ID de aplicación (cliente)**. Cópialo.

4.  **Crear un secreto de cliente:**
    *   En el menú de la izquierda, ve a **Certificados y secretos**.
    *   Haz clic en **Nuevo secreto de cliente**.
    *   Dale una descripción y elige una duración.
    *   Haz clic en **Agregar**.
    *   Copia el **Valor** del secreto. **¡Importante!** Este valor solo se muestra una vez.

### Variables de entorno:

Añade las siguientes variables a tu archivo `.env` en el directorio `server`:

```
MICROSOFT_CLIENT_ID=TU_ID_DE_APLICACION_(CLIENTE)
MICROSOFT_CLIENT_SECRET=TU_VALOR_DE_SECRETO_DE_CLIENTE
```

---

## 3. Apple

La configuración de Apple es más compleja y requiere una cuenta de desarrollador de Apple de pago.

### Pasos para obtener las credenciales:

1.  **Crear un App ID:**
    *   Ve al [portal de desarrolladores de Apple](https://developer.apple.com/account/resources/identifiers/list).
    *   Crea un nuevo **App ID**.
    *   En las capacidades, habilita **Sign in with Apple**.

2.  **Crear un Services ID:**
    *   Crea un nuevo **Services ID**. Este será tu `APPLE_CLIENT_ID`.
    *   Configura los dominios y las URL de redireccionamiento. La URL de redireccionamiento debe ser:
        *   `https://tu-api.com/api/auth/apple/callback` (Apple no admite `localhost` para las URL de redireccionamiento).

3.  **Crear una clave privada:**
    *   Ve a la sección **Keys**.
    *   Crea una nueva clave y habilita **Sign in with Apple**.
    *   Descarga el archivo de clave (`.p8`). **Solo puedes descargarlo una vez.**
    *   Anota el **Key ID**.

### Variables de entorno:

Añade las siguientes variables a tu archivo `.env` en el directorio `server`:

```
APPLE_CLIENT_ID=TU_SERVICES_ID
APPLE_TEAM_ID=TU_TEAM_ID (lo encuentras en la esquina superior derecha de tu cuenta de desarrollador)
APPLE_KEY_ID=TU_KEY_ID
APPLE_PRIVATE_KEY_LOCATION=RUTA/AL/ARCHIVO/AuthKey_XXXXXXXXXX.p8
```

**Nota sobre la clave privada de Apple:**
Debes guardar el archivo `.p8` en una ubicación segura en tu servidor y proporcionar la ruta en la variable de entorno `APPLE_PRIVATE_KEY_LOCATION`.