# Siwa Frontend



## Características

- **Next.js**: Para SSR (Server Side Rendering) y SSG (Static Site Generation).
- **TypeScript**: Añade tipado estático para un desarrollo más seguro y eficiente.
- **Auth0**: Para autenticación y autorización.
- **Yarn**: Manejador de paquetes.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- Node.js 12.x o superior.
- Yarn: Sigue las instrucciones de instalación en [Yarn Installation Guide](https://classic.yarnpkg.com/en/docs/install/).
- 

## Configuración del Entorno

1. **Clonación del Repositorio**: Clona este repositorio en tu máquina local utilizando el siguiente comando:

    ```bash
    git clone <url-del-repositorio>
    cd <directorio-del-repositorio>
    ```

2. **Instalación de Dependencias**: Instala las dependencias necesarias usando Yarn:

    ```bash
    yarn install
    ```

3. **Configuración de Variables de Entorno**: Copia el archivo `.env.local.example` a un nuevo archivo llamado `.env.local` y actualiza las variables con tus propios valores de Auth0 y cualquier otra API o configuración necesaria.

    ```bash
    cp .env.local.example .env.local
    # Edita .env.local con tus valores
    ```

    Ejemplo de variables que podrías necesitar configurar:

    ```plaintext
    AUTH0_SECRET=
    AUTH0_BASE_URL=http://localhost:3000
    AUTH0_ISSUER_BASE_URL=https://TU_DOMINIO.auth0.com
    AUTH0_CLIENT_ID=TU_CLIENT_ID
    AUTH0_CLIENT_SECRET=TU_CLIENT_SECRET
    ```

4. **Ejecución en Desarrollo**: Inicia el servidor de desarrollo:

    ```bash
    yarn dev
    ```

    Este comando iniciará el servidor de desarrollo de Next.js y podrás acceder a tu aplicación en [http://localhost:3000](http://localhost:3000).

## Scripts Disponibles

En el proyecto, puedes ejecutar varios comandos a través de Yarn:

- `yarn dev`: Ejecuta la aplicación en modo de desarrollo.
- `yarn build`: Construye la aplicación para producción en el directorio `.next`.
- `yarn start`: Inicia un servidor de Next.js en producción.
- `yarn lint`: Ejecuta el linter para identificar problemas en el código TypeScript/JavaScript.


