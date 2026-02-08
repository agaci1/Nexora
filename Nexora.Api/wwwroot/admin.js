// Admin App
const admin = {
    token: null,
    currentSection: 'products',
    cloudinaryServiceUrl: 'http://localhost:3001', // Will be fetched from API config
    categories: {
        male: ['T-Shirts', 'Trousers', 'Suits', 'Jackets', 'Sportswear / Activewear', 'Accessories', 'Cosmetics', 'Perfumes'],
        female: ['T-Shirts', 'Trousers', 'Suits', 'Jackets', 'Dresses', 'Sportswear / Activewear', 'Accessories', 'Cosmetics', 'Perfumes'],
        unisex: ['T-Shirts', 'Trousers', 'Suits', 'Jackets', 'Sportswear / Activewear', 'Accessories', 'Cosmetics', 'Perfumes']
    }
};

// Get Cloudinary service URL from config or use default
async function getCloudinaryServiceUrl() {
    try {
        const response = await fetch(`${window.location.origin}/api/config/cloudinary-service`);
        if (response.ok) {
            return await response.text();
        }
    } catch (error) {
        console.error('Error fetching Cloudinary service URL:', error);
    }
    return admin.cloudinaryServiceUrl;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    admin.token = localStorage.getItem('nexora_admin_token');
    
    if (!admin.token) {
        window.location.href = '/';
        return;
    }
    
    setupAdminNavigation();
    loadProducts();
    loadOrders();
    setupContentEditor();
    setupAddProductForm();
    
    // Logout
    document.getElementById('admin-logout').addEventListener('click', () => {
        localStorage.removeItem('nexora_admin_token');
        window.location.href = '/';
    });
});

// Navigation
function setupAdminNavigation() {
    const navLinks = document.querySelectorAll('.admin-nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('href').substring(1);
            showAdminSection(section);
        });
    });
}

function showAdminSection(section) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
    
    const sectionEl = document.getElementById(`admin-${section}`);
    const linkEl = document.querySelector(`.admin-nav-link[href="#${section}"]`);
    
    if (sectionEl) sectionEl.classList.add('active');
    if (linkEl) linkEl.classList.add('active');
    
    admin.currentSection = section;
    
    if (section === 'products') loadProducts();
    if (section === 'orders') loadOrders();
    if (section === 'content') loadContent();
}

// Products
async function loadProducts() {
    try {
        const response = await fetch(`${window.location.origin}/api/products?pageSize=100`, {
            headers: {
                'Authorization': `Bearer ${admin.token}`
            }
        });
        const products = await response.json();
        
        const container = document.getElementById('products-list');
        if (products.length === 0) {
            container.innerHTML = '<p>No products found.</p>';
            return;
        }
        
        container.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Gender</th>
                        <th>Category</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map(product => `
                        <tr>
                            <td><img src="${product.imageUrls[0] || '/images/placeholder.jpg'}" alt="${product.name}"></td>
                            <td>${product.name}</td>
                            <td>$${product.price.toFixed(2)}</td>
                            <td>${product.genderType}</td>
                            <td>${product.category}</td>
                            <td class="admin-actions">
                                <button class="btn-small btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`${window.location.origin}/api/admin/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${admin.token}`
            }
        });
        
        if (response.ok) {
            loadProducts();
        } else {
            alert('Error deleting product');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
    }
}

function setupAddProductForm() {
    const genderSelect = document.getElementById('product-gender');
    const categorySelect = document.getElementById('product-category');
    
    genderSelect.addEventListener('change', () => {
        const gender = genderSelect.value;
        const categories = admin.categories[gender] || [];
        categorySelect.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    });
    
    // Initialize
    genderSelect.dispatchEvent(new Event('change'));
    
    // Preview uploaded images
    document.getElementById('product-images').addEventListener('change', (e) => {
        const preview = document.getElementById('upload-preview');
        preview.innerHTML = '';
        const files = e.target.files;
        for (let file of files) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.width = '100px';
                img.style.height = '100px';
                img.style.objectFit = 'cover';
                img.style.margin = '5px';
                img.style.borderRadius = '5px';
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });
    
    document.getElementById('add-product-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('product-name').value,
            price: parseFloat(document.getElementById('product-price').value),
            genderType: document.getElementById('product-gender').value,
            category: document.getElementById('product-category').value,
            description: document.getElementById('product-description').value
        };
        
        try {
            // First upload images to Cloudinary
            const imageFiles = document.getElementById('product-images').files;
            let imageUrls = [];
            
            if (imageFiles.length > 0) {
                const progressDiv = document.getElementById('upload-progress');
                progressDiv.style.display = 'block';
                
                try {
                    const cloudinaryUrl = await getCloudinaryServiceUrl();
                    const uploadFormData = new FormData();
                    for (let file of imageFiles) {
                        uploadFormData.append('files', file);
                    }
                    
                    const uploadResponse = await fetch(`${cloudinaryUrl}/upload/multiple`, {
                        method: 'POST',
                        body: uploadFormData
                    });
                    
                    if (uploadResponse.ok) {
                        const uploadResult = await uploadResponse.json();
                        imageUrls = uploadResult.files.map(f => f.url);
                        progressDiv.innerHTML = '<p style="color: green;">✓ Uploaded successfully!</p>';
                    } else {
                        const error = await uploadResponse.json();
                        progressDiv.style.display = 'none';
                        alert('Error uploading images to Cloudinary: ' + (error.message || 'Unknown error'));
                        return;
                    }
                } catch (error) {
                    progressDiv.style.display = 'none';
                    alert('Error uploading images to Cloudinary: ' + error.message);
                    return;
                }
            }
            
            // Create product
            const response = await fetch(`${window.location.origin}/api/admin/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${admin.token}`
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                const product = await response.json();
                
                // Save image URLs to product
                if (imageUrls.length > 0) {
                    const imageResponse = await fetch(`${window.location.origin}/api/admin/products/${product.id}/images`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${admin.token}`
                        },
                        body: JSON.stringify(imageUrls)
                    });
                }
                
                document.getElementById('add-product-form').reset();
                document.getElementById('upload-preview').innerHTML = '';
                document.getElementById('upload-progress').style.display = 'none';
                closeModal('add-product-modal');
                loadProducts();
            } else {
                alert('Error creating product');
            }
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Error creating product: ' + error.message);
        }
    });
}

