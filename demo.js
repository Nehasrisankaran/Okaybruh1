// Mock Data
let mockProducts = [
    {
        id: 1,
        name: 'Okaybruh Classic Tee',
        description: 'Premium cotton t-shirt with Okaybruh logo',
        price: 29.99,
        category: 'Tees',
        image: 'https://via.placeholder.com/300x300/667eea/ffffff?text=Classic+Tee',
        stock: 50
    },
    {
        id: 2,
        name: 'Okaybruh Hoodie',
        description: 'Comfortable hoodie for all seasons',
        price: 59.99,
        category: 'Hoodies',
        image: 'https://via.placeholder.com/300x300/764ba2/ffffff?text=Hoodie',
        stock: 30
    },
    {
        id: 3,
        name: 'Okaybruh Cap',
        description: 'Stylish snapback cap',
        price: 24.99,
        category: 'Accessories',
        image: 'https://via.placeholder.com/300x300/f093fb/ffffff?text=Cap',
        stock: 40
    },
    {
        id: 4,
        name: 'Okaybruh Stickers Pack',
        description: 'Set of 10 vinyl stickers',
        price: 9.99,
        category: 'Accessories',
        image: 'https://via.placeholder.com/300x300/4facfe/ffffff?text=Stickers',
        stock: 100
    },
    {
        id: 5,
        name: 'Okaybruh Premium Tee',
        description: 'Limited edition premium cotton tee',
        price: 34.99,
        category: 'Tees',
        image: 'https://via.placeholder.com/300x300/43e97b/ffffff?text=Premium+Tee',
        stock: 25
    },
    {
        id: 6,
        name: 'Okaybruh Sweatshirt',
        description: 'Cozy sweatshirt for chilly days',
        price: 49.99,
        category: 'Hoodies',
        image: 'https://via.placeholder.com/300x300/fa709a/ffffff?text=Sweatshirt',
        stock: 35
    }
];

let cart = JSON.parse(localStorage.getItem('demoCart')) || [];
let orders = JSON.parse(localStorage.getItem('demoOrders')) || [];
let products = JSON.parse(localStorage.getItem('demoProducts')) || mockProducts;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    saveProducts();
    loadFeaturedProducts();
    updateCartCount();
    loadProducts();
    loadAdminProducts();
    setCurrentMonth();
});

// Save products to localStorage
function saveProducts() {
    localStorage.setItem('demoProducts', JSON.stringify(products));
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('demoCart', JSON.stringify(cart));
    updateCartCount();
}

// Show section
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.active-section, .section-content').forEach(el => {
        el.style.display = 'none';
    });
    
    // Update nav
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    event.target.classList.add('active');
    
    // Show selected section
    if (section === 'home') {
        document.getElementById('home-section').style.display = 'block';
        loadFeaturedProducts();
    } else {
        document.getElementById(section + '-section').style.display = 'block';
        
        if (section === 'products') {
            loadProducts();
        } else if (section === 'cart') {
            loadCart();
        } else if (section === 'admin') {
            loadAdminProducts();
        }
    }
}

// Load featured products
function loadFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (container) {
        container.innerHTML = products.slice(0, 4).map(product => createProductCard(product)).join('');
    }
}

// Load all products
function loadProducts() {
    const container = document.getElementById('products-grid');
    if (container) {
        container.innerHTML = products.map(product => createProductCard(product)).join('');
    }
}

// Create product card
function createProductCard(product) {
    return `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x300'">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
                <div class="product-actions">
                    <button class="btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
                </div>
            </div>
        </div>
    `;
}

// Filter products
function filterProducts() {
    const category = document.getElementById('category-filter').value;
    const container = document.getElementById('products-grid');
    
    const filtered = category ? products.filter(p => p.category === category) : products;
    container.innerHTML = filtered.map(product => createProductCard(product)).join('');
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    saveCart();
    alert('Item added to cart!');
}

// Update cart count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

// Load cart
function loadCart() {
    const container = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <h3>Your cart is empty</h3>
                <p>Start shopping to add items to your cart!</p>
                <a href="#" onclick="showSection('products')" class="btn-primary">Browse Products</a>
            </div>
        `;
        updateTotals(0, 0, 0);
        return;
    }
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src='https://via.placeholder.com/100'">
            <div class="cart-item-info">
                <h3 class="cart-item-name">${item.name}</h3>
                <p class="cart-item-price">$${parseFloat(item.price).toFixed(2)}</p>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-control">
                    <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${item.id}, this.value)">
                    <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <button class="btn-secondary" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        </div>
    `).join('');
    
    calculateTotal();
}

// Update quantity
function updateQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    item.quantity = parseInt(newQuantity);
    saveCart();
    loadCart();
}

