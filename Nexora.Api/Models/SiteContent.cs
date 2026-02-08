namespace Nexora.Api.Models;

public class SiteContent
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty; // "home", "about"
    public string? HeroTitle { get; set; }
    public string? HeroSubtitle { get; set; }
    public string? HeroImageUrl { get; set; }
    public string? ContentText { get; set; }
    public string? ContentImage1Url { get; set; }
    public string? ContentImage2Url { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
