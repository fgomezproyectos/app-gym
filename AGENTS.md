# GymApp — Contexto del proyecto

App de gestión de ejercicios de gimnasio. Mono-repo con backend .NET y frontend React.

## Stack

| Capa | Tecnología |
|---|---|
| Backend | ASP.NET Core Web API (.NET 8) |
| Frontend | React 19 + Vite |
| ORM | EF Core + Npgsql |
| BD local | PostgreSQL en Docker |
| BD producción | Neon (PostgreSQL) |
| Hosting backend | Render (Docker) |
| Hosting frontend | Vercel |

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
│   ├── Dockerfile                  ← Multi-stage: sdk build → aspnet runtime
│   ├── GymApi.http                 ← Peticiones de prueba (REST Client)
│   ├── Program.cs                  ← JWT + EF Core + auto-migración al arrancar
│   └── appsettings.json            ← Connection string + config JWT
├── docker-compose.yml              ← Solo levanta la API (puerto 8080), conecta a gym-postgres vía red gym-net
├── web/
│   ├── index.html
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx                 ← Router principal (rutas + PrivateRoute)
│   │   ├── index.css               ← Reset global + tema oscuro base
│   │   ├── styles/
│   │   │   └── general.css         ← Estilos compartidos (.auth-*, .error)
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx       ← /login
│   │   │   ├── RegisterPage.jsx    ← /register
│   │   │   ├── ExercisesPage.jsx   ← /exercises (protegida)
│   │   │   ├── ExercisesPage.css   ← Estilos exclusivos de exercises
│   │   │   ├── WorkoutsPage.jsx    ← /workouts (protegida)
│   │   │   └── WorkoutsPage.css    ← Estilos exclusivos de workouts
│   │   ├── components/
│   │   │   ├── RoutineBuilder.jsx  ← Formulario para crear rutinas
│   │   │   ├── SavedRoutines.jsx   ← Lista de rutinas con "Marcar como hecha"
│   │   │   └── ProgressChart.jsx   ← Heatmap 30 días + racha actual
│   │   └── services/
│   │       └── api.js              ← Llamadas a la API (login, register, getExercises)
│   └── package.json
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
- Dockerfile multi-stage para el backend
- docker-compose.yml (solo API, conecta a gym-postgres existente vía red gym-net)
- Auto-migración en Program.cs al arrancar (`db.Database.Migrate()`)
- CORS configurado en Program.cs (origen permitido configurable en appsettings.json)
- Frontend React: login, registro, listado de ejercicios
- Tema oscuro, diseño mobile-first
- Estructura CSS por página con estilos compartidos en general.css
- Commit `93432ec` y push a GitHub (17 ficheros, 818 inserciones)
- Página de rutinas `/workouts`: crear rutinas, marcar como hechas, heatmap de actividad 30 días
  - Datos guardados en localStorage (pendiente conectar a API)
  - Componentes: `RoutineBuilder`, `SavedRoutines`, `ProgressChart`
  - Librería `lucide-react` instalada para iconos
- BD en Neon creada: proyecto APP-GYM, región AWS Europe West 2 (Londres), Postgres 17
  - Host: `ep-damp-hall-abhjjy3m.eu-west-2.aws.neon.tech`, DB: `neondb`, User: `neondb_owner`
  - ⚠️ Rotar contraseña en panel Neon tras el despliegue

### ⏳ Pendiente — PRÓXIMO PASO: desplegar en Render
- **Render (backend):** New Web Service → conectar repo `fgomezproyectos/App-GYM` → Docker → Free
  - Variables de entorno a configurar:
    - `ConnectionStrings__Default` = `Host=ep-damp-hall-abhjjy3m.eu-west-2.aws.neon.tech;Database=neondb;Username=neondb_owner;Password=<PASSWORD>;SSL Mode=Require;Trust Server Certificate=true`
    - `Jwt__Key` = clave segura (mín. 32 chars)
    - `Jwt__Issuer` = `GymApi`
    - `Jwt__Audience` = `GymApp`
    - `AllowedOrigins__0` = URL de Vercel (añadir tras el despliegue del frontend)
  - Una vez creado, anotar la URL pública (ej: `https://gymapi.onrender.com`)
- **Vercel (frontend):** New Project → repo `fgomezproyectos/App-GYM` → Root Directory: `web`
  - Variable de entorno: `VITE_API_URL` = URL de Render
  - Tras desplegar, añadir URL de Vercel a `AllowedOrigins__0` en Render