// Remove from cart
function removeFromCart(productId) {
    if (confirm('Are you sure you want to remove this item from cart?')) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        loadCart();
    }
}

// Calculate total
function calculateTotal() {
    const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    updateTotals(subtotal, tax, total);
}

// Update totals
function updateTotals(subtotal, tax, total) {
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

// Clear cart
function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        saveCart();
        loadCart();
        alert('Cart cleared!');
    }
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    document.getElementById('checkout-modal').style.display = 'block';
}

// Handle checkout
function handleCheckout(e) {
    e.preventDefault();
    
    const customerName = document.getElementById('customer-name').value;
    const customerEmail = document.getElementById('customer-email').value;
    const customerPhone = document.getElementById('customer-phone').value;
    const paymentMethod = document.getElementById('payment-method').value;
    
    const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    
    // Create order
    const order = {
        id: orders.length + 1,
        customerName,
        customerEmail,
        customerPhone,
        items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        totalAmount: total,
        paymentMethod,
        status: 'pending',
        date: new Date().toISOString()
    };
    
    orders.push(order);
    localStorage.setItem('demoOrders', JSON.stringify(orders));
    
    // Show QR code if payment method is QR code
    if (paymentMethod === 'qrcode') {
        document.getElementById('qrcode-container').style.display = 'block';
    }
    
    // Show bill
    showBill(order);
    closeModal('checkout-modal');
    
    // Clear cart
    cart = [];
    saveCart();
    loadCart();
}

