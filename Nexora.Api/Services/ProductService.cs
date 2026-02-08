using Microsoft.EntityFrameworkCore;
using Nexora.Api.Data;
using Nexora.Api.DTOs;
using Nexora.Api.Models;

namespace Nexora.Api.Services;

public class ProductService : IProductService
{
    private readonly NexoraDbContext _context;

    public ProductService(NexoraDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductDto>> GetProductsAsync(string? gender = null, string? category = null, int page = 1, int pageSize = 20)
    {
        var query = _context.Products
            .Include(p => p.Images) // ✅ do NOT order inside Include
            .AsQueryable();

        // Filter by gender: if gender is specified, show products that match OR are unisex
        if (!string.IsNullOrEmpty(gender))
        {
            query = query.Where(p => p.GenderType == gender || p.GenderType == "unisex");
        }

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(p => p.Category == category);
        }

        var products = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return products.Select(p => new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            Price = p.Price,
            GenderType = p.GenderType,
            Category = p.Category,
            Description = p.Description,
            ImageUrls = p.Images
                .OrderBy(pi => pi.DisplayOrder)
                .Select(pi => pi.ImageUrl)
                .ToList()
        }).ToList();
    }

    public async Task<ProductDto?> GetProductByIdAsync(int id)
    {
        var product = await _context.Products
            .Include(p => p.Images) // ✅ do NOT order inside Include
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null) return null;

        return new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Price = product.Price,
            GenderType = product.GenderType,
            Category = product.Category,
            Description = product.Description,
            ImageUrls = product.Images
                .OrderBy(pi => pi.DisplayOrder)
                .Select(pi => pi.ImageUrl)
                .ToList()
        };
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Price = dto.Price,
            GenderType = dto.GenderType,
            Category = dto.Category,
            Description = dto.Description,
            CreatedAt = DateTime.UtcNow
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Price = product.Price,
            GenderType = product.GenderType,
            Category = product.Category,
            Description = product.Description,
            ImageUrls = new List<string>()
        };
    }

    public async Task<bool> DeleteProductAsync(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return false;

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return true;
    }
}