using Microsoft.AspNetCore.Mvc;
using Nexora.Api.DTOs;
using Nexora.Api.Services;

namespace Nexora.Api.Controllers;

[ApiController]
[Route("api/admin")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);
        if (result == null)
        {
            return Unauthorized(new { message = "Invalid username or password" });
        }
        return Ok(result);
    }
}
