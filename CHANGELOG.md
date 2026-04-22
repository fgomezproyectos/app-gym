# CHANGELOG

---

## 22 de abril de 2026 — Traducción completada (Goal Journal, Workouts, Exercises) + Fixes de separadores y fechas

### Internacionalización completada

**Archivos modificados:**
- `web/src/services/i18n.js` — agregadas nuevas claves de traducción para todos los 15 idiomas:
  - `ofCompleted` — separador localizado para "X de Y completados" (de, of, de, de, von, di, из, の, 의, 的, من, z, van, av)
  - `dateOf` — separador para fechas "día dateOf mes dateOf año"
  - `last30Days`, `streak`, `consecutiveDays`, `activity`, `less`, `more`, `done`, `rest`, `last30DaysAgo` — para ProgressChart
  - `muscleGroup`, `description` — para formulario de ejercicios
  - **Arreglo de sintaxis:** comillas sin cerrar en `loading` property (líneas 187 y 517)

- `web/src/pages/GoalJournalPage.jsx` — 
  - `formatDate()` ahora usa `t('dateOf')` en lugar de hardcodear "de"
  - Fechas ahora son completamente reactivas a cambios de idioma

- `web/src/components/ProgressChart.jsx` — traducción completa con `useLanguage` hook:
  - "Entrenos" → `t('workouts')`
  - "últimos 30 días" → `t('last30Days')`
  - "Racha" → `t('streak')`
  - "días seguidos" → `t('consecutiveDays')`
  - "Actividad" → `t('activity')`
  - "Menos/Más" → `t('less')/t('more')`
  - "Hecho/Descanso" → `t('done')/t('rest')`
  - "Hace 30 días" → `t('last30DaysAgo')`
  - Tooltip de días ahora se traduce según idioma

- `web/src/pages/WorkoutsPage.jsx` — traducción completa del formulario de ejercicios:
  - Placeholders: `t('exerciseName')`, `t('muscleGroup')`, `t('description')`
  - Botones: `t('cancel')`, `t('save')`
  - aria-label de botón delete: `t('deleteExercise')`

**Impacto:**
- **Goal Journal:** Fechas ahora se muestran completamente en el idioma seleccionado (incluyendo separadores "de/of/de/etc")
- **Historial de Entrenamientos:** Traduce etiquetas y responde en tiempo real a cambios de idioma
- **Formulario de Ejercicios:** Todos los campos y botones traducidos a 15 idiomas
- **Reactividad garantizada:** Todos los componentes usan `useLanguage` hook con Context

**Lenguajes completamente soportados:**
1. 🇪🇸 Español
2. 🇺🇸 English
3. 🇵🇹 Português
4. 🇫🇷 Français
5. 🇩🇪 Deutsch
6. 🇮🇹 Italiano
7. 🇷🇺 Русский
8. 🇯🇵 日本語
9. 🇰🇷 한국어
10. 🇨🇳 中文 (简体)
11. 🇹🇼 中文 (繁體)
12. 🇸🇦 العربية
13. 🇵🇱 Polski
14. 🇳🇱 Nederlands
15. 🇸🇪 Svenska

---

## 22 de abril de 2026 — Internacionalización multiidioma (15 idiomas) + Fixes de reactividad

### Sistema de Internacionalización (i18n) implementado

**Archivos nuevos:**
- `web/src/services/i18n.js` — diccionario centralizado con 15 idiomas (es, en, pt, fr, de, it, ru, ja, ko, zh, zh-TW, ar, pl, nl, sv) + funciones `getLanguage()`, `setLanguage(lang)`, `t(key, lang)`
- `web/src/context/LanguageContext.jsx` — React Context para manejo global del idioma con listener de eventos `languageChanged`
- `web/src/hooks/useLanguage.js` — hook refactorizado para usar Context

**Archivos modificados:**
- `web/src/App.jsx` — envuelto con `<LanguageProvider>` para acceso global al contexto de idiomas
- `web/src/pages/GoalJournalPage.jsx` — localización completa de fechas (días y meses en 15 idiomas)
- `web/src/pages/GoalsPage.jsx` — traducción de UI + recargar daily goals al crear/eliminar goal predeterminado (fix KPI)
- `web/src/pages/ProfilePage.jsx` — fix: `useState(getLanguage)` → `useState(() => getLanguage())` para lazy init correcta
- `web/src/components/SavedRoutines.jsx` — traducción de UI con hook `useLanguage`
- `web/src/components/RoutineBuilder.jsx` — traducción de botones y labels con fallback strings

