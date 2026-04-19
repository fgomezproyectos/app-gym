namespace GymApi.DTOs;

// ── Goals (plantilla predeterminada) ──────────────────────────────────────────

public class GoalDto
{
    public int Id { get; set; }
    public string Label { get; set; } = string.Empty;
}

public class CreateGoalDto
{
    public string Label { get; set; } = string.Empty;
}

// ── DailyGoalLogs (progreso diario) ──────────────────────────────────────────

public class DailyGoalLogDto
{
    public int Id { get; set; }
    public int? GoalId { get; set; }
    public string Label { get; set; } = string.Empty;
    public bool Done { get; set; }
    public bool IsDefault { get; set; }
}

public class CreateDailyGoalDto
{
    public string Label { get; set; } = string.Empty;  // goal puntual (no default)
    public string Date { get; set; } = string.Empty;   // "yyyy-MM-dd"
}

public class PatchDailyGoalDto
{
    public bool Done { get; set; }
}
