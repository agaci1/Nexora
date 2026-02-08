// API Base URL
const API_BASE = window.location.origin;

// App State
const app = {
    currentPage: 'home',
    selectedGender: null,
    selectedCategory: null,
    cart: [],
    adminToken: null
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    updateCartBadge();
    setupNavigation();
    setupAdminLogin();
    loadHomeContent();
    loadAboutContent();
    setupCheckout();
    
    // Set privacy date
    document.getElementById('privacy-date').textContent = new Date().toLocaleDateString();
});

// Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                showPage(href.substring(1));
            }
        });
    });
    
    // Handle hash routing on load
    const hash = window.location.hash.substring(1) || 'home';
    showPage(hash);
    
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.substring(1) || 'home';
        showPage(hash);
    });
}

function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const pageElement = document.getElementById(`${pageName}-page`);
    if (pageElement) {
        pageElement.classList.add('active');
        app.currentPage = pageName;
        window.location.hash = pageName;
        
        // Load page-specific content
        if (pageName === 'shop') {
            loadProducts();
        } else if (pageName === 'cart') {
            renderCart();
        }
    }
}

// Cart Management with localStorage
function loadCart() {
    const saved = localStorage.getItem('nexora_cart');
    if (saved) {
        app.cart = JSON.parse(saved);
    }
}

function saveCart() {
    localStorage.setItem('nexora_cart', JSON.stringify(app.cart));
    updateCartBadge();
}

function updateCartBadge() {
    const count = app.cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline' : 'none';
    }
}

function addToCart(product) {
    const existing = app.cart.find(item => item.productId === product.id);
    if (existing) {
        existing.quantity++;
    } else {
        app.cart.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            imageUrl: product.imageUrls[0] || ''
        });
    }
    saveCart();
    alert('Product added to cart!');
}

function removeFromCart(productId) {
    app.cart = app.cart.filter(item => item.productId !== productId);
    saveCart();
    renderCart();
}

function updateCartQuantity(productId, quantity) {
    const item = app.cart.find(item => item.productId === productId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            saveCart();
            renderCart();
        }
    }
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const summary = document.getElementById('cart-summary');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (app.cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty.</p>';
        summary.innerHTML = '';
        checkoutBtn.style.display = 'none';
        return;
    }
    
    checkoutBtn.style.display = 'block';
    
    container.innerHTML = app.cart.map(item => `
        <div class="cart-item">
            <img src="${item.imageUrl}" alt="${item.name}">
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>$${item.price.toFixed(2)} each</p>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-control">
                    <button class="quantity-btn" onclick="updateCartQuantity(${item.productId}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartQuantity(${item.productId}, ${item.quantity + 1})">+</button>
                </div>
                <button class="btn-cancel" onclick="removeFromCart(${item.productId})">Remove</button>
            </div>
        </div>
    `).join('');
    
    const total = app.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    summary.innerHTML = `
        <h3>Cart Summary</h3>
        <p>Items: ${app.cart.length}</p>
        <div class="cart-total">Total: $${total.toFixed(2)}</div>
    `;
}