**Nuevas claves de traducción agregadas:**
- `addExercise`, `saveRoutine` — botones de RoutineBuilder (15 idiomas)
- `noRoutines`, `pressToCreateRoutine`, `exerciseSingular`, `exercisePlural`, `done`, `deleteRoutine`, `routineName`, `routinePlaceholder`, `exerciseName`, `deleteExercise`, `noExercises`, `pressToAddFirst` — para Workouts (15 idiomas)

**Impacto:**
- Cambio de idioma ahora es **reactivo en tiempo real** (Context + eventos)
- Fechas calendario correctamente localizadas en todos los idiomas
- KPI de Goals se actualiza inmediatamente al crear/eliminar goals predeterminados
- La app soporta 15 idiomas con fallback a español

---

## 19 de abril de 2026 — Goals en BD + foto y nombre de perfil editables

### Goals migrados a PostgreSQL

**Archivos nuevos:**
- `api/Models/Goal.cs` — plantilla de goal predeterminado por usuario
- `api/Models/DailyGoalLog.cs` — progreso diario por usuario
- `api/DTOs/GoalDto.cs`
- `api/Controllers/GoalsController.cs` — `GET/POST/DELETE /api/goals`
- `api/Controllers/DailyGoalsController.cs` — `GET/POST/PATCH/DELETE /api/daily-goals` + `GET /api/daily-goals/streak`
- Migración `AddGoalsAndDailyGoalLogs` aplicada

Lógica destacada:
- `GET /api/daily-goals` auto-genera los logs del día desde los goals predeterminados si aún no existen
- `GET /api/daily-goals/streak` calcula días consecutivos con al menos 1 goal completado
- `DashboardPage.jsx` reescrito para consumir la API (eliminado localStorage para goals)
- `Sidebar.jsx` actualizado para gestionar goals predeterminados vía API

### Foto de perfil y nombre editables

**Archivos modificados:**
- `api/Models/User.cs` — columna `AvatarBase64`
- `api/Controllers/AuthController.cs` — endpoints `GET /api/auth/me`, `PUT /api/auth/avatar`, `PUT /api/auth/name`
- `web/src/pages/ProfilePage.jsx` — upload con compresión Canvas (400×400 JPEG 0.7), edición inline del nombre
- `web/src/components/Sidebar.jsx` — muestra avatar cargado desde API
- `web/src/pages/DashboardPage.jsx` — muestra avatar cargado desde API

---

## 18 de abril de 2026

## Rediseño completo de la UI y nuevas funcionalidades

---

### 1. Diseño — Nuevo tema claro (light mode)

- Paleta rediseñada: fondo `#f4f6f9`, tarjetas blancas, texto principal `#1b1f3a`
- Estilo inspirado en apps de salud modernas: bordes redondeados grandes, sombras suaves, tarjetas pastel
- Tipografía más pesada y jerarquía visual clara
- Layout mobile-first: tap targets mínimo 44px, sin hover como interacción principal
- `index.css` actualizado con nueva paleta base y reset mejorado

---

### 2. BottomNav — Barra de navegación inferior

**Archivos nuevos:**
- `web/src/components/BottomNav.jsx`
- `web/src/components/BottomNav.css`

Barra fija flotante en forma de "pill" con tres botones:
- 🏠 Home → `/dashboard`
- 💪 Dumbbell → `/workouts`
- 👤 User → `/profile`

Incluye `env(safe-area-inset-bottom)` para soporte de notch en iPhone.

---

### 3. DashboardPage — Nueva página principal

**Archivos nuevos:**
- `web/src/pages/DashboardPage.jsx`
- `web/src/pages/DashboardPage.css`

Secciones:
- **Header** con avatar (abre el sidebar), saludo con nombre del usuario y campana
- **Stats rápidas**: días entrenados esta semana, racha actual, goals completados hoy
- **Esta semana**: 7 celdas L→D indicando si el usuario entrenó ese día
- **Daily Goals**: lista de objetivos diarios con checkbox, barra de progreso y botón para añadir puntuales

El nombre del usuario se decodifica directamente del JWT (sin librerías externas).

---

### 4. WorkoutsPage — Tabs y gestión de ejercicios

