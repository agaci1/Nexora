using Microsoft.EntityFrameworkCore;
using Nexora.Api.Data;
using Nexora.Api.DTOs;
using Nexora.Api.Models;

namespace Nexora.Api.Services;

public class OrderService : IOrderService
{
    private readonly NexoraDbContext _context;

    public OrderService(NexoraDbContext context)
    {
        _context = context;
    }

    public async Task<OrderDto> CreateOrderAsync(CreateOrderDto dto)
    {
        var totalAmount = dto.Items.Sum(item => item.Price * item.Quantity);

        var order = new Order
        {
            CustomerName = dto.CustomerName,
            CustomerEmail = dto.CustomerEmail,
            ContactNumber = dto.ContactNumber,
            Country = dto.Country,
            StateProvince = dto.StateProvince,
            City = dto.City,
            PostCode = dto.PostCode,
            Notes = dto.Notes,
            TotalAmount = totalAmount,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        foreach (var itemDto in dto.Items)
        {
            var orderItem = new OrderItem
            {
                OrderId = order.Id,
                ProductId = itemDto.ProductId,
                ProductName = itemDto.ProductName,
                Price = itemDto.Price,
                Quantity = itemDto.Quantity,
                LineTotal = itemDto.Price * itemDto.Quantity,
                ProductImageUrl = itemDto.ProductImageUrl
            };
            _context.OrderItems.Add(orderItem);
        }

        await _context.SaveChangesAsync();

        return new OrderDto
        {
            Id = order.Id,
            CustomerName = order.CustomerName,
            CustomerEmail = order.CustomerEmail,
            ContactNumber = order.ContactNumber,
            Country = order.Country,
            StateProvince = order.StateProvince,
            City = order.City,
            PostCode = order.PostCode,
            Notes = order.Notes,
            TotalAmount = order.TotalAmount,
            Status = order.Status,
            CreatedAt = order.CreatedAt,
            Items = dto.Items
        };
    }

    public async Task<List<OrderDto>> GetOrdersAsync(int page = 1, int pageSize = 20)
    {
        var orders = await _context.Orders
            .Include(o => o.OrderItems)
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return orders.Select(o => new OrderDto
        {
            Id = o.Id,
            CustomerName = o.CustomerName,
            CustomerEmail = o.CustomerEmail,
            ContactNumber = o.ContactNumber,
            Country = o.Country,
            StateProvince = o.StateProvince,
            City = o.City,
            PostCode = o.PostCode,
            Notes = o.Notes,
            TotalAmount = o.TotalAmount,
            Status = o.Status,
            CreatedAt = o.CreatedAt,
            Items = o.OrderItems.Select(oi => new OrderItemDto
            {
                ProductId = oi.ProductId,
                ProductName = oi.ProductName,
                Price = oi.Price,
                Quantity = oi.Quantity,
                ProductImageUrl = oi.ProductImageUrl
            }).ToList()
        }).ToList();
    }

    public async Task<bool> DeleteOrderAsync(int id)
    {
        // ✅ Must delete children first to avoid FK errors
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return false;

        if (order.OrderItems.Any())
        {
            _context.OrderItems.RemoveRange(order.OrderItems);
        }

        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateOrderStatusAsync(int id, string status)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return false;

        order.Status = status;
        await _context.SaveChangesAsync();
        return true;
    }
}