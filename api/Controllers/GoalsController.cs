using GymApi.Data;
using GymApi.DTOs;
using GymApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GymApi.Controllers;

[ApiController]
[Route("api/goals")]
[Authorize]
public class GoalsController : ControllerBase
{
    private readonly GymDbContext _context;

    public GoalsController(GymDbContext context)
    {
        _context = context;
    }

    private int UserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET api/goals
    [HttpGet]
    public async Task<ActionResult<IEnumerable<GoalDto>>> GetAll()
    {
        var goals = await _context.Goals
            .Where(g => g.UserId == UserId)
            .OrderBy(g => g.CreatedAt)
            .Select(g => new GoalDto { Id = g.Id, Label = g.Label })
            .ToListAsync();

        return Ok(goals);
    }

    // POST api/goals
    [HttpPost]
    public async Task<ActionResult<GoalDto>> Create(CreateGoalDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Label))
            return BadRequest("El label no puede estar vacío.");

        var goal = new Goal
        {
            UserId = UserId,
            Label = dto.Label.Trim()
        };

        _context.Goals.Add(goal);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new GoalDto { Id = goal.Id, Label = goal.Label });
    }

    // DELETE api/goals/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var goal = await _context.Goals
            .FirstOrDefaultAsync(g => g.Id == id && g.UserId == UserId);

        if (goal is null) return NotFound();

        // Eliminar el daily log de HOY (si existe) para que desaparezca del dashboard.
        // Los logs de días anteriores se desvinculan (GoalId → null) conservando el historial.
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var todayLog = await _context.DailyGoalLogs
            .FirstOrDefaultAsync(d => d.GoalId == id && d.UserId == UserId && d.Date == today);
        if (todayLog is not null)
            _context.DailyGoalLogs.Remove(todayLog);

        _context.Goals.Remove(goal);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
