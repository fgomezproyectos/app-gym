using GymApi.Data;
using GymApi.DTOs;
using GymApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GymApi.Controllers;

[ApiController]
[Route("api/daily-goals")]
[Authorize]
public class DailyGoalsController : ControllerBase
{
    private readonly GymDbContext _context;

    public DailyGoalsController(GymDbContext context)
    {
        _context = context;
    }

    private int UserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET api/daily-goals?date=yyyy-MM-dd
    // Si no existen registros para ese día los genera automáticamente desde Goals.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DailyGoalLogDto>>> GetDay(
        [FromQuery] string? date)
    {
        var day = date is not null && DateOnly.TryParse(date, out var parsed)
            ? parsed
            : DateOnly.FromDateTime(DateTime.UtcNow);

        var existing = await _context.DailyGoalLogs
            .Where(d => d.UserId == UserId && d.Date == day)
            .ToListAsync();

        // Auto-generación desde defaults si no hay nada para ese día
        if (existing.Count == 0)
        {
            var defaults = await _context.Goals
                .Where(g => g.UserId == UserId)
                .OrderBy(g => g.CreatedAt)
                .ToListAsync();

            if (defaults.Count > 0)
            {
                var logs = defaults.Select(g => new DailyGoalLog
                {
                    UserId = UserId,
                    GoalId = g.Id,
                    Label = g.Label,
                    Date = day,
                    Done = false,
                    IsDefault = true
                }).ToList();

                _context.DailyGoalLogs.AddRange(logs);
                await _context.SaveChangesAsync();
                existing = logs;
            }
        }

        var result = existing.Select(d => new DailyGoalLogDto
        {
            Id = d.Id,
            GoalId = d.GoalId,
            Label = d.Label,
            Done = d.Done,
            IsDefault = d.IsDefault
        });

        return Ok(result);
    }

    // POST api/daily-goals  — añade un goal puntual (solo para ese día)
    [HttpPost]
    public async Task<ActionResult<DailyGoalLogDto>> Create(CreateDailyGoalDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Label))
            return BadRequest("El label no puede estar vacío.");

        if (!DateOnly.TryParse(dto.Date, out var day))
            return BadRequest("Fecha inválida. Formato esperado: yyyy-MM-dd.");

        var log = new DailyGoalLog
        {
            UserId = UserId,
            GoalId = null,
            Label = dto.Label.Trim(),
            Date = day,
            Done = false,
            IsDefault = false
        };

        _context.DailyGoalLogs.Add(log);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetDay), new { date = dto.Date }, new DailyGoalLogDto
        {
            Id = log.Id,
            GoalId = null,
            Label = log.Label,
            Done = false,
            IsDefault = false
        });
    }

    // PATCH api/daily-goals/{id}  — marcar como hecho/no hecho
    [HttpPatch("{id:int}")]
    public async Task<IActionResult> Patch(int id, PatchDailyGoalDto dto)
    {
        var log = await _context.DailyGoalLogs
            .FirstOrDefaultAsync(d => d.Id == id && d.UserId == UserId);

        if (log is null) return NotFound();

        log.Done = dto.Done;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE api/daily-goals/{id}  — solo permite borrar goals puntuales
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var log = await _context.DailyGoalLogs
            .FirstOrDefaultAsync(d => d.Id == id && d.UserId == UserId);

        if (log is null) return NotFound();
        if (log.IsDefault) return BadRequest("Los goals predeterminados no se pueden eliminar desde aquí. Elimínalos desde el sidebar.");

        _context.DailyGoalLogs.Remove(log);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // GET api/daily-goals/streak  — racha de días con al menos 1 goal completado
    [HttpGet("streak")]
    public async Task<ActionResult<int>> GetStreak()
    {
        var doneDates = await _context.DailyGoalLogs
            .Where(d => d.UserId == UserId && d.Done)
            .Select(d => d.Date)
            .Distinct()
            .ToListAsync();

        var doneSet = new HashSet<DateOnly>(doneDates);
        var streak = 0;
        var day = DateOnly.FromDateTime(DateTime.UtcNow);

        while (doneSet.Contains(day))
        {
            streak++;
            day = day.AddDays(-1);
        }

        return Ok(streak);
    }
}
