<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

#TESLO API

# Ejecutar en desarrollo
1. Clonar el repositorio
2. Tener Nest CLI instalado
```
npm i -g @nestjs/cli
```
3. Clonar el archivo ```.env.template``` y renombrar la copia a ```.env```
4. Llenar las variables de entorno definidas en el ```.env```
5. Levantar la BD
```
docker compose up -d
```
6. Ejecutar
```
npm run install
```
7. Ejecutar la aplicación en dev:
```
npm run start:dev
```
8.  Reconstruir la base de datos con la semilla
```
http://localhost:3000/api/v2/seed
```

# Stack Utilizado
* Mongo DB
* NestJS V. 11.0.5


#Build Production
1. Crear el archivo ```.env.prod```
2. Llenar las variables del entorno de producción
3. Crear la nueva imagen
```
docker-compose -f docker-compose.prod.yaml --env-file .env.prod up --build
```