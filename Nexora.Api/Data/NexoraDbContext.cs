using Microsoft.EntityFrameworkCore;
using Nexora.Api.Models;

namespace Nexora.Api.Data;

public class NexoraDbContext : DbContext
{
    public NexoraDbContext(DbContextOptions<NexoraDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products { get; set; }
    public DbSet<ProductImage> ProductImages { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<SiteContent> SiteContents { get; set; }
    public DbSet<AdminUser> AdminUsers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Product indexes
        modelBuilder.Entity<Product>()
            .HasIndex(p => p.GenderType)
            .HasDatabaseName("IX_Products_GenderType");
        
        modelBuilder.Entity<Product>()
            .HasIndex(p => p.Category)
            .HasDatabaseName("IX_Products_Category");
        
        modelBuilder.Entity<Product>()
            .HasIndex(p => p.CreatedAt)
            .HasDatabaseName("IX_Products_CreatedAt");

        // ProductImage
        modelBuilder.Entity<ProductImage>()
            .HasOne(pi => pi.Product)
            .WithMany(p => p.Images)
            .HasForeignKey(pi => pi.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProductImage>()
            .HasIndex(pi => pi.ProductId)
            .HasDatabaseName("IX_ProductImages_ProductId");

        // OrderItem indexes
        modelBuilder.Entity<OrderItem>()
            .HasOne(oi => oi.Order)
            .WithMany(o => o.OrderItems)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<OrderItem>()
            .HasIndex(oi => oi.OrderId)
            .HasDatabaseName("IX_OrderItems_OrderId");

        modelBuilder.Entity<OrderItem>()
            .HasIndex(oi => oi.ProductId)
            .HasDatabaseName("IX_OrderItems_ProductId");

        // SiteContent unique key
        modelBuilder.Entity<SiteContent>()
            .HasIndex(sc => sc.Key)
            .IsUnique()
            .HasDatabaseName("IX_SiteContents_Key");
    }
}
