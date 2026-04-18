# CHANGELOG — 18 de abril de 2026

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
