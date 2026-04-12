namespace GymApi.DTOs;

// Lo que devuelve la API al cliente
public class ExerciseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string MuscleGroup { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

// Lo que recibe la API para crear o editar
public class ExerciseUpsertDto
{
    public string Name { get; set; } = string.Empty;
    public string MuscleGroup { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