**Archivos modificados:**
- `web/src/pages/WorkoutsPage.jsx` — reescrito con tabs
- `web/src/pages/WorkoutsPage.css` — rediseñado a tema claro

Tres tabs:
- **Mis Rutinas**: lista de rutinas + FAB para crear nueva (componentes existentes conservados)
- **Historial**: heatmap de 30 días (componente ProgressChart conservado)
- **Ejercicios**: lista de ejercicios personalizados (`gym-exercises` en localStorage) con formulario para añadir

---

### 5. ProfilePage — Página de perfil placeholder

**Archivos nuevos:**
- `web/src/pages/ProfilePage.jsx`
- `web/src/pages/ProfilePage.css`

Página placeholder con avatar, texto "Próximamente" y botón de cerrar sesión.
El botón de logout se movió aquí desde WorkoutsPage.

---

### 6. App.jsx — Nuevas rutas

**Archivo modificado:** `web/src/App.jsx`

Rutas añadidas:
- `/dashboard` (protegida) — nueva página principal
- `/profile` (protegida) — nueva página de perfil
- Ruta `*` redirige a `/dashboard` en lugar de `/workouts`

---

### 7. Sidebar — Panel lateral izquierdo

**Archivos nuevos:**
- `web/src/components/Sidebar.jsx`
- `web/src/components/Sidebar.css`
- `web/src/components/ProtectedLayout.jsx`

El sidebar se abre:
- Desde el **avatar** en el Dashboard
- Desde el botón **≡** en Workouts y Profile

Contiene:
- Info del usuario (nombre + email decodificados del JWT)
- Navegación entre secciones
- **Goals predeterminados** (`gym-default-goals` en localStorage):
  - Se configuran una vez y aparecen automáticamente cada día en el Dashboard
  - Añadir y eliminar goals desde aquí
- Botón de cerrar sesión

---

### 8. Goals predeterminados — Nueva lógica

**Clave localStorage:** `gym-default-goals = [{ id, label }]`

Comportamiento:
- Al abrir el Dashboard, los goals del día se reconstruyen fusionando `gym-default-goals` con el progreso guardado en `gym-daily-goals`
- Si es un día nuevo → se parte de cero con los defaults
- Si es el mismo día → se conserva el progreso (✓/✗) y se sincronizan añadidos/eliminados del sidebar
- Goals añadidos manualmente en el Dashboard (`isDefault: false`) solo viven ese día
- La X en un goal de default lo "salta hoy" pero reaparece mañana

---

### 9. Modo oscuro (Dark mode)

**Archivos modificados:**
- `web/src/main.jsx` — aplica tema guardado antes del render (evita flash)
- `web/src/components/Sidebar.jsx` — toggle con icono Sol/Luna
- `web/src/index.css` — variables CSS para ambos temas
- `web/src/pages/DashboardPage.css` — overrides dark
- `web/src/pages/WorkoutsPage.css` — overrides dark
- `web/src/pages/ProfilePage.css` — overrides dark
- `web/src/components/BottomNav.css` — overrides dark
- `web/src/components/Sidebar.css` — overrides dark
- `web/src/styles/general.css` — overrides dark para `.btn-menu-trigger`

Preferencia guardada en `localStorage` clave `gym-theme` (`"dark"` o ausente para claro).
Se aplica como `data-theme="dark"` en `<html>`.

---

### Claves localStorage resumen

| Clave | Contenido |
|---|---|
| `token` | JWT de autenticación |
| `gym-routines` | `Routine[]` — rutinas creadas |
| `gym-completed-days` | `{ date, routineId }[]` — días entrenados |
| `gym-exercises` | `{ id, name, muscleGroup, description }[]` — ejercicios propios |
| `gym-default-goals` | `{ id, label }[]` — goals que aparecen cada día |
| `gym-daily-goals` | `{ date, goals[] }` — progreso de goals del día actual |
| `gym-theme` | `"dark"` o no presente (claro) |

---

### Archivos sin cambios (intactos)

- `api/` — todo el backend .NET sin modificar
- `web/src/pages/LoginPage.jsx` / `RegisterPage.jsx`
- `web/src/components/RoutineBuilder.jsx`
- `web/src/components/SavedRoutines.jsx`
- `web/src/components/ProgressChart.jsx`
- `web/src/services/api.js`
- `web/src/styles/general.css` — sección de auth sin cambios
