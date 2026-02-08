# Nexora Quick Start Guide

## Quick Local Setup

1. **Install Prerequisites**
   - .NET 8 SDK
   - MySQL Server

2. **Configure Database**
   ```bash
   # Update appsettings.json with your MySQL connection string
   ```

3. **Run Migrations**
   ```bash
   cd Nexora.Api
   dotnet ef database update
   ```

4. **Run Application**
   ```bash
   dotnet run
   ```

5. **Access Application**
   - Customer site: http://localhost:5000
   - Admin: http://localhost:5000/admin.html
   - Default admin: username `admin`, password `admin123` (change in production!)

## Key Features

✅ **Customer Features**
- Browse products by gender (Male/Female) and category
- Product details with image carousel
- Shopping cart with localStorage persistence
- Checkout with WhatsApp integration
- Dynamic Home/About pages

✅ **Admin Features**
- Product CRUD with image uploads
- Order management
- Content management (Home/About)

## Important Notes

- **Change default admin password** in `appsettings.json` before production
- **Set JWT_SECRET** to a secure 32+ character string
- **Configure WhatsApp phone** in `appsettings.json` or environment variable
- **Cart persists** in browser localStorage
- **Images upload** to `wwwroot/uploads/products/`

## Railway Deployment

1. Create Railway project with MySQL service
2. Set environment variables:
   - `DATABASE_URL` (from Railway MySQL)
   - `JWT_SECRET` (32+ chars)
   - `WHATSAPP_PHONE` (+1234567890)
   - `ADMIN_USERNAME` and `ADMIN_PASSWORD`
3. Deploy from GitHub or Railway CLI
4. Migrations run automatically on startup

See README.md for detailed instructions.
