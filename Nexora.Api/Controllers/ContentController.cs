using Microsoft.AspNetCore.Mvc;
using Nexora.Api.DTOs;
using Nexora.Api.Services;

namespace Nexora.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContentController : ControllerBase
{
    private readonly IContentService _contentService;

    public ContentController(IContentService contentService)
    {
        _contentService = contentService;
    }

    [HttpGet("home")]
    public async Task<ActionResult<ContentDto>> GetHomeContent()
    {
        var content = await _contentService.GetContentAsync("home");
        if (content == null) return NotFound();
        return Ok(content);
    }

    [HttpGet("about")]
    public async Task<ActionResult<ContentDto>> GetAboutContent()
    {
        var content = await _contentService.GetContentAsync("about");
        if (content == null) return NotFound();
        return Ok(content);
    }
}
