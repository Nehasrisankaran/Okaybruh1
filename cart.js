// Cart functionality
const API_BASE = 'http://localhost:3000/api';
let sessionId = localStorage.getItem('sessionId');

// Load cart items
async function loadCart() {
    const cartItems = await fetchAPI(`/cart/${sessionId}`);
    
    if (!cartItems || cartItems.length === 0) {
        displayEmptyCart();
        return;
    }

    displayCartItems(cartItems);
    calculateTotal(cartItems);
    updateCartCount();
}

// Display empty cart message
function displayEmptyCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <h3>Your cart is empty</h3>
                <p>Start shopping to add items to your cart!</p>
                <a href="products.html" class="btn-primary">Browse Products</a>
            </div>
        `;
    }
    updateTotals(0, 0, 0);
}

// Display cart items
function displayCartItems(cartItems) {
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = cartItems.map(item => `
        <div class="cart-item" data-cart-id="${item.id}">
            <img src="${item.image || '/images/placeholder.jpg'}" alt="${item.name}" class="cart-item-image" onerror="this.src='/images/placeholder.jpg'">
            <div class="cart-item-info">
                <h3 class="cart-item-name">${item.name}</h3>
                <p class="cart-item-description">${item.description || ''}</p>
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
}

// Update quantity
async function updateQuantity(cartId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(cartId);
        return;
    }

    const response = await fetchAPI(`/cart/${cartId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity: parseInt(newQuantity) })
    });

    if (response) {
        loadCart();
    }
}

// Remove from cart
async function removeFromCart(cartId) {
    if (confirm('Are you sure you want to remove this item from cart?')) {
        const response = await fetchAPI(`/cart/${cartId}`, {
            method: 'DELETE'
        });

        if (response) {
            loadCart();
        }
    }
}

// Clear cart
async function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        const response = await fetchAPI(`/cart/clear/${sessionId}`, {
            method: 'DELETE'
        });

        if (response) {
            loadCart();
            alert('Cart cleared!');
        }
    }
}

// Calculate total
function calculateTotal(cartItems) {
    const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    updateTotals(subtotal, tax, total);
}

// Update totals display
function updateTotals(subtotal, tax, total) {
    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

// Checkout
async function checkout() {
    const cartItems = await fetchAPI(`/cart/${sessionId}`);
    
    if (!cartItems || cartItems.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    // Show checkout modal
    const modal = document.getElementById('checkout-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Handle checkout form submission
async function handleCheckout(e) {
    e.preventDefault();

    const customerName = document.getElementById('customer-name').value;
    const customerEmail = document.getElementById('customer-email').value;
    const customerPhone = document.getElementById('customer-phone').value;
    const paymentMethod = document.getElementById('payment-method').value;

    const cartItems = await fetchAPI(`/cart/${sessionId}`);
    
    if (!cartItems || cartItems.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    const items = cartItems.map(item => ({
        id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
    }));

    // Create order (regardless of payment method - QR code is just for display)
    const orderResponse = await fetchAPI('/orders', {
        method: 'POST',
        body: JSON.stringify({
            customerName: customerName,
            customerEmail: customerEmail,
            customerPhone: customerPhone,
            items: items,
            totalAmount: total,
            sessionId: sessionId
        })
    });

    if (orderResponse) {
        // If QR code payment, generate QR code before showing bill
        if (paymentMethod === 'qrcode') {
            await generateQRCode(total, orderResponse.id);
        }
        
        // Show bill
        await showBill(orderResponse.id, customerName, customerEmail, customerPhone, items, subtotal, tax, total, paymentMethod);
        closeModal('checkout-modal');
        loadCart(); // Reload cart (should be empty now)
    }
}

// Generate QR code for payment
async function generateQRCode(amount, orderId) {
    const orderIdStr = orderId || 'ORDER_' + Date.now();
    
    try {
        const response = await fetchAPI('/payment/qrcode', {
            method: 'POST',
            body: JSON.stringify({
                amount: amount,
                orderId: orderIdStr
            })
        });

        if (response && response.qrCode) {
            const qrcodeDisplay = document.getElementById('qrcode-display');
            const qrCodeHtml = `<img src="${response.qrCode}" alt="QR Code" style="max-width: 200px; border: 1px solid #ddd; padding: 1rem; background: white;">`;
            
            if (qrcodeDisplay) {
                qrcodeDisplay.innerHTML = qrCodeHtml;
            }
            
            // Store QR code for use in bill
            window.lastQRCode = qrCodeHtml;
        }
    } catch (error) {
        console.error('Error generating QR code:', error);
    }
}

// Show bill
async function showBill(orderId, customerName, customerEmail, customerPhone, items, subtotal, tax, total, paymentMethod = '') {
    document.getElementById('bill-order-id').textContent = orderId;
    document.getElementById('bill-date').textContent = new Date().toLocaleDateString();
    document.getElementById('bill-customer-name').textContent = customerName;
    document.getElementById('bill-customer-email').textContent = customerEmail;
    document.getElementById('bill-customer-phone').textContent = customerPhone;
    
    const paymentMethodEl = document.getElementById('bill-payment-method');
    if (paymentMethodEl) {
        paymentMethodEl.textContent = paymentMethod === 'qrcode' ? 'PayNow (QR Code)' : paymentMethod === 'cash' ? 'Cash on Delivery' : paymentMethod || 'N/A';
    }
    
    const billItemsTable = document.querySelector('#bill-items-table tbody');
    if (billItemsTable) {
        billItemsTable.innerHTML = items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>$${parseFloat(item.price).toFixed(2)}</td>
                <td>$${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
            </tr>
        `).join('');
    }

    const billSubtotalEl = document.getElementById('bill-subtotal');
    const billTaxEl = document.getElementById('bill-tax');
    const billTotalEl = document.getElementById('bill-total');
    
    if (billSubtotalEl) billSubtotalEl.textContent = subtotal.toFixed(2);
    if (billTaxEl) billTaxEl.textContent = tax.toFixed(2);
    if (billTotalEl) billTotalEl.textContent = total.toFixed(2);

    // Show QR code in bill if payment method is QR code
    const billQrcodeContainer = document.getElementById('bill-qrcode-container');
    if (billQrcodeContainer) {
        if (paymentMethod === 'qrcode' && window.lastQRCode) {
            billQrcodeContainer.innerHTML = `<h3>Scan to Pay</h3>${window.lastQRCode}`;
            billQrcodeContainer.style.display = 'block';
        } else {
            billQrcodeContainer.style.display = 'none';
        }
    }

    const billModal = document.getElementById('bill-modal');
    if (billModal) {
        billModal.style.display = 'block';
    }
}

