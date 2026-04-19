using GymApi.Data;
using GymApi.DTOs;
using GymApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace GymApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly GymDbContext _context;
    private readonly IConfiguration _config;

    public AuthController(GymDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    // POST api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest("El email ya está registrado.");

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok("Usuario registrado correctamente.");
    }

    // POST api/auth/login
    [HttpPost("login")]
    public async Task<ActionResult<TokenDto>> Login(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized("Credenciales incorrectas.");

        var token = GenerateToken(user);
        return Ok(new TokenDto { Token = token });
    }

    private string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    // GET api/auth/me
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserProfileDto>> GetMe()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _context.Users.FindAsync(userId);
        if (user is null) return NotFound();

        return Ok(new UserProfileDto
        {
            Name = user.Name,
            Email = user.Email,
            AvatarBase64 = user.AvatarBase64
        });
    }

    // PUT api/auth/avatar
    [HttpPut("avatar")]
    [Authorize]
    public async Task<IActionResult> UpdateAvatar(AvatarDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.AvatarBase64))
            return BadRequest("Avatar no puede estar vacío.");

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _context.Users.FindAsync(userId);
        if (user is null) return NotFound();

        user.AvatarBase64 = dto.AvatarBase64;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // PUT api/auth/name
    [HttpPut("name")]
    [Authorize]
    public async Task<IActionResult> UpdateName(UpdateNameDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("El nombre no puede estar vacío.");

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _context.Users.FindAsync(userId);
        if (user is null) return NotFound();

        user.Name = dto.Name.Trim();
        await _context.SaveChangesAsync();

        // Devolver nuevo token con el nombre actualizado
        var token = GenerateToken(user);
        return Ok(new TokenDto { Token = token });
    }
}
