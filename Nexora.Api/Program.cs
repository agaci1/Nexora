using System.Text;
using BCrypt.Net;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Nexora.Api.Data;
using Nexora.Api.Models;
using Nexora.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// ---------- Swagger ----------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Nexora API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {your_token}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ---------- CORS ----------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// ---------- DB (Railway MySQL) ----------
var conn =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
    ?? Environment.GetEnvironmentVariable("MYSQL_URL")
    ?? Environment.GetEnvironmentVariable("MYSQL_PUBLIC_URL");

if (!string.IsNullOrWhiteSpace(conn) &&
    conn.StartsWith("mysql://", StringComparison.OrdinalIgnoreCase))
{
    conn = ConnectionStringHelper.FromMySqlUrl(conn);
}

if (string.IsNullOrWhiteSpace(conn))
{
    throw new Exception(
        "Database connection string not found. " +
        "Set ConnectionStrings:DefaultConnection, or env var ConnectionStrings__DefaultConnection / MYSQL_URL / MYSQL_PUBLIC_URL.");
}

builder.Services.AddDbContext<NexoraDbContext>(opt =>
    opt.UseMySql(conn, ServerVersion.AutoDetect(conn))
);

// ---------- JWT ----------
var jwtSecret =
    builder.Configuration["Jwt:Secret"]
    ?? Environment.GetEnvironmentVariable("JWT_SECRET");

if (string.IsNullOrWhiteSpace(jwtSecret))
{
    jwtSecret = "CHANGE_ME_CHANGE_ME_CHANGE_ME_MIN_32_CHARS";
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(2)
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddHealthChecks();

// ---------- DI ----------
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IContentService, ContentService>();

// ---------- ALWAYS bind to Railway PORT ----------
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

var app = builder.Build();

// Swagger also in Production
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Nexora API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health + root (only once)
app.MapGet("/", () => Results.Ok("Nexora API is running ✅"));
app.MapHealthChecks("/health");

// ---------- Auto-migrate + Seed Admin ----------
try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<NexoraDbContext>();

    await db.Database.MigrateAsync();

    var adminUsername =
        builder.Configuration["Admin:Username"]
        ?? Environment.GetEnvironmentVariable("Admin__Username");

    var adminPassword =
        builder.Configuration["Admin:Password"]
        ?? Environment.GetEnvironmentVariable("Admin__Password");

    if (!string.IsNullOrWhiteSpace(adminUsername) && !string.IsNullOrWhiteSpace(adminPassword))
    {
        var exists = await db.AdminUsers.AnyAsync(a => a.Username == adminUsername);

        if (!exists)
        {
            db.AdminUsers.Add(new AdminUser
            {
                Username = adminUsername,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
                CreatedAt = DateTime.UtcNow
            });

            await db.SaveChangesAsync();
            app.Logger.LogInformation("Seeded initial admin user: {Username}", adminUsername);
        }
    }
    else
    {
        app.Logger.LogWarning("Admin seed skipped: Admin__Username/Admin__Password not set.");
    }
}
catch (Exception ex)
{
    app.Logger.LogError(ex, "Error running migrations/seed");
}

app.Run();

// ================= Helpers =================
static class ConnectionStringHelper
{
    public static string FromMySqlUrl(string mysqlUrl)
    {
        var uri = new Uri(mysqlUrl);

        var userInfo = uri.UserInfo.Split(':', 2);
        var user = Uri.UnescapeDataString(userInfo[0]);
        var pass = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";

        var host = uri.Host;
        var port = uri.Port;
        var db = uri.AbsolutePath.Trim('/');

        return $"Server={host};Port={port};Database={db};User={user};Password={pass};SslMode=Required;";
    }
}