// Close bill modal
function closeBillModal() {
    closeModal('bill-modal');
}

// Initialize cart page
if (document.getElementById('cart-items')) {
    document.addEventListener('DOMContentLoaded', () => {
        loadCart();

        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', checkout);
        }

        // Clear cart button
        const clearCartBtn = document.getElementById('clear-cart-btn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', clearCart);
        }

        // Checkout form
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', handleCheckout);
        }

        // Payment method change
        const paymentMethod = document.getElementById('payment-method');
        if (paymentMethod) {
            paymentMethod.addEventListener('change', async (e) => {
                const qrcodeContainer = document.getElementById('qrcode-container');
                if (e.target.value === 'qrcode') {
                    qrcodeContainer.style.display = 'block';
                    // Get cart items and calculate total
                    const cartItems = await fetchAPI(`/cart/${sessionId}`);
                    if (cartItems && cartItems.length > 0) {
                        const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
                        const tax = subtotal * 0.1;
                        const total = subtotal + tax;
                        // Generate QR code with temporary order ID (will be updated when order is created)
                        await generateQRCode(total);
                    } else {
                        qrcodeContainer.style.display = 'none';
                        alert('Please add items to cart first');
                    }
                } else {
                    qrcodeContainer.style.display = 'none';
                }
            });
        }

        // Close modals on click outside
        window.onclick = function(event) {
            const checkoutModal = document.getElementById('checkout-modal');
            const billModal = document.getElementById('bill-modal');
            if (event.target === checkoutModal) {
                checkoutModal.style.display = 'none';
            }
            if (event.target === billModal) {
                billModal.style.display = 'none';
            }
        }

        // Close button handlers
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', function() {
                this.closest('.modal').style.display = 'none';
            });
        });
    });
}

// Make functions globally available
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.closeBillModal = closeBillModal;

