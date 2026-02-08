using Nexora.Api.DTOs;

namespace Nexora.Api.Services;

public interface IProductService
{
    Task<List<ProductDto>> GetProductsAsync(string? gender = null, string? category = null, int page = 1, int pageSize = 20);
    Task<ProductDto?> GetProductByIdAsync(int id);
    Task<ProductDto> CreateProductAsync(CreateProductDto dto);
    Task<bool> DeleteProductAsync(int id);
}
