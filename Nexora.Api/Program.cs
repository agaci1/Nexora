using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Nexora.Api.Data;
using Nexora.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// ---------- Swagger ----------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Nexora API", Version = "v1" });

    // JWT Bearer in Swagger
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

// ---------- CORS (adjust origin later if needed) ----------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// ---------- DB (Railway MySQL) ----------
var conn = builder.Configuration.GetConnectionString("DefaultConnection");

// Railway usually provides one of these:
conn ??= Environment.GetEnvironmentVariable("mysql://root:fIOAtEIYASmQDbtDdLqpExANOrgWcDEn@mysql.railway.internal:3306/railway");
conn ??= Environment.GetEnvironmentVariable("mysql://root:fIOAtEIYASmQDbtDdLqpExANOrgWcDEn@shinkansen.proxy.rlwy.net:36613/railway");

// If it's mysql://... convert to MySQL connection string
if (!string.IsNullOrWhiteSpace(conn) && conn.StartsWith("mysql://", StringComparison.OrdinalIgnoreCase))
{
    conn = ConnectionStringHelper.FromMySqlUrl(conn);
}

if (string.IsNullOrWhiteSpace(conn))
{
    throw new Exception("Database connection string not found. Set ConnectionStrings:DefaultConnection or MYSQL_URL / MYSQL_PUBLIC_URL.");
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
    // Don't ship like this; only to prevent crash during dev if you forgot env vars.
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

// ---------- DI ----------
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IContentService, ContentService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// (Optional) Migrations/Seed:
// If your Program.cs auto-migrates & seeds, keep it, BUT it will crash if DB env vars are wrong.
// Make sure the connection string points to Railway before running.
try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<NexoraDbContext>();
    db.Database.Migrate();

    // If you have SeedData:
    // await SeedData.InitializeAsync(db, scope.ServiceProvider.GetRequiredService<IConfiguration>());
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
        // mysql://user:pass@host:port/db
        var uri = new Uri(mysqlUrl);

        var userInfo = uri.UserInfo.Split(':', 2);
        var user = Uri.UnescapeDataString(userInfo[0]);
        var pass = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";

        var host = uri.Host;
        var port = uri.Port;
        var db = uri.AbsolutePath.Trim('/');

        // Railway often needs SSL. If your Railway URL works without it, you can remove SslMode.
        return $"Server={host};Port={port};Database={db};User={user};Password={pass};SslMode=Required;";
    }
}