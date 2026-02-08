# Nexora - Full-Stack E-Commerce Application

A production-ready full-stack web application for an online shopping business built with ASP.NET Core Web API (.NET 8) and vanilla JavaScript.

## Tech Stack

- **Backend**: C# ASP.NET Core Web API (.NET 8), REST
- **Database**: MySQL on Railway (via Pomelo.EntityFrameworkCore.MySql)
- **ORM**: Entity Framework Core
- **Frontend**: HTML + CSS + Vanilla JavaScript
- **Authentication**: JWT Bearer Tokens
- **Image Storage**: Cloudinary (via Node.js service)
- **Hosting**: Railway (API + DB + Cloudinary Service + Static Files)

## Features

### Customer Features
- Browse products by gender (Male/Female) and category
- Product details with image carousel
- Shopping cart with localStorage persistence
- Checkout flow with WhatsApp integration
- Dynamic Home and About pages (CMS-managed)

### Admin Features
- JWT-based authentication
- Product CRUD operations
- Multiple image/video uploads per product (via Cloudinary)
- Order management (view, delete, update status)
- Content management for Home and About pages

## Project Structure

```
Nexora/
├── Nexora.Api/          # ASP.NET Core Web API
│   ├── Controllers/    # API Controllers
│   ├── Data/           # DbContext and Seed Data
│   ├── DTOs/           # Data Transfer Objects
│   ├── Models/         # Entity Models
│   ├── Migrations/      # EF Core Migrations
│   ├── Services/        # Business Logic Services
│   ├── wwwroot/        # Frontend Static Files
│   │   ├── index.html  # Main customer-facing pages
│   │   ├── admin.html  # Admin dashboard
│   │   ├── app.js      # Main application logic
│   │   ├── admin.js     # Admin dashboard logic
│   │   ├── styles.css   # Main stylesheet
│   │   └── admin.css    # Admin stylesheet
│   └── Program.cs       # Application entry point
└── cloudinary-service/  # Node.js Cloudinary upload service
    ├── index.js         # Express server for Cloudinary uploads
    └── package.json     # Node.js dependencies
```

## Local Development Setup

### Prerequisites

- .NET 8 SDK
- MySQL Server (or use Railway MySQL)
- Node.js 18+ (for Cloudinary service)
- Cloudinary account (free tier available)

### Steps

1. **Clone and navigate to the project**
   ```bash
   cd Nexora.Api
   ```

2. **Configure database connection**
   
   Update `appsettings.json` with your MySQL connection string:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=nexora;User=root;Password=yourpassword;Port=3306;"
     }
   }
   ```

3. **Run migrations**
   ```bash
   dotnet ef database update
   ```
   
   Or if migrations need to be created:
   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

4. **Set up Cloudinary service**
   
   ```bash
   cd cloudinary-service
   npm install
   cp .env.example .env
   # Edit .env with your Cloudinary credentials
   npm start
   ```
   
   The service will run on `http://localhost:3001` by default.

5. **Configure admin credentials**
   
   Update `appsettings.json`:
   ```json
   {
     "Admin": {
       "Username": "admin",
       "Password": "your-secure-password"
     },
     "Jwt": {
       "Secret": "your-super-secret-key-min-32-chars-long"
     },
     "WhatsApp": {
       "OwnerPhone": "+1234567890"
     },
     "Cloudinary": {
       "ServiceUrl": "http://localhost:3001"
     }
   }
   ```

6. **Run the API application**
   ```bash
   cd Nexora.Api
   dotnet run
   ```

7. **Access the application**
   - Customer site: http://localhost:5000
   - Admin dashboard: http://localhost:5000/admin.html
   - API Swagger: http://localhost:5000/swagger (in Development)
   - Cloudinary service: http://localhost:3001

## Railway Deployment

### Prerequisites

- Railway account
- Railway CLI (optional, can use web interface)

### Steps

