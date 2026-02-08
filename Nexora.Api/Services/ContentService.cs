using Microsoft.EntityFrameworkCore;
using Nexora.Api.Data;
using Nexora.Api.DTOs;
using Nexora.Api.Models;

namespace Nexora.Api.Services;

public class ContentService : IContentService
{
    private readonly NexoraDbContext _context;

    public ContentService(NexoraDbContext context)
    {
        _context = context;
    }

    public async Task<ContentDto?> GetContentAsync(string key)
    {
        var content = await _context.SiteContents.FirstOrDefaultAsync(c => c.Key == key);
        if (content == null) return null;

        return new ContentDto
        {
            HeroTitle = content.HeroTitle,
            HeroSubtitle = content.HeroSubtitle,
            HeroImageUrl = content.HeroImageUrl,
            ContentText = content.ContentText,
            ContentImage1Url = content.ContentImage1Url,
            ContentImage2Url = content.ContentImage2Url
        };
    }

    public async Task<ContentDto> UpdateContentAsync(string key, ContentDto dto)
    {
        var content = await _context.SiteContents.FirstOrDefaultAsync(c => c.Key == key);
        
        if (content == null)
        {
            content = new SiteContent { Key = key };
            _context.SiteContents.Add(content);
        }

        content.HeroTitle = dto.HeroTitle;
        content.HeroSubtitle = dto.HeroSubtitle;
        content.HeroImageUrl = dto.HeroImageUrl;
        content.ContentText = dto.ContentText;
        content.ContentImage1Url = dto.ContentImage1Url;
        content.ContentImage2Url = dto.ContentImage2Url;
        content.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new ContentDto
        {
            HeroTitle = content.HeroTitle,
            HeroSubtitle = content.HeroSubtitle,
            HeroImageUrl = content.HeroImageUrl,
            ContentText = content.ContentText,
            ContentImage1Url = content.ContentImage1Url,
            ContentImage2Url = content.ContentImage2Url
        };
    }
}
