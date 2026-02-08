# Railway Deployment Guide

This guide covers deploying Nexora to Railway with MySQL database and Cloudinary service.

## Prerequisites

1. Railway account (https://railway.app)
2. Cloudinary account (https://cloudinary.com) - Free tier available
3. GitHub repository with your code

## Step-by-Step Deployment

### 1. Set Up Cloudinary Account

1. Sign up at https://cloudinary.com
2. Go to Dashboard and copy:
   - Cloud Name
   - API Key
   - API Secret

### 2. Create Railway Project

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo" (or use Railway CLI)

### 3. Add MySQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "MySQL"
3. Railway will create a MySQL instance
4. Copy the connection string from the MySQL service variables

### 4. Deploy Cloudinary Service

1. In Railway project, click "+ New" → "GitHub Repo"
2. Select your repository
3. Set Root Directory to `cloudinary-service`
4. Railway will auto-detect Node.js
5. Add environment variables (choose one option):
   
   **Option 1: Use CLOUDINARY_URL (Recommended)**
   ```
   PORT=3001
   CLOUDINARY_URL=cloudinary://358157347243674:YOUR_API_SECRET@dbfliirey
   ```
   
   **Option 2: Use Individual Credentials**
   ```
   PORT=3001
   CLOUDINARY_CLOUD_NAME=dbfliirey
   CLOUDINARY_API_KEY=358157347243674
   CLOUDINARY_API_SECRET=your-api-secret
   ```
6. Note the service URL (Railway will assign a public URL)

### 5. Deploy API Service

1. In Railway project, click "+ New" → "GitHub Repo"
2. Select your repository (same repo)
3. Set Root Directory to `Nexora.Api`
4. Railway will auto-detect .NET
5. Add environment variables:
   ```
   DATABASE_URL=<mysql-connection-string-from-step-3>
   JWT_SECRET=<generate-a-secure-32-char-string>
   WHATSAPP_PHONE=+1234567890
   CLOUDINARY_SERVICE_URL=<cloudinary-service-url-from-step-4>
   ASPNETCORE_ENVIRONMENT=Production
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=<your-secure-admin-password>
   ```
6. Configure build settings (if needed):
   - Build Command: `dotnet build`
   - Start Command: `dotnet Nexora.Api.dll`

### 6. Verify Deployment

1. Check Cloudinary service logs - should show "Cloudinary upload service running on port 3001"
2. Check API service logs - should show migrations running and app starting
3. Visit your API URL (Railway provides a public URL)
4. Test endpoints:
   - `GET /api/products` - Should return products
   - `GET /health` on Cloudinary service - Should return status

### 7. Access Admin Dashboard

1. Visit `https://your-api-url.railway.app/admin.html`
2. Click the lock icon
3. Login with your admin credentials

## Environment Variables Reference

### API Service
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection string | `Server=...;Database=...;User=...;Password=...;Port=...;` |
| `JWT_SECRET` | JWT signing secret (32+ chars) | `your-super-secret-key-min-32-chars-long` |
| `WHATSAPP_PHONE` | WhatsApp Business phone | `+1234567890` |
| `CLOUDINARY_SERVICE_URL` | Cloudinary service URL | `https://cloudinary-service.railway.app` |
| `ASPNETCORE_ENVIRONMENT` | Environment | `Production` |
| `ADMIN_USERNAME` | Admin username | `admin` |
| `ADMIN_PASSWORD` | Admin password | `secure-password` |

### Cloudinary Service
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Service port | `3001` |
| `CLOUDINARY_URL` | Full Cloudinary URL (recommended) | `cloudinary://358157347243674:secret@dbfliirey` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name (if not using URL) | `dbfliirey` |
| `CLOUDINARY_API_KEY` | Cloudinary API key (if not using URL) | `358157347243674` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret (if not using URL) | `your-secret` |

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` format matches Railway MySQL format
- Check MySQL service is running in Railway
- Ensure database name is correct

### Cloudinary Upload Fails
- Verify Cloudinary credentials are correct
- Check Cloudinary service is running and accessible
- Verify `CLOUDINARY_SERVICE_URL` points to correct service
- Check Cloudinary service logs for errors

### API Not Starting
- Check build logs for compilation errors
- Verify all environment variables are set
- Check migration logs for database issues
- Ensure .NET 8 runtime is available

### Images Not Displaying
- Verify Cloudinary URLs are being saved correctly
- Check browser console for CORS or network errors
- Ensure Cloudinary service is publicly accessible

## Custom Domain (Optional)

1. In Railway, go to your API service
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Railway will provide DNS records to configure

## Monitoring

- Railway provides built-in logs for all services
- Check service health in Railway dashboard
- Monitor Cloudinary usage in Cloudinary dashboard
- Set up Railway alerts for service failures

## Security Notes

- Never commit `.env` files or secrets
- Use Railway's environment variables for all secrets
- Rotate JWT_SECRET periodically
- Use strong admin passwords
- Enable Cloudinary signed URLs for production (optional)
