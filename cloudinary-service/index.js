import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Cloudinary configuration
// Support both CLOUDINARY_URL (standard format) and individual credentials
if (process.env.CLOUDINARY_URL) {
    // Use CLOUDINARY_URL if provided (format: cloudinary://api_key:api_secret@cloud_name)
    cloudinary.config(process.env.CLOUDINARY_URL);
} else {
    // Use individual credentials
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dbfliirey',
        api_key: process.env.CLOUDINARY_API_KEY || '358157347243674',
        api_secret: process.env.CLOUDINARY_API_SECRET || ''
    });
}

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi/;
        const extname = allowedTypes.test(file.mimetype.toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype.toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image and video files are allowed!'));
        }
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'cloudinary-upload' });
});

// Upload single file
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Convert buffer to data URI for Cloudinary
        const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(dataUri, {
            folder: 'nexora/products',
            resource_type: 'auto', // auto-detect image or video
            transformation: [
                {
                    fetch_format: 'auto',
                    quality: 'auto'
                }
            ]
        });

        res.json({
            success: true,
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
            width: uploadResult.width,
            height: uploadResult.height,
            resource_type: uploadResult.resource_type
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed', message: error.message });
    }
});

// Upload multiple files
app.post('/upload/multiple', upload.array('files', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const uploadPromises = req.files.map(file => {
            const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            return cloudinary.uploader.upload(dataUri, {
                folder: 'nexora/products',
                resource_type: 'auto',
                transformation: [
                    {
                        fetch_format: 'auto',
                        quality: 'auto'
                    }
                ]
            });
        });

        const results = await Promise.all(uploadPromises);

        res.json({
            success: true,
            files: results.map(result => ({
                url: result.secure_url,
                public_id: result.public_id,
                width: result.width,
                height: result.height,
                resource_type: result.resource_type
            }))
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed', message: error.message });
    }
});

// Delete file from Cloudinary
app.delete('/delete/:publicId', async (req, res) => {
    try {
        const { publicId } = req.params;
        const result = await cloudinary.uploader.destroy(publicId);
        res.json({ success: true, result });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Delete failed', message: error.message });
    }
});

// Get optimized URL
app.get('/optimize/:publicId', (req, res) => {
    try {
        const { publicId } = req.params;
        const { width, height, crop, quality } = req.query;

        const options = {
            fetch_format: 'auto',
            quality: quality || 'auto'
        };

        if (width) options.width = parseInt(width);
        if (height) options.height = parseInt(height);
        if (crop) options.crop = crop;

        const optimizedUrl = cloudinary.url(publicId, options);
        res.json({ url: optimizedUrl });
    } catch (error) {
        console.error('Optimize error:', error);
        res.status(500).json({ error: 'Optimize failed', message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Cloudinary upload service running on port ${PORT}`);
});