- CRUD ejercicios desde la UI (crear/editar/borrar)
- Workouts: controladores + frontend

## Decisiones tomadas

- Sin capa Service de momento (Controller → DbContext directo). Refactorizar cuando crezca.
- Sin Clean Architecture ni DDD — patrón simple (MVP).
- DTOs separados de los modelos (no se expone la entidad directamente).
- JWT con clave en appsettings.json (en producción se usará variable de entorno).
- Postgres en Docker local: mismo motor que producción, cero diferencias.

## Comandos habituales

```bash
# Backend — desarrollo diario
docker start gym-postgres            ← arrancar BD
cd api
dotnet run                           ← API en puerto 5211

# Docker Compose — simular producción
docker start gym-postgres
cd D:\GIT\App-Gym
docker compose up                    ← API en puerto 8080 (Docker)

# Docker — red gym-net (solo configurar una vez)
docker network create gym-net
docker network connect gym-net gym-postgres

# Parar contenedores
docker stop gym-postgres

# Nota: Docker Hub bloqueado en esta red por TLS
# Para descargar imágenes nuevas usar mirror de Google:
docker pull mirror.gcr.io/library/postgres:16-alpine
docker tag mirror.gcr.io/library/postgres:16-alpine postgres:16-alpine

# Frontend
cd web
npm run dev

# Migraciones
dotnet ef migrations add <Nombre>   ← BD debe estar arrancada
dotnet ef database update

# Git
git add . ; git commit -m "mensaje" ; git push
```

## Convenciones de CSS y JS (frontend)

- **CSS por página:** cada página tiene su propio fichero CSS (`NombrePágina.css`) junto al `.jsx`.
- **Estilos compartidos:** van en `src/styles/general.css`. Al inicio del fichero hay un comentario indicando qué clases contiene y en qué páginas se usan.
- **Si una clase se usa en más de una página**, va en `general.css`, nunca duplicada.
- **JS compartido:** funciones reutilizables van en `src/services/`. Cada función tiene un comentario indicando en qué páginas se usa.
- **Tema:** oscuro por defecto. Paleta base: fondo `#0d0e14`, tarjeta `#1a1b23`, borde `#2e3044`, texto `#eaeaea`, azul acento `#4f8ef7`.
- **Mobile-first:** breakpoints `min-width: 600px` y `min-width: 900px`.

## Convenciones

- Idioma del código: inglés. Idioma de los comentarios y commits: español.
- Los endpoints siguen convenciones REST estándar: `api/[controller]`
- La connection string se llama `"Default"` en `appsettings.json`.
- Nombre del contenedor Docker local: `gym-postgres`

## Preferencias del usuario

- El usuario practica inglés: cuando escriba en inglés, corregir sus errores gramaticales o de vocabulario además de atender su petición.
- Responder siempre en español salvo que el usuario escriba en inglés, en cuyo caso responder en inglés.

---

## 📋 Instrucción: Documentación en CHANGELOG.md

**IMPORTANTE:** Todos los cambios realizados en el proyecto DEBEN ser documentados automáticamente en el archivo `CHANGELOG.md`.

### Cuándo documentar:
- ✅ Toda modificación de código (features, fixes, refactoring)
- ✅ Cambios en configuración (appsettings.json, package.json, docker-compose.yml, etc.)
- ✅ Actualizaciones de dependencias
- ✅ Cambios en estructura del proyecto o migraciones de BD
- ✅ Cambios significativos en documentación

### Formato a seguir:
1. **Encabezado:** `## [Fecha actual] — [Resumen breve del cambio]`
2. **Secciones:** Agrupa cambios por tema o componente
3. **Archivos modificados:** Lista cada archivo con detalles específicos de qué se cambió
4. **Impacto:** Descripción breve del impacto o relevancia del cambio

### Ejemplo de entrada:
```markdown
## 25 de abril de 2026 — Nueva API de usuarios + Fixes en validación

### Descripción del cambio

**Archivos modificados:**
- `api/Controllers/UserController.cs` — creado nuevo controlador con CRUD completo
- `api/DTOs/UserDto.cs` — DTO para serialización de usuarios
- `web/src/pages/UsersPage.jsx` — nueva página de gestión de usuarios
- `web/src/services/api.js` — nuevas funciones para llamadas a `/api/users`

**Impacto:**
- Los usuarios ahora pueden gestionar otros usuarios desde la UI
- API lista para consumo desde frontend
```

**NOTA:** Esta documentación se hace automáticamente con cada cambio implementado, no es necesario pedirla explícitamente cada vez.
