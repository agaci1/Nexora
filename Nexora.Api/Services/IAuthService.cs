using Nexora.Api.DTOs;

namespace Nexora.Api.Services;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginDto dto);
}
