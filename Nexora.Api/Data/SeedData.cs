using Microsoft.EntityFrameworkCore;
using Nexora.Api.Models;
using BCrypt.Net;

namespace Nexora.Api.Data;

public static class SeedData
{
    public static async Task InitializeAsync(NexoraDbContext context, IConfiguration configuration)
    {
        // Seed Admin User
        if (!await context.AdminUsers.AnyAsync())
        {
            var adminUsername = configuration["Admin:Username"] ?? "admin";
            var adminPassword = configuration["Admin:Password"] ?? "admin123";
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword);

            context.AdminUsers.Add(new AdminUser
            {
                Username = adminUsername,
                PasswordHash = passwordHash
            });
        }

        // Seed Site Content
        if (!await context.SiteContents.AnyAsync())
        {
            context.SiteContents.AddRange(
                new SiteContent
                {
                    Key = "home",
                    HeroTitle = "Welcome to Nexora",
                    HeroSubtitle = "Your Premier Fashion Destination",
                    HeroImageUrl = "/images/hero-placeholder.jpg",
                    ContentText = "Discover the latest trends in fashion and style."
                },
                new SiteContent
                {
                    Key = "about",
                    ContentText = "Nexora is a leading fashion retailer committed to providing high-quality clothing and accessories for everyone. We believe in style, comfort, and sustainability.",
                    ContentImage1Url = "/images/about-1-placeholder.jpg",
                    ContentImage2Url = "/images/about-2-placeholder.jpg"
                }
            );
        }

        // Seed Sample Products
        if (!await context.Products.AnyAsync())
        {
            var products = new List<Product>
            {
                new Product
                {
                    Name = "Classic White T-Shirt",
                    Price = 29.99m,
                    GenderType = "unisex",
                    Category = "T-Shirts",
                    Description = "Comfortable cotton t-shirt. Available in sizes S, M, L, XL.",
                    CreatedAt = DateTime.UtcNow,
                    Images = new List<ProductImage>
                    {
                        new ProductImage { ImageUrl = "/images/products/tshirt-1.jpg", DisplayOrder = 0 }
                    }
                },
                new Product
                {
                    Name = "Slim Fit Jeans",
                    Price = 79.99m,
                    GenderType = "male",
                    Category = "Trousers",
                    Description = "Premium denim jeans with perfect fit. Sizes: 28-38.",
                    CreatedAt = DateTime.UtcNow,
                    Images = new List<ProductImage>
                    {
                        new ProductImage { ImageUrl = "/images/products/jeans-1.jpg", DisplayOrder = 0 }
                    }
                },
                new Product
                {
                    Name = "Elegant Summer Dress",
                    Price = 89.99m,
                    GenderType = "female",
                    Category = "Dresses",
                    Description = "Beautiful summer dress perfect for any occasion. Sizes: XS, S, M, L.",
                    CreatedAt = DateTime.UtcNow,
                    Images = new List<ProductImage>
                    {
                        new ProductImage { ImageUrl = "/images/products/dress-1.jpg", DisplayOrder = 0 }
                    }
                }
            };

            context.Products.AddRange(products);
        }

        await context.SaveChangesAsync();
    }
}
