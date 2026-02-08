using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Nexora.Api.Data;
using Nexora.Api.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;

namespace Nexora.Api.Services;

public class AuthService : IAuthService
{
    private readonly NexoraDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(NexoraDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginDto dto)
    {
        var admin = await _context.AdminUsers.FirstOrDefaultAsync(a => a.Username == dto.Username);
        if (admin == null) return null;

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, admin.PasswordHash))
        {
            return null;
        }

        var jwtSecret = _configuration["Jwt:Secret"] 
            ?? Environment.GetEnvironmentVariable("JWT_SECRET")
            ?? "your-super-secret-key-change-in-production-min-32-chars-long";

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(jwtSecret);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.Name, admin.Username),
                new Claim(ClaimTypes.Role, "Admin")
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        return new LoginResponseDto
        {
            Token = tokenString,
            Username = admin.Username
        };
    }
}
