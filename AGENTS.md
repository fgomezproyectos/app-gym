# GymApp — Contexto del proyecto

App de gestión de ejercicios de gimnasio. Mono-repo con backend .NET y frontend React.

## Stack

| Capa | Tecnología |
|---|---|
| Backend | ASP.NET Core Web API (.NET 8) |
| Frontend | React 19 + Vite |
| ORM | EF Core + Npgsql |
| BD local | PostgreSQL en Docker |
| BD producción | Supabase (PostgreSQL) |
| CI/CD | GitHub Actions |
| Hosting backend | Fly.io |
| Hosting frontend | Vercel |
| Imágenes Docker | GHCR (GitHub Container Registry) |

## Repositorio GitHub

https://github.com/fgomezproyectos/App-GYM

## Estructura actual (real)

```
App-Gym/
├── api/
│   ├── Controllers/
│   │   ├── AuthController.cs       ← POST /api/auth/register, POST /api/auth/login
│   │   └── ExercisesController.cs  ← CRUD completo, protegido con [Authorize]
│   ├── DTOs/
│   │   ├── AuthDto.cs              ← RegisterDto, LoginDto, TokenDto
│   │   └── ExerciseDto.cs          ← ExerciseDto, ExerciseUpsertDto
│   ├── Models/
│   │   ├── User.cs
│   │   ├── Exercise.cs
│   │   ├── Workout.cs
│   │   └── WorkoutExercise.cs
│   ├── Data/
│   │   └── GymDbContext.cs
│   ├── Migrations/                 ← 3 migraciones aplicadas
│   ├── GymApi.http                 ← Peticiones de prueba (REST Client)
│   ├── Program.cs                  ← JWT + EF Core configurados
│   └── appsettings.json            ← Connection string + config JWT
├── web/                            ← React + Vite (scaffold inicial, sin desarrollar)
└── AGENTS.md
```

## Herramientas instaladas

- .NET SDK 8.0.419
- Node.js v24 / npm 11
- Docker Desktop
- dotnet-ef 8.0.11 (herramienta global)
- VS Code con extensiones:
  - C# Dev Kit (Microsoft)
  - REST Client (Huachao Mao) ← para ejecutar el archivo .http
  - PostgreSQL (Chris Kolkman)

## Paquetes NuGet instalados

- `Npgsql.EntityFrameworkCore.PostgreSQL` 8.0.11
- `Microsoft.EntityFrameworkCore.Design` 8.0.11
- `Microsoft.AspNetCore.Authentication.JwtBearer` 8.0.11
- `BCrypt.Net-Next` 4.0.3

## Estado actual del desarrollo

### ✅ Completado
- Modelos de BD: User, Exercise, Workout, WorkoutExercise
- GymDbContext + migraciones aplicadas (tablas creadas en Postgres local)
- CRUD completo de Exercises (GET, GET by id, POST, PUT, DELETE)
- Autenticación JWT: register y login, contraseñas con BCrypt
- ExercisesController protegido con `[Authorize]`
- Archivo GymApi.http con todas las llamadas de prueba
- Primer commit y push a GitHub

### ⏳ Pendiente
- Dockerfile para el backend
- GitHub Actions (CI/CD: build → push imagen a GHCR → deploy a Fly.io)
- Conectar frontend a Vercel
- Supabase (BD producción) + secret DATABASE_URL en GitHub
- Desarrollar el frontend React (páginas, componentes, llamadas a la API)

## Decisiones tomadas

- Sin capa Service de momento (Controller → DbContext directo). Refactorizar cuando crezca.
- Sin Clean Architecture ni DDD — patrón simple (MVP).
- DTOs separados de los modelos (no se expone la entidad directamente).
- JWT con clave en appsettings.json (en producción se usará variable de entorno).
- Postgres en Docker local: mismo motor que producción, cero diferencias.

## Comandos habituales

```bash
# Backend
cd api
dotnet run
dotnet ef migrations add <Nombre>   ← BD debe estar arrancada
dotnet ef database update

# Frontend
cd web
npm run dev

# Docker — BD local
docker start gym-postgres            ← arrancar contenedor
docker stop gym-postgres             ← parar contenedor

# Nota: Docker Hub bloqueado en esta red por TLS
# Para descargar imágenes nuevas usar mirror de Google:
docker pull mirror.gcr.io/library/postgres:16-alpine
docker tag mirror.gcr.io/library/postgres:16-alpine postgres:16-alpine

# Git
git add . ; git commit -m "mensaje" ; git push
```

## Convenciones

- Idioma del código: inglés. Idioma de los comentarios y commits: español.
- Los endpoints siguen convenciones REST estándar: `api/[controller]`
- La connection string se llama `"Default"` en `appsettings.json`.
- Nombre del contenedor Docker local: `gym-postgres`

## Preferencias del usuario

- El usuario practica inglés: cuando escriba en inglés, corregir sus errores gramaticales o de vocabulario además de atender su petición.
- Responder siempre en español salvo que el usuario escriba en inglés, en cuyo caso responder en inglés.
