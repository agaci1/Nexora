namespace Nexora.Api.Models;

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }
    public string? ProductImageUrl { get; set; }
    
    // Navigation
    public Order Order { get; set; } = null!;
    public Product? Product { get; set; }
}
