using Nexora.Api.DTOs;

namespace Nexora.Api.Services;

public interface IContentService
{
    Task<ContentDto?> GetContentAsync(string key);
    Task<ContentDto> UpdateContentAsync(string key, ContentDto dto);
}
