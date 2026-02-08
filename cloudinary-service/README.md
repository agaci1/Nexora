# Nexora Cloudinary Upload Service

Node.js service for handling image and video uploads to Cloudinary.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your Cloudinary credentials
```

3. Run the service:
```bash
npm start
```

## Environment Variables

**Option 1: Use CLOUDINARY_URL (Recommended)**
- `CLOUDINARY_URL` - Full Cloudinary connection string (format: `cloudinary://api_key:api_secret@cloud_name`)

**Option 2: Use Individual Credentials**
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name (default: `dbfliirey`)
- `CLOUDINARY_API_KEY` - Your Cloudinary API key (default: `358157347243674`)
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

**Other:**
- `PORT` - Service port (default: 3001)

## API Endpoints

### POST /upload
Upload a single file.

**Request:**
- Content-Type: multipart/form-data
- Field name: `file`

**Response:**
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/...",
  "public_id": "nexora/products/...",
  "width": 1920,
  "height": 1080,
  "resource_type": "image"
}
```

### POST /upload/multiple
Upload multiple files (max 10).

**Request:**
- Content-Type: multipart/form-data
- Field name: `files`

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "url": "https://res.cloudinary.com/...",
      "public_id": "nexora/products/...",
      "width": 1920,
      "height": 1080,
      "resource_type": "image"
    }
  ]
}
```

### DELETE /delete/:publicId
Delete a file from Cloudinary.

### GET /optimize/:publicId
Get optimized URL with transformations.

**Query parameters:**
- `width` - Image width
- `height` - Image height
- `crop` - Crop mode
- `quality` - Quality (auto or 1-100)

## Railway Deployment

1. Add this service to your Railway project
2. Set environment variables in Railway dashboard
3. The service will run on the assigned port