function showAddProductForm() {
    showModal('add-product-modal');
}

// Orders
async function loadOrders() {
    try {
        const response = await fetch(`${window.location.origin}/api/admin/orders?pageSize=100`, {
            headers: {
                'Authorization': `Bearer ${admin.token}`
            }
        });
        const orders = await response.json();
        
        const container = document.getElementById('orders-list');
        if (orders.length === 0) {
            container.innerHTML = '<p>No orders found.</p>';
            return;
        }
        
        container.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Email</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => `
                        <tr>
                            <td>#${order.id}</td>
                            <td>${order.customerName}</td>
                            <td>${order.customerEmail}</td>
                            <td>$${order.totalAmount.toFixed(2)}</td>
                            <td>
                                <select onchange="updateOrderStatus(${order.id}, this.value)">
                                    <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                    <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>Completed</option>
                                    <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                                </select>
                            </td>
                            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                            <td class="admin-actions">
                                <button class="btn-small btn-delete" onclick="deleteOrder(${order.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

async function deleteOrder(id) {
    if (!confirm('Are you sure you want to delete this order?')) return;
    
    try {
        const response = await fetch(`${window.location.origin}/api/admin/orders/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${admin.token}`
            }
        });
        
        if (response.ok) {
            loadOrders();
        } else {
            alert('Error deleting order');
        }
    } catch (error) {
        console.error('Error deleting order:', error);
        alert('Error deleting order');
    }
}

async function updateOrderStatus(id, status) {
    try {
        const response = await fetch(`${window.location.origin}/api/admin/orders/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${admin.token}`
            },
            body: JSON.stringify(status)
        });
        
        if (!response.ok) {
            alert('Error updating order status');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        alert('Error updating order status');
    }
}

// Content Editor
function setupContentEditor() {
    const tabs = document.querySelectorAll('.content-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadContent(tab.dataset.content);
        });
    });
}

async function loadContent(key = 'home') {
    try {
        const response = await fetch(`${window.location.origin}/api/content/${key}`);
        const content = await response.json();
        
        const editor = document.getElementById('content-editor');
        editor.innerHTML = `
            <form id="content-form">
                <div class="form-group">
                    <label>Hero Title</label>
                    <input type="text" id="content-hero-title" value="${content.heroTitle || ''}">
                </div>
                <div class="form-group">
                    <label>Hero Subtitle</label>
                    <input type="text" id="content-hero-subtitle" value="${content.heroSubtitle || ''}">
                </div>
                <div class="form-group">
                    <label>Hero Image URL</label>
                    <input type="text" id="content-hero-image" value="${content.heroImageUrl || ''}">
                </div>
                <div class="form-group">
                    <label>Content Text</label>
                    <textarea id="content-text" rows="10">${content.contentText || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Content Image 1 URL</label>
                    <input type="text" id="content-image-1" value="${content.contentImage1Url || ''}">
                </div>
                <div class="form-group">
                    <label>Content Image 2 URL</label>
                    <input type="text" id="content-image-2" value="${content.contentImage2Url || ''}">
                </div>
                <button type="submit" class="btn-confirm">Save Changes</button>
            </form>
        `;
        
        document.getElementById('content-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const contentData = {
                heroTitle: document.getElementById('content-hero-title').value,
                heroSubtitle: document.getElementById('content-hero-subtitle').value,
                heroImageUrl: document.getElementById('content-hero-image').value,
                contentText: document.getElementById('content-text').value,
                contentImage1Url: document.getElementById('content-image-1').value,
                contentImage2Url: document.getElementById('content-image-2').value
            };
            
            try {
                const response = await fetch(`${window.location.origin}/api/admin/content/${key}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${admin.token}`
                    },
                    body: JSON.stringify(contentData)
                });
                
                if (response.ok) {
                    alert('Content saved successfully!');
                } else {
                    alert('Error saving content');
                }
            } catch (error) {
                console.error('Error saving content:', error);
                alert('Error saving content');
            }
        });
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

// Modal helpers
function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Export
window.admin = admin;
window.showAdminSection = showAdminSection;
window.deleteProduct = deleteProduct;
window.deleteOrder = deleteOrder;
window.updateOrderStatus = updateOrderStatus;
window.showAddProductForm = showAddProductForm;
