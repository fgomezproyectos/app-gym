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
}
