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

## Estructura

```
App-Gym/
├── api/                        ← ASP.NET Core Web API (GymApi)
│   ├── Controllers/            ← Endpoints HTTP
│   ├── Models/                 ← Entidades: User, Exercise, Workout, WorkoutExercise
│   ├── DTOs/                   ← Objetos de entrada/salida de la API
│   ├── Data/                   ← GymDbContext (EF Core)
│   ├── Services/               ← Lógica de negocio
│   └── Program.cs
├── web/                        ← React + Vite
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/           ← Llamadas a la API
└── .github/workflows/
    └── ci-cd-api.yml
```

## Herramientas instaladas

- .NET SDK 8.0.419
- Node.js v24 / npm 11
- Docker Desktop
- dotnet-ef 8.0.11 (herramienta global)
- VS Code con C# Dev Kit (sin Visual Studio)

## Paquetes NuGet principales

- `Npgsql.EntityFrameworkCore.PostgreSQL` 8.0.11
- `Microsoft.EntityFrameworkCore.Design` 8.0.11

## Comandos habituales

```bash
# Backend
cd api
dotnet run
dotnet ef migrations add <Nombre>
dotnet ef database update

# Frontend
cd web
npm run dev
npm run build

# Docker — PostgreSQL local
# Nota: Docker Hub bloqueado en esta red por TLS
# Usar mirror de Google para descargar imágenes:
docker pull mirror.gcr.io/library/postgres:16-alpine
docker tag mirror.gcr.io/library/postgres:16-alpine postgres:16-alpine
```

## Convenciones

- Idioma del código: inglés. Idioma de los comentarios y commits: español.
- Los endpoints siguen convenciones REST estándar.
- La connection string se llama `"Default"` en `appsettings.json`.

## Preferencias del usuario

- El usuario practica inglés: cuando escriba en inglés, corregir sus errores gramaticales o de vocabulario además de atender su petición.
- Responder siempre en español salvo que el usuario escriba en inglés, en cuyo caso responder en inglés.
- 