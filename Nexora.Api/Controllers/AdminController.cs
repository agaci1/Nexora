using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nexora.Api.Data;
using Nexora.Api.DTOs;
using Nexora.Api.Models;
using Nexora.Api.Services;

namespace Nexora.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IOrderService _orderService;
    private readonly IContentService _contentService;
    private readonly IWebHostEnvironment _environment;

    public AdminController(
        IProductService productService,
        IOrderService orderService,
        IContentService contentService,
        IWebHostEnvironment environment)
    {
        _productService = productService;
        _orderService = orderService;
        _contentService = contentService;
        _environment = environment;
    }

    // Products
    [HttpPost("products")]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductDto dto)
    {
        var product = await _productService.CreateProductAsync(dto);
        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }

    [HttpGet("products/{id}")]
    public async Task<ActionResult<ProductDto>> GetProduct(int id)
    {
        var product = await _productService.GetProductByIdAsync(id);
        if (product == null) return NotFound();
        return Ok(product);
    }

    [HttpDelete("products/{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var result = await _productService.DeleteProductAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPost("products/{id}/images")]
    public async Task<ActionResult<List<string>>> UploadProductImages(int id, [FromBody] List<string> imageUrls)
    {
        if (imageUrls == null || imageUrls.Count == 0)
        {
            return BadRequest("No image URLs provided");
        }

        using var scope = HttpContext.RequestServices.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NexoraDbContext>();
        var product = await db.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound("Product not found");
        }

        var maxOrder = await db.ProductImages
            .Where(pi => pi.ProductId == id)
            .Select(pi => (int?)pi.DisplayOrder)
            .MaxAsync() ?? -1;

        foreach (var imageUrl in imageUrls)
        {
            db.ProductImages.Add(new ProductImage
            {
                ProductId = id,
                ImageUrl = imageUrl,
                DisplayOrder = ++maxOrder
            });
        }

        await db.SaveChangesAsync();

        return Ok(imageUrls);
    }

    [HttpGet("products")]
    public async Task<ActionResult<List<ProductDto>>> GetProducts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
         var products = await _productService.GetProductsAsync(null, null, page, pageSize);
        return Ok(products);
    }

    // Orders
    [HttpGet("orders")]
    public async Task<ActionResult<List<OrderDto>>> GetOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var orders = await _orderService.GetOrdersAsync(page, pageSize);
        return Ok(orders);
    }

    [HttpDelete("orders/{id}")]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        var result = await _orderService.DeleteOrderAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPut("orders/{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] string status)
    {
        var result = await _orderService.UpdateOrderStatusAsync(id, status);
        if (!result) return NotFound();
        return NoContent();
    }

    // Content
    [HttpPut("content/home")]
    public async Task<ActionResult<ContentDto>> UpdateHomeContent([FromBody] ContentDto dto)
    {
        var content = await _contentService.UpdateContentAsync("home", dto);
        return Ok(content);
    }

    [HttpPut("content/about")]
    public async Task<ActionResult<ContentDto>> UpdateAboutContent([FromBody] ContentDto dto)
    {
        var content = await _contentService.UpdateContentAsync("about", dto);
        return Ok(content);
    }
}
