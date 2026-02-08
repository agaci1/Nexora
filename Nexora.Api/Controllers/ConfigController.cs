using Microsoft.AspNetCore.Mvc;

namespace Nexora.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConfigController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public ConfigController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpGet("whatsapp")]
    public IActionResult GetWhatsAppPhone()
    {
        var phone = _configuration["WhatsApp:OwnerPhone"] 
            ?? Environment.GetEnvironmentVariable("WHATSAPP_PHONE")
            ?? "+1234567890";
        return Ok(phone);
    }

    [HttpGet("cloudinary-service")]
    public IActionResult GetCloudinaryServiceUrl()
    {
        var url = _configuration["Cloudinary:ServiceUrl"] 
            ?? Environment.GetEnvironmentVariable("CLOUDINARY_SERVICE_URL")
            ?? "http://localhost:3001";
        return Ok(url);
    }
}