// Show bill
function showBill(order) {
    document.getElementById('bill-order-id').textContent = order.id;
    document.getElementById('bill-date').textContent = new Date(order.date).toLocaleDateString();
    document.getElementById('bill-customer-name').textContent = order.customerName;
    document.getElementById('bill-customer-email').textContent = order.customerEmail;
    document.getElementById('bill-customer-phone').textContent = order.customerPhone;
    document.getElementById('bill-payment-method').textContent = order.paymentMethod === 'qrcode' ? 'PayNow (QR Code)' : 'Cash on Delivery';
    
    const subtotal = order.items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    
    const billItemsTable = document.querySelector('#bill-items-table tbody');
    billItemsTable.innerHTML = order.items.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>$${parseFloat(item.price).toFixed(2)}</td>
            <td>$${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');
    
    document.getElementById('bill-subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('bill-tax').textContent = tax.toFixed(2);
    document.getElementById('bill-total').textContent = total.toFixed(2);
    
    // Show QR code in bill if payment method is QR code
    const billQrcodeContainer = document.getElementById('bill-qrcode-container');
    if (order.paymentMethod === 'qrcode') {
        billQrcodeContainer.innerHTML = `
            <h3>Scan to Pay</h3>
            <div style="width: 200px; height: 200px; border: 2px solid #667eea; margin: 0 auto; display: flex; align-items: center; justify-content: center; background: white;">
                <p>QR Code<br>Would Appear Here</p>
            </div>
        `;
        billQrcodeContainer.style.display = 'block';
    } else {
        billQrcodeContainer.style.display = 'none';
    }
    
    document.getElementById('bill-modal').style.display = 'block';
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Payment method change
document.addEventListener('DOMContentLoaded', () => {
    const paymentMethod = document.getElementById('payment-method');
    if (paymentMethod) {
        paymentMethod.addEventListener('change', (e) => {
            const qrcodeContainer = document.getElementById('qrcode-container');
            if (e.target.value === 'qrcode') {
                qrcodeContainer.style.display = 'block';
            } else {
                qrcodeContainer.style.display = 'none';
            }
        });
    }
    
    // Close modals on outside click
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    }
});

// Admin Functions
function showAdminTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    if (tabName === 'orders') {
        loadOrders();
    } else if (tabName === 'reports') {
        loadSalesReport();
    }
}

// Load admin products
function loadAdminProducts() {
    const tableBody = document.getElementById('admin-products-table');
    if (tableBody) {
        tableBody.innerHTML = products.map(product => `
            <tr>
                <td><img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;" onerror="this.src='https://via.placeholder.com/50'"></td>
                <td>${product.name}</td>
                <td>${product.description}</td>
                <td>${product.category}</td>
                <td>$${parseFloat(product.price).toFixed(2)}</td>
                <td>${product.stock}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="editProduct(${product.id})">Edit</button>
                        <button class="btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

// Show product modal
function showProductModal(productId = null) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    
    if (productId) {
        document.getElementById('modal-title').textContent = 'Edit Product';
        const product = products.find(p => p.id === productId);
        if (product) {
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-description').value = product.description;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-stock').value = product.stock;
            document.getElementById('product-image').value = product.image;
            const preview = document.getElementById('product-image-preview');
            preview.src = product.image;
            preview.style.display = 'block';
        }
    } else {
        document.getElementById('modal-title').textContent = 'Add Product';
        form.reset();
        document.getElementById('product-id').value = '';
        document.getElementById('product-image-preview').style.display = 'none';
    }
    
    modal.style.display = 'block';
}

// Close product modal
function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
}

// Handle product submit
function handleProductSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const description = document.getElementById('product-description').value;
    const category = document.getElementById('product-category').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const stock = parseInt(document.getElementById('product-stock').value);
    const image = document.getElementById('product-image').value || 'https://via.placeholder.com/300x300';
    
    if (id) {
        // Edit product
        const index = products.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            products[index] = {
                ...products[index],
                name,
                description,
                category,
                price,
                stock,
                image
            };
        }
    } else {
        // Add product
        const newId = Math.max(...products.map(p => p.id), 0) + 1;
        products.push({
            id: newId,
            name,
            description,
            category,
            price,
            stock,
            image
        });
    }
    
    saveProducts();
    loadAdminProducts();
    loadProducts();
    loadFeaturedProducts();
    closeProductModal();
    alert(id ? 'Product updated successfully!' : 'Product created successfully!');
}

// Edit product
function editProduct(productId) {
    showProductModal(productId);
}

// Delete product
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== productId);
        saveProducts();
        loadAdminProducts();
        loadProducts();
        loadFeaturedProducts();
        alert('Product deleted successfully!');
    }
}

// Image preview
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('product-image');
    if (imageInput) {
        imageInput.addEventListener('input', function() {
            const preview = document.getElementById('product-image-preview');
            if (this.value) {
                preview.src = this.value;
                preview.style.display = 'block';
            } else {
                preview.style.display = 'none';
            }
        });
    }
});

// Load orders
function loadOrders() {
    const tableBody = document.getElementById('orders-table');
    if (tableBody) {
        if (orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8">No orders found</td></tr>';
            return;
        }
        
        tableBody.innerHTML = orders.map(order => {
            const itemsList = order.items.map(item => `${item.name} (x${item.quantity})`).join(', ');
            return `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.customerName}</td>
                    <td>${order.customerEmail}</td>
                    <td>${order.customerPhone}</td>
                    <td>${itemsList}</td>
                    <td>$${parseFloat(order.totalAmount).toFixed(2)}</td>
                    <td>${order.status}</td>
                    <td>${new Date(order.date).toLocaleDateString()}</td>
                </tr>
            `;
        }).join('');
    }
}

// Load sales report
function loadSalesReport() {
    const month = document.getElementById('report-month').value;
    const year = document.getElementById('report-year').value;
    
    const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate.getMonth() + 1 === parseInt(month) && orderDate.getFullYear() === parseInt(year);
    });
    
    const totalOrders = monthOrders.length;
    const totalRevenue = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    document.getElementById('report-total-orders').textContent = totalOrders;
    document.getElementById('report-total-revenue').textContent = `$${totalRevenue.toFixed(2)}`;
    document.getElementById('report-avg-order').textContent = `$${avgOrderValue.toFixed(2)}`;
    
    // Draw chart
    drawSalesChart(monthOrders);
}

// Set current month
function setCurrentMonth() {
    const monthSelect = document.getElementById('report-month');
    if (monthSelect) {
        const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
        monthSelect.value = currentMonth;
    }
}

// Draw sales chart
function drawSalesChart(orders) {
    const canvas = document.getElementById('sales-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    canvas.width = container ? container.offsetWidth : 800;
    canvas.height = 400;
    
    // Group orders by date
    const dailySales = {};
    orders.forEach(order => {
        const date = new Date(order.date).toLocaleDateString();
        if (!dailySales[date]) {
            dailySales[date] = 0;
        }
        dailySales[date] += order.totalAmount;
    });
    
    const dates = Object.keys(dailySales).sort();
    const sales = dates.map(date => dailySales[date]);
    
    if (dates.length === 0) {
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No sales data available', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    const maxSales = Math.max(...sales, 1);
    const barWidth = Math.max((canvas.width - 40) / dates.length, 20);
    const maxHeight = canvas.height - 60;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#667eea';
    
    dates.forEach((date, index) => {
        const barHeight = (sales[index] / maxSales) * maxHeight;
        const x = 20 + index * barWidth;
        const y = canvas.height - barHeight - 40;
        
        ctx.fillRect(x + 5, y, barWidth - 10, barHeight);
        
        // Label
        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        const day = date.split('/')[1];
        ctx.fillText(day, x + barWidth / 2, canvas.height - 20);
        
        // Value label
        if (barHeight > 20) {
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.fillText('$' + sales[index].toFixed(0), x + barWidth / 2, y + barHeight / 2);
        }
        
        ctx.fillStyle = '#667eea';
    });
    
    // Y-axis label
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Sales ($)', 10, 20);
}


