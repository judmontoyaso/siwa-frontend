# Establece la imagen base para el `Dockerfile`. Node 14 es una buena opción para Next.js
FROM node:14

# Establece el directorio de trabajo dentro de la imagen de Docker
WORKDIR /usr/src/app

# Copia los archivos `package.json` y `package-lock.json` (si está disponible)
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia los archivos y directorios restantes a la imagen de Docker
COPY . .

# Construye la aplicación para producción
RUN npm run build

# Expone el puerto que la aplicación usará
EXPOSE 3000

# Define el comando para ejecutar la aplicación
CMD ["npm", "start"]

