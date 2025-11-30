// API Base URL
const API_BASE = 'http://localhost:3000/api';

// Generate session ID if not exists
let sessionId = localStorage.getItem('sessionId');
if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('sessionId', sessionId);
}

// Utility Functions
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

// Update cart count
async function updateCartCount() {
    const cartItems = await fetchAPI(`/cart/${sessionId}`);
    const count = cartItems ? cartItems.reduce((sum, item) => sum + item.quantity, 0) : 0;
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(el => el.textContent = count);
}

// Load featured products on home page
async function loadFeaturedProducts() {
    const products = await fetchAPI('/products');
    if (products && products.length > 0) {
        const featuredContainer = document.getElementById('featured-products');
        if (featuredContainer) {
            featuredContainer.innerHTML = products.slice(0, 4).map(product => createProductCard(product)).join('');
            attachProductListeners();
        }
    }
}

// Create product card HTML
function createProductCard(product) {
    return `
        <div class="product-card" data-product-id="${product.id}">
            <img src="${product.image || '/images/placeholder.jpg'}" alt="${product.name}" class="product-image" onerror="this.src='/images/placeholder.jpg'">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description || ''}</p>
                <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
                <div class="product-actions">
                    <button class="btn-primary add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
                </div>
            </div>
        </div>
    `;
}

// Attach product listeners
function attachProductListeners() {
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const productId = btn.getAttribute('data-product-id');
            await addToCart(productId, 1);
        });
    });

    // Product card click to view details
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('add-to-cart-btn')) {
                const productId = card.getAttribute('data-product-id');
                window.location.href = `products.html?id=${productId}`;
            }
        });
    });
}

// Add to cart
async function addToCart(productId, quantity = 1) {
    const response = await fetchAPI('/cart', {
        method: 'POST',
        body: JSON.stringify({
            sessionId: sessionId,
            productId: productId,
            quantity: quantity
        })
    });

    if (response) {
        updateCartCount();
        alert('Item added to cart!');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        loadFeaturedProducts();
    }
});


