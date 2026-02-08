using Nexora.Api.DTOs;

namespace Nexora.Api.Services;

public interface IOrderService
{
    Task<OrderDto> CreateOrderAsync(CreateOrderDto dto);
    Task<List<OrderDto>> GetOrdersAsync(int page = 1, int pageSize = 20);
    Task<bool> DeleteOrderAsync(int id);
    Task<bool> UpdateOrderStatusAsync(int id, string status);
}