1. **Create a new Railway project**
   - Go to [Railway](https://railway.app)
   - Create a new project
   - Add a MySQL service

2. **Get MySQL connection string**
   - In Railway MySQL service, copy the connection string
   - Format: `Server=...;Database=...;User=...;Password=...;Port=...;`

3. **Deploy the Cloudinary Service**
   - Add a new service in Railway
   - Connect to `cloudinary-service` directory
   - Set environment variables:
     ```
     PORT=3001
     CLOUDINARY_CLOUD_NAME=your-cloud-name
     CLOUDINARY_API_KEY=your-api-key
     CLOUDINARY_API_SECRET=your-api-secret
     ```
   - Railway will auto-detect Node.js and run `npm start`

4. **Deploy the API**
   - Add another service in Railway
   - Connect to `Nexora.Api` directory
   - Add environment variables:
     ```
     DATABASE_URL=<your-mysql-connection-string>
     JWT_SECRET=<your-jwt-secret-min-32-chars>
     WHATSAPP_PHONE=<your-whatsapp-phone-number>
     CLOUDINARY_SERVICE_URL=<railway-cloudinary-service-url>
     ASPNETCORE_ENVIRONMENT=Production
     ADMIN_USERNAME=admin
     ADMIN_PASSWORD=<your-secure-password>
     ```
   - Configure build settings:
     - Build command: `dotnet build`
     - Start command: `dotnet Nexora.Api.dll`
     - Root directory: `Nexora.Api`

5. **Run migrations on Railway**
   
   Migrations run automatically on startup (configured in Program.cs)

6. **Configure static files**
   - Railway serves static files from `wwwroot` automatically
   - No local uploads needed - all images go to Cloudinary

7. **Set up admin user**
   - The seed data creates an admin user on first run
   - Use environment variables for credentials in production
   - Change default credentials!

## Environment Variables

### API Service
```bash
DATABASE_URL=Server=...;Database=...;User=...;Password=...;Port=...;
JWT_SECRET=your-super-secret-key-min-32-chars-long
WHATSAPP_PHONE=+1234567890
CLOUDINARY_SERVICE_URL=http://localhost:3001  # or Railway service URL
ASPNETCORE_ENVIRONMENT=Production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

### Cloudinary Service
```bash
PORT=3001
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## API Endpoints

### Public Endpoints

- `GET /api/products?gender={gender}&category={category}&page={page}&pageSize={size}` - Get products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/content/home` - Get home page content
- `GET /api/content/about` - Get about page content
- `POST /api/orders` - Create order
- `GET /api/config/whatsapp` - Get WhatsApp phone number

### Admin Endpoints (JWT Required)

- `POST /api/admin/login` - Admin login
- `POST /api/admin/products` - Create product
- `GET /api/admin/products/{id}` - Get product
- `DELETE /api/admin/products/{id}` - Delete product
- `POST /api/admin/products/{id}/images` - Upload product images
- `GET /api/admin/orders?page={page}&pageSize={size}` - Get orders
- `DELETE /api/admin/orders/{id}` - Delete order
- `PUT /api/admin/orders/{id}/status` - Update order status
- `PUT /api/admin/content/home` - Update home content
- `PUT /api/admin/content/about` - Update about content

## Database Schema

### Tables

- **Products**: Product information (name, price, gender, category, description)
- **ProductImages**: Product images with display order
- **Orders**: Customer orders with shipping information
- **OrderItems**: Order line items
- **SiteContents**: Dynamic content for Home and About pages
- **AdminUsers**: Admin user accounts (hashed passwords)

### Indexes

- Products: `GenderType`, `Category`, `CreatedAt`
- OrderItems: `OrderId`, `ProductId`
- SiteContents: `Key` (unique)

## Key Features Implementation

### Cart Persistence
- Cart is stored in `localStorage` as `nexora_cart`
- Automatically restored on page load
- Persists across page refreshes

### WhatsApp Checkout
- Order is saved to database first
- Then redirects to WhatsApp with pre-filled message
- Message includes customer details and cart items

### Gender/Category Filtering
- Users select Male or Female
- Categories shown based on gender selection
- Dresses category only visible for Female
- Unisex products appear in both genders

### Image/Video Uploads
- Images and videos uploaded to Cloudinary via Node.js service
- Multiple images/videos per product supported
- First image is primary (shown in product cards)
- Automatic optimization and format conversion

## Admin Dashboard

Access: `/admin.html`

Features:
- Product management (add, delete, upload images)
- Order management (view, delete, update status)
- Content management (edit Home and About pages)

Login:
- Click the lock icon in the main navigation
- Confirm you are an admin
- Enter credentials

## Security Notes

- Admin passwords are hashed using BCrypt
- JWT tokens expire after 7 days
- Admin endpoints require JWT authentication
- CORS is configured to allow all origins (adjust for production)
- Change default admin credentials in production!

## Troubleshooting

### Migration Issues
```bash
# Remove existing migrations and recreate
dotnet ef migrations remove
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### Database Connection Issues
- Verify connection string format
- Ensure MySQL server is running
- Check firewall/network settings

### Image Upload Issues
- Ensure `wwwroot/uploads/products` directory exists
- Check file permissions
- Verify file size limits in `Program.cs`

### CORS Issues
- Adjust CORS policy in `Program.cs` for production
- Ensure frontend URL is allowed

## License

This project is proprietary software for Nexora.

## Support

For issues or questions, contact the development team.