// Products
async function loadProducts() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '<p>Loading products...</p>';
    
    const params = new URLSearchParams();
    if (app.selectedGender) params.append('gender', app.selectedGender);
    if (app.selectedCategory) params.append('category', app.selectedCategory);
    
    try {
        const response = await fetch(`${API_BASE}/api/products?${params}`);
        const products = await response.json();
        
        if (products.length === 0) {
            grid.innerHTML = '<p>No products found.</p>';
            return;
        }
        
        grid.innerHTML = products.map(product => `
            <div class="product-card" onclick="showProductDetails(${product.id})">
                <img src="${product.imageUrls[0] || 'https://via.placeholder.com/300x300?text=No+Image'}" 
                     alt="${product.name}" 
                     onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
                <div class="product-card-info">
                    <h3>${product.name}</h3>
                    <p class="price">$${product.price.toFixed(2)}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
        grid.innerHTML = '<p>Error loading products. Please try again.</p>';
    }
}

async function showProductDetails(productId) {
    try {
        const response = await fetch(`${API_BASE}/api/products/${productId}`);
        const product = await response.json();
        
        const detailsContainer = document.getElementById('product-details');
        let imagesHtml = '';
        if (product.imageUrls && product.imageUrls.length > 0) {
            imagesHtml = `
                <div class="product-images">
                    <div class="product-image-carousel" id="product-carousel">
                        ${product.imageUrls.map((url, index) => `
                            <img src="${url}" alt="${product.name}" class="${index === 0 ? 'active' : ''}">
                        `).join('')}
                    </div>
                    ${product.imageUrls.length > 1 ? `
                        <div class="carousel-controls">
                            <button class="carousel-btn" onclick="previousImage()">Previous</button>
                            <button class="carousel-btn" onclick="nextImage()">Next</button>
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        detailsContainer.innerHTML = `
            ${imagesHtml}
            <div class="product-info">
                <h2>${product.name}</h2>
                <p class="price">$${product.price.toFixed(2)}</p>
                <p>${product.description.replace(/\n/g, '<br>')}</p>
                <button class="btn-primary" data-product-id="${product.id}">Add to Cart</button>
            </div>
        `;
        
        // Attach event listener to the button
        const addToCartBtn = detailsContainer.querySelector('.btn-primary[data-product-id]');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                addToCart(product);
            });
        }
        
        app.currentProductImages = product.imageUrls || [];
        app.currentImageIndex = 0;
        
        showPage('product-details');
    } catch (error) {
        console.error('Error loading product:', error);
        alert('Error loading product details.');
    }
}

let currentImageIndex = 0;
function nextImage() {
    if (app.currentProductImages && app.currentProductImages.length > 0) {
        currentImageIndex = (currentImageIndex + 1) % app.currentProductImages.length;
        updateCarousel();
    }
}

function previousImage() {
    if (app.currentProductImages && app.currentProductImages.length > 0) {
        currentImageIndex = (currentImageIndex - 1 + app.currentProductImages.length) % app.currentProductImages.length;
        updateCarousel();
    }
}

function updateCarousel() {
    const images = document.querySelectorAll('#product-carousel img');
    images.forEach((img, index) => {
        img.classList.toggle('active', index === currentImageIndex);
    });
}

// Gender and Category Filters
document.addEventListener('DOMContentLoaded', () => {
    const genderBtns = document.querySelectorAll('.gender-btn');
    genderBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            genderBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            app.selectedGender = btn.dataset.gender;
            app.selectedCategory = null;
            
            // Show category filters
            document.getElementById('category-filters').style.display = 'flex';
            
            // Show/hide dresses category
            const dressesBtn = document.querySelector('.category-btn[data-category="Dresses"]');
            if (dressesBtn) {
                if (app.selectedGender === 'female') {
                    dressesBtn.classList.add('show');
                } else {
                    dressesBtn.classList.remove('show');
                }
            }
            
            // Reset category buttons
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('.category-btn[data-category=""]').classList.add('active');
            
            loadProducts();
        });
    });
    
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            app.selectedCategory = btn.dataset.category || null;
            loadProducts();
        });
    });
});

// Content Loading
async function loadHomeContent() {
    try {
        const response = await fetch(`${API_BASE}/api/content/home`);
        const content = await response.json();
        
        if (content.heroTitle) document.getElementById('hero-title').textContent = content.heroTitle;
        if (content.heroSubtitle) document.getElementById('hero-subtitle').textContent = content.heroSubtitle;
        if (content.heroImageUrl) {
            const heroImg = document.getElementById('hero-image');
            heroImg.src = content.heroImageUrl;
            heroImg.onerror = function() {
                this.src = 'https://via.placeholder.com/800x600?text=Hero+Image';
            };
        }
    } catch (error) {
        console.error('Error loading home content:', error);
    }
}

async function loadAboutContent() {
    try {
        const response = await fetch(`${API_BASE}/api/content/about`);
        const content = await response.json();
        
        if (content.contentText) {
            document.getElementById('about-text').innerHTML = content.contentText.replace(/\n/g, '<br>');
        }
        if (content.contentImage1Url) {
            const img1 = document.getElementById('about-image-1');
            img1.src = content.contentImage1Url;
            img1.onerror = function() {
                this.src = 'https://via.placeholder.com/600x400?text=About+Image+1';
            };
        }
        if (content.contentImage2Url) {
            const img2 = document.getElementById('about-image-2');
            img2.src = content.contentImage2Url;
            img2.onerror = function() {
                this.src = 'https://via.placeholder.com/600x400?text=About+Image+2';
            };
        }
    } catch (error) {
        console.error('Error loading about content:', error);
    }
}

// Admin Login
function setupAdminLogin() {
    const loginBtn = document.getElementById('admin-login-btn');
    const loginModal = document.getElementById('admin-login-modal');
    const loginForm = document.getElementById('admin-login-form');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const isAdmin = confirm('This option is for Administrators only. Are you an Admin?');
            if (isAdmin) {
                showModal('admin-login-modal');
            }
        });
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('admin-username').value;
            const password = document.getElementById('admin-password').value;
            
            try {
                const response = await fetch(`${API_BASE}/api/admin/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    app.adminToken = data.token;
                    localStorage.setItem('nexora_admin_token', data.token);
                    closeModal('admin-login-modal');
                    window.location.href = '/admin.html';
                } else {
                    alert('Invalid credentials');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Error logging in. Please try again.');
            }
        });
    }
}

