-- Inserts de ejemplo para el historial de goals del usuario "user"

-- Primero, obtener el ID del usuario "user"
-- Este query te mostrará el ID

-- Luego insertar goals de días anteriores
-- Reemplaza X con el ID real del usuario "user"

-- Goals de hace 5 días (2026-04-14)
INSERT INTO "DailyGoalLogs" ("UserId", "GoalId", "Label", "Date", "Done", "IsDefault")
VALUES 
  (1, NULL, 'Leer 30 minutos', '2026-04-14', true, false),
  (1, NULL, 'Meditación 10 min', '2026-04-14', true, false),
  (1, NULL, 'Beber 2L de agua', '2026-04-14', false, false);

-- Goals de hace 4 días (2026-04-15)
INSERT INTO "DailyGoalLogs" ("UserId", "GoalId", "Label", "Date", "Done", "IsDefault")
VALUES 
  (1, NULL, 'Leer 30 minutos', '2026-04-15', true, false),
  (1, NULL, 'Meditación 10 min', '2026-04-15', false, false),
  (1, NULL, 'Hacer ejercicio', '2026-04-15', true, false);

-- Goals de hace 3 días (2026-04-16)
INSERT INTO "DailyGoalLogs" ("UserId", "GoalId", "Label", "Date", "Done", "IsDefault")
VALUES 
  (1, NULL, 'Leer 30 minutos', '2026-04-16', true, false),
  (1, NULL, 'Meditación 10 min', '2026-04-16', true, false),
  (1, NULL, 'Beber 2L de agua', '2026-04-16', true, false);

-- Goals de hace 2 días (2026-04-17)
INSERT INTO "DailyGoalLogs" ("UserId", "GoalId", "Label", "Date", "Done", "IsDefault")
VALUES 
  (1, NULL, 'Leer 30 minutos', '2026-04-17', false, false),
  (1, NULL, 'Meditación 10 min', '2026-04-17', true, false),
  (1, NULL, 'Hacer ejercicio', '2026-04-17', true, false);

-- Goals de ayer (2026-04-18)
INSERT INTO "DailyGoalLogs" ("UserId", "GoalId", "Label", "Date", "Done", "IsDefault")
VALUES 
  (1, NULL, 'Leer 30 minutos', '2026-04-18', true, false),
  (1, NULL, 'Meditación 10 min', '2026-04-18', true, false),
  (1, NULL, 'Beber 2L de agua', '2026-04-18', true, false),
  (1, NULL, 'Hacer ejercicio', '2026-04-18', true, false);
