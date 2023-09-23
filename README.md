# Plataforma Educativa

este proyecto es una plataforma educativa que permite a los estudiantes de la Universidad X, inscribirse a cursos y ver sus notas. Además, permite a los profesores crear cursos y ver las notas de sus estudiantes.

# Tabla de Contenidos

- [Plataforma Educativa](#plataforma-educativa)
- [Tabla de Contenidos](#tabla-de-contenidos)
  - [Consideraciones](#consideraciones)
  - [Pre-requisitos](#pre-requisitos)
  - [Instalación](#instalación)
  - [Modo Desarrollo con Docker](#modo-desarrollo-con-docker)
  - [License](#license)

# Consideraciones

- El proyecto se encuentra en desarrollo bajo sistemas operativos UNIX, por tanto, no fue probado bajo un SO Windows per-se. Sin embargo, se puede ejecutar en Windows, pero es necesario tener instalado WSL2 y Docker Desktop para Windows.
- Es necesario tambien solicitar al equipo de desarrollo las credenciales de doppler para el proyecto.

# Pre-requisitos

- NodeJS v16.x
- Python 3.x.x (Algunas dependencias requieren de python)
- Usamos `npm workspaces` con la intención de disminuir los tiempos y esfuerzos en instalar y levantar la aplicación por completo.
- Doppler (Opcional y solo para desarrollo)

## Instalación

- Una vez dentro del repositorio (root), ejecutar el package manager npm para instalar las dependencias.
  ```bash
  npm install
  ```
- Para iniciar el proyecto, ejecutar el siguiente comando:
  ```bash
  doppler run -- npm run dev
  ```
- Usar el puerto 8080

## Modo Desarrollo con Docker

- Para iniciar el modo de desarrollo es necesario contar con Docker y Docker Compose instalados en el equipo y solicitar las credenciales de doppler para el proyecto. Luego, entonces:
  ```bash
  doppler run -- docker-compose up -d
  ```
- Usar el puerto 8080

## Comentarios

- Hola esto es una prueba de el cambio en mi rama.

## Adicional

- Hola esto es un campo adicional

## License

[MIT](https://choosealicense.com/licenses/mit/)