// Checkout
function setupCheckout() {
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutForm = document.getElementById('checkout-form');
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (app.cart.length === 0) {
                alert('Your cart is empty.');
                return;
            }
            showModal('checkout-modal');
        });
    }
    
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const orderData = {
                customerName: document.getElementById('customer-name').value,
                customerEmail: document.getElementById('customer-email').value,
                contactNumber: document.getElementById('contact-number').value,
                country: document.getElementById('country').value,
                stateProvince: document.getElementById('state-province').value,
                city: document.getElementById('city').value,
                postCode: document.getElementById('post-code').value,
                notes: document.getElementById('notes').value || null,
                items: app.cart.map(item => ({
                    productId: item.productId,
                    productName: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    productImageUrl: item.imageUrl
                }))
            };
            
            try {
                const response = await fetch(`${API_BASE}/api/orders`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                });
                
                if (response.ok) {
                    const order = await response.json();
                    await redirectToWhatsApp(orderData);
                    app.cart = [];
                    saveCart();
                    closeModal('checkout-modal');
                    checkoutForm.reset();
                    showPage('home');
                } else {
                    alert('Error creating order. Please try again.');
                }
            } catch (error) {
                console.error('Checkout error:', error);
                alert('Error processing order. Please try again.');
            }
        });
    }
}

async function redirectToWhatsApp(orderData) {
    const total = app.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let message = `New Order from Nexora\n\n`;
    message += `Customer: ${orderData.customerName}\n`;
    message += `Email: ${orderData.customerEmail}\n`;
    message += `Phone: ${orderData.contactNumber}\n`;
    message += `Country: ${orderData.country}\n`;
    message += `State/Province: ${orderData.stateProvince}\n`;
    message += `City: ${orderData.city}\n`;
    message += `Post Code: ${orderData.postCode}\n\n`;
    message += `Items:\n`;
    orderData.items.forEach(item => {
        message += `- ${item.productName} x${item.quantity} @ $${item.price.toFixed(2)} = $${(item.price * item.quantity).toFixed(2)}\n`;
    });
    message += `\nTotal: $${total.toFixed(2)}\n`;
    if (orderData.notes) {
        message += `\nNotes: ${orderData.notes}`;
    }
    
    // Get phone number from config - fetch from API or use default
    let phoneNumber = '+1234567890';
    try {
        const response = await fetch(`${API_BASE}/api/config/whatsapp`);
        if (response.ok) {
            phoneNumber = await response.text();
        }
    } catch (error) {
        console.error('Error fetching WhatsApp phone:', error);
    }
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
}

// Modal Helpers
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        if (modal) {
            modal.classList.remove('active');
        }
    });
});

document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});

// Export for use in other scripts
window.app = app;
window.showPage = showPage;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.showProductDetails = showProductDetails;
window.nextImage = nextImage;
window.previousImage = previousImage;
