using GymApi.Models;
using Microsoft.EntityFrameworkCore;

namespace GymApi.Data;

public class GymDbContext : DbContext
{
    public GymDbContext(DbContextOptions<GymDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Exercise> Exercises => Set<Exercise>();
    public DbSet<Workout> Workouts => Set<Workout>();
    public DbSet<WorkoutExercise> WorkoutExercises => Set<WorkoutExercise>();
    public DbSet<Goal> Goals => Set<Goal>();
    public DbSet<DailyGoalLog> DailyGoalLogs => Set<DailyGoalLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Al borrar un Goal predeterminado, los DailyGoalLogs históricos conservan
        // su Label pero se desvinculan (GoalId → null). El historial no se pierde.
        modelBuilder.Entity<DailyGoalLog>()
            .HasOne(d => d.Goal)
            .WithMany()
            .HasForeignKey(d => d.GoalId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
