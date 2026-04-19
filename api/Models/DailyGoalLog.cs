namespace GymApi.Models;

public class DailyGoalLog
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int? GoalId { get; set; }          // null si es goal puntual (solo ese día)
    public Goal? Goal { get; set; }
    public string Label { get; set; } = string.Empty;  // snapshot del label
    public DateOnly Date { get; set; }
    public bool Done { get; set; } = false;
    public bool IsDefault { get; set; } = false;
}
