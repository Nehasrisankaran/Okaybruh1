// Products page functionality
const API_BASE = 'http://localhost:3000/api';
let sessionId = localStorage.getItem('sessionId');

// Load all products
async function loadProducts() {
    const products = await fetchAPI('/products');
    
    if (products && products.length > 0) {
        displayProducts(products);
    } else {
        displayNoProducts();
    }
}

// Display products
function displayProducts(products) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    productsGrid.innerHTML = products.map(product => `
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
    `).join('');

    attachProductListeners();
}

// Display no products message
function displayNoProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (productsGrid) {
        productsGrid.innerHTML = `
            <div class="empty-cart">
                <h3>No products available</h3>
                <p>Check back later for new merchandise!</p>
            </div>
        `;
    }
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
                // Could navigate to product detail page here
                console.log('View product:', productId);
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
        showNotification('Item added to cart!');
    }
}

// Update cart count
async function updateCartCount() {
    const cartItems = await fetchAPI(`/cart/${sessionId}`);
    const count = cartItems ? cartItems.reduce((sum, item) => sum + item.quantity, 0) : 0;
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(el => el.textContent = count);
}

// Filter products by category
function filterProductsByCategory(category) {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        // This would need product category data
        // For now, just show all products
        card.style.display = category ? 'block' : 'block';
    });
}

// Show notification
function showNotification(message) {
    // Simple alert for now, could be replaced with a toast notification
    alert(message);
}

// Initialize products page
if (document.getElementById('products-grid')) {
    document.addEventListener('DOMContentLoaded', () => {
        loadProducts();
        updateCartCount();

        // Category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                // Filter logic would go here
                loadProducts(); // Reload for now
            });
        }
    });
}

// Fetch API helper
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`http://localhost:3000/api${endpoint}`, {
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


