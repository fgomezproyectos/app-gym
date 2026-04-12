using GymApi.Data;
using GymApi.DTOs;
using GymApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExercisesController : ControllerBase
{
    private readonly GymDbContext _context;

    public ExercisesController(GymDbContext context)
    {
        _context = context;
    }

    // GET api/exercises
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExerciseDto>>> GetAll()
    {
        var exercises = await _context.Exercises
            .Select(e => new ExerciseDto
            {
                Id = e.Id,
                Name = e.Name,
                MuscleGroup = e.MuscleGroup,
                Description = e.Description
            })
            .ToListAsync();

        return Ok(exercises);
    }

    // GET api/exercises/5
    [HttpGet("{id}")]
    public async Task<ActionResult<ExerciseDto>> GetById(int id)
    {
        var exercise = await _context.Exercises.FindAsync(id);
        if (exercise is null) return NotFound();

        return Ok(new ExerciseDto
        {
            Id = exercise.Id,
            Name = exercise.Name,
            MuscleGroup = exercise.MuscleGroup,
            Description = exercise.Description
        });
    }

    // POST api/exercises
    [HttpPost]
    public async Task<ActionResult<ExerciseDto>> Create(ExerciseUpsertDto dto)
    {
        var exercise = new Exercise
        {
            Name = dto.Name,
            MuscleGroup = dto.MuscleGroup,
            Description = dto.Description
        };

        _context.Exercises.Add(exercise);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = exercise.Id }, new ExerciseDto
        {
            Id = exercise.Id,
            Name = exercise.Name,
            MuscleGroup = exercise.MuscleGroup,
            Description = exercise.Description
        });
    }

    // PUT api/exercises/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, ExerciseUpsertDto dto)
    {
        var exercise = await _context.Exercises.FindAsync(id);
        if (exercise is null) return NotFound();

        exercise.Name = dto.Name;
        exercise.MuscleGroup = dto.MuscleGroup;
        exercise.Description = dto.Description;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE api/exercises/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var exercise = await _context.Exercises.FindAsync(id);
        if (exercise is null) return NotFound();

        _context.Exercises.Remove(exercise);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
