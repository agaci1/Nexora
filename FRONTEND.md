# Frontend Files Overview

This document describes all frontend files in the Nexora application.

## File Structure

```
wwwroot/
├── index.html          # Main customer-facing application
├── admin.html          # Admin dashboard
├── app.js              # Main application JavaScript
├── admin.js            # Admin dashboard JavaScript
├── styles.css          # Main stylesheet
├── admin.css           # Admin dashboard stylesheet
└── images/             # Static images directory
```

## index.html

Main customer-facing single-page application with the following sections:

### Pages
1. **Home Page** (`#home-page`)
   - Hero section with dynamic title, subtitle, and image
   - "Shop Now" call-to-action button
   - Content loaded from API

2. **About Page** (`#about-page`)
   - Dynamic about text
   - Two dynamic images
   - Content loaded from API

3. **Shop Page** (`#shop-page`)
   - Gender filter buttons (Male/Female)
   - Category filter pills (shown after gender selection)
   - Products grid with cards
   - Dresses category only visible for Female

4. **Product Details Page** (`#product-details-page`)
   - Image carousel for multiple product images
   - Product information (name, price, description)
   - Add to cart button
   - Back to shop button

5. **Cart Page** (`#cart-page`)
   - List of cart items with images
   - Quantity controls (+/-)
   - Remove item button
   - Cart summary with total
   - Checkout button

6. **Contact Page** (`#contact-page`)
   - Contact information
   - Email and phone links
   - Business hours

7. **Privacy Policy Page** (`#privacy-page`)
   - Privacy policy content
   - Dynamic last updated date

### Modals
- **Checkout Modal**: Form with customer details (name, email, phone, address, notes)
- **Admin Login Modal**: Username and password form

### Navigation
- Sticky navbar with gradient background
- Links to all pages
- Cart badge showing item count
- Admin login icon (🔐)

## app.js

Main application JavaScript with the following functionality:

### Core Features
- **Navigation**: Hash-based routing
- **Cart Management**: localStorage persistence
- **Product Loading**: API integration with filtering
- **Content Loading**: Dynamic Home/About content from API
- **Checkout Flow**: Order creation + WhatsApp redirect
- **Admin Login**: JWT token management

### Key Functions
- `showPage(pageName)` - Navigate between pages
- `loadCart()` - Load cart from localStorage
- `saveCart()` - Save cart to localStorage
- `addToCart(product)` - Add product to cart
- `removeFromCart(productId)` - Remove from cart
- `updateCartQuantity(productId, quantity)` - Update quantity
- `loadProducts()` - Fetch products from API
- `showProductDetails(productId)` - Display product details
- `redirectToWhatsApp(orderData)` - Open WhatsApp with order

## admin.html

Admin dashboard with three main sections:

1. **Products Section**
   - Product list table
   - Add product button
   - Delete product functionality
   - Image upload with Cloudinary

2. **Orders Section**
   - Orders list table
   - Status dropdown (Pending/Completed/Cancelled)
   - Delete order functionality

3. **Content Section**
   - Tabs for Home and About
   - Form to edit content fields
   - Save changes button

## admin.js

Admin dashboard JavaScript with:

- JWT token management
- Product CRUD operations
- Order management
- Content management
- Cloudinary image upload integration

## styles.css

Main stylesheet with:

### Color Scheme
- **Backgrounds**: Purple, blue, pink, white, tiffany blue gradients
- **Text**: Black, dark blue
- **Buttons**:
  - Confirm/Accept: Tiffany blue/green gradient
  - Cancel/Destructive: Velvet red

### Key Styles
- Responsive grid layouts
- Smooth transitions and hover effects
- Mobile-first design
- Modern card designs
- Gradient backgrounds

## admin.css

Admin dashboard specific styles:
- Sidebar navigation
- Table layouts
- Form styling
- Content editor styles

## Features Implemented

✅ All required pages (Home, About, Shop, Cart, Contact, Privacy)
✅ Gender-based filtering (Male/Female)
✅ Category filtering with Dresses only for Female
✅ Product cards showing first image
✅ Product details with image carousel
✅ Cart with localStorage persistence
✅ Checkout flow with WhatsApp integration
✅ Admin login with modal confirmation
✅ Dynamic Home/About content from API
✅ Responsive mobile-first design
✅ Color scheme matching requirements
✅ Smooth UI transitions and animations

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript features
- CSS Grid and Flexbox
- localStorage API
- Fetch API

## Dependencies

- No external JavaScript libraries
- Pure vanilla JavaScript
- Native CSS (no frameworks)
- Uses browser APIs only
