// Admin panel functionality
const API_BASE = 'http://localhost:3000/api';

// Show tab
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Activate button
    event.target.classList.add('active');

    // Load data for the tab
    if (tabName === 'manage-menu') {
        loadProducts();
    } else if (tabName === 'orders') {
        loadOrders();
    } else if (tabName === 'reports') {
        loadSalesReport();
    }
}

// Load products for admin
async function loadProducts() {
    const products = await fetchAPI('/products');
    const tableBody = document.getElementById('admin-products-table');
    
    if (!tableBody) return;

    if (products && products.length > 0) {
        tableBody.innerHTML = products.map(product => `
            <tr>
                <td><img src="${product.image || '/images/placeholder.jpg'}" alt="${product.name}" onerror="this.src='/images/placeholder.jpg'"></td>
                <td>${product.name}</td>
                <td>${product.description || ''}</td>
                <td>${product.category || ''}</td>
                <td>$${parseFloat(product.price).toFixed(2)}</td>
                <td>${product.stock || 0}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="editProduct(${product.id})">Edit</button>
                        <button class="btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } else {
        tableBody.innerHTML = '<tr><td colspan="7">No products found</td></tr>';
    }
}

// Show product modal
function showProductModal(productId = null) {
    const modal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('product-form');
    
    if (productId) {
        modalTitle.textContent = 'Edit Product';
        loadProductData(productId);
    } else {
        modalTitle.textContent = 'Add Product';
        form.reset();
        document.getElementById('product-id').value = '';
        document.getElementById('product-image-preview').style.display = 'none';
    }
    
    modal.style.display = 'block';
}

// Close product modal
function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.style.display = 'none';
    document.getElementById('product-form').reset();
}

// Load product data for editing
async function loadProductData(productId) {
    const product = await fetchAPI(`/products/${productId}`);
    
    if (product) {
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-category').value = product.category || '';
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-stock').value = product.stock || 0;
        
        const imagePreview = document.getElementById('product-image-preview');
        if (product.image) {
            imagePreview.src = product.image;
            imagePreview.style.display = 'block';
        }
    }
}

// Edit product
function editProduct(productId) {
    showProductModal(productId);
}

// Delete product
async function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        const response = await fetchAPI(`/products/${productId}`, {
            method: 'DELETE'
        });

        if (response) {
            loadProducts();
            alert('Product deleted successfully!');
        }
    }
}

// Handle product form submission
async function handleProductSubmit(e) {
    e.preventDefault();

    const productId = document.getElementById('product-id').value;
    const formData = new FormData();
    
    formData.append('name', document.getElementById('product-name').value);
    formData.append('description', document.getElementById('product-description').value);
    formData.append('category', document.getElementById('product-category').value);
    formData.append('price', document.getElementById('product-price').value);
    formData.append('stock', document.getElementById('product-stock').value);

    const imageFile = document.getElementById('product-image').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    } else {
        const imagePreview = document.getElementById('product-image-preview');
        if (imagePreview.src) {
            formData.append('image', imagePreview.src);
        }
    }

    try {
        const url = productId ? `/products/${productId}` : '/products';
        const method = productId ? 'PUT' : 'POST';

        const response = await fetch(`http://localhost:3000/api${url}`, {
            method: method,
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            alert(productId ? 'Product updated successfully!' : 'Product created successfully!');
            closeProductModal();
            loadProducts();
        } else {
            alert('Error: ' + (result.error || 'Failed to save product'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving product');
    }
}

// Load orders
async function loadOrders() {
    const orders = await fetchAPI('/orders');
    const tableBody = document.getElementById('orders-table');
    
    if (!tableBody) return;

    if (orders && orders.length > 0) {
        tableBody.innerHTML = orders.map(order => {
            const items = JSON.parse(order.items || '[]');
            const itemsList = items.map(item => `${item.name} (x${item.quantity})`).join(', ');
            
            return `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.customer_name || ''}</td>
                    <td>${order.customer_email || ''}</td>
                    <td>${order.customer_phone || ''}</td>
                    <td>${itemsList}</td>
                    <td>$${parseFloat(order.total_amount).toFixed(2)}</td>
                    <td>${order.status || 'pending'}</td>
                    <td>${new Date(order.created_at).toLocaleDateString()}</td>
                    <td>
                        <button class="btn-edit" onclick="viewOrder(${order.id})">View</button>
                    </td>
                </tr>
            `;
        }).join('');
    } else {
        tableBody.innerHTML = '<tr><td colspan="9">No orders found</td></tr>';
    }
}

// View order
function viewOrder(orderId) {
    // Could open a modal or navigate to order details
    alert('Order details for order #' + orderId);
}

// Load sales report
async function loadSalesReport() {
    const monthSelect = document.getElementById('report-month');
    const yearSelect = document.getElementById('report-year');
    const month = monthSelect ? monthSelect.value : String(new Date().getMonth() + 1).padStart(2, '0');
    const year = yearSelect ? yearSelect.value : new Date().getFullYear();

    // Load summary
    const summary = await fetchAPI(`/reports/summary?month=${month}&year=${year}`);
    
    if (summary) {
        document.getElementById('report-total-orders').textContent = summary.total_orders || 0;
        document.getElementById('report-total-revenue').textContent = `$${(summary.total_revenue || 0).toFixed(2)}`;
        document.getElementById('report-avg-order').textContent = `$${(summary.average_order_value || 0).toFixed(2)}`;
    }

    // Load daily sales
    const dailySales = await fetchAPI(`/reports/monthly?month=${month}&year=${year}`);
    
    if (dailySales && dailySales.length > 0) {
        drawSalesChart(dailySales);
    } else {
        // Clear chart if no data
        const canvas = document.getElementById('sales-chart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
}

// Draw sales chart
function drawSalesChart(dailySales) {
    const canvas = document.getElementById('sales-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    canvas.width = container ? container.offsetWidth : 800;
    canvas.height = 400;

    // Simple bar chart
    const maxSales = Math.max(...dailySales.map(d => d.total_sales || 0), 1);
    const barWidth = Math.max((canvas.width - 40) / dailySales.length, 20);
    const maxHeight = canvas.height - 60;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (dailySales.length === 0) {
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No sales data available', canvas.width / 2, canvas.height / 2);
        return;
    }

    ctx.fillStyle = '#667eea';

    dailySales.forEach((day, index) => {
        const barHeight = maxSales > 0 ? ((day.total_sales || 0) / maxSales) * maxHeight : 0;
        const x = 20 + index * barWidth;
        const y = canvas.height - barHeight - 40;

        ctx.fillRect(x + 5, y, barWidth - 10, barHeight);

        // Label
        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        const dateStr = day.date ? day.date.split('-')[2] : '';
        ctx.fillText(dateStr, x + barWidth / 2, canvas.height - 20);
        
        // Value label
        if (barHeight > 20) {
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.fillText('$' + (day.total_sales || 0).toFixed(0), x + barWidth / 2, y + barHeight / 2);
        }
        
        ctx.fillStyle = '#667eea';
    });

    // Y-axis label
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Sales ($)', 10, 20);
}

// Initialize admin page
document.addEventListener('DOMContentLoaded', () => {
    // Load products by default
    loadProducts();

    // Initialize years dropdown
    const yearSelect = document.getElementById('report-year');
    if (yearSelect) {
        const currentYear = new Date().getFullYear();
        for (let i = currentYear; i >= currentYear - 5; i--) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            if (i === currentYear) option.selected = true;
            yearSelect.appendChild(option);
        }
    }

    // Product form submission
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }

    // Image preview
    const imageInput = document.getElementById('product-image');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imagePreview = document.getElementById('product-image-preview');
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Close modal on outside click
    window.onclick = function(event) {
        const productModal = document.getElementById('product-modal');
        if (event.target === productModal) {
            closeProductModal();
        }
    };
});

// Fetch API helper
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`http://localhost:3000/api${endpoint}`, {
            ...options,
            headers: options.headers || {}
        });
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

// Make functions globally available
window.showTab = showTab;
window.showProductModal = showProductModal;
window.closeProductModal = closeProductModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.loadSalesReport = loadSalesReport;
window.viewOrder = viewOrder;

