// Shopping Cart JavaScript

// Cart data structure
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let totalItems = 0;
let totalPrice = 0;

// DOM element selectors - will be used once the DOM is loaded
let cartItemsElement;
let cartTotalElement;
let cartCountElement;

// Initialize the cart when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart UI elements if on cart page
    if (document.querySelector('.cart-items')) {
        cartItemsElement = document.querySelector('.cart-items');
        cartTotalElement = document.querySelector('.cart-total-amount');
        
        // Display existing cart items
        displayCartItems();
        
        // Add event listener for the clear cart button if it exists
        const clearCartButton = document.querySelector('.clear-cart');
        if (clearCartButton) {
            clearCartButton.addEventListener('click', clearCart);
        }
    }
    
    // Initialize cart count in navbar
    updateCartCount();
    
    // Add event listeners to all "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            // Get product details from parent elements
            const productItem = button.closest('.collection-item') || button.closest('.product-container');
            if (!productItem) return;
            
            // Get product information
            const productName = productItem.querySelector('h3') ? 
                               productItem.querySelector('h3').textContent : 
                               (productItem.querySelector('.product-title') ? 
                                productItem.querySelector('.product-title').textContent : 'Unknown Product');
            
            const productPrice = productItem.querySelector('p') ? 
                                productItem.querySelector('p').textContent : 
                                (productItem.querySelector('.product-price') ? 
                                 productItem.querySelector('.product-price').textContent : '0 DA');
            
            // Get image source if available
            const productImage = productItem.querySelector('img') ? 
                                productItem.querySelector('img').src : '';
            
            // Get selected size and color if on product detail page
            let selectedSize = 'One Size';
            let selectedColor = '';
            
            if (productItem.querySelector('.size-option.active')) {
                selectedSize = productItem.querySelector('.size-option.active').textContent;
            }
            
            if (productItem.querySelector('.color-option.active')) {
                const activeColor = productItem.querySelector('.color-option.active');
                selectedColor = activeColor.title || getComputedStyle(activeColor).backgroundColor;
            }
            
            // Extract price as number
            const priceValue = parseFloat(productPrice.replace(/[^0-9.]/g, ''));
            
            // Create product object
            const product = {
                id: generateUniqueId(),
                name: productName,
                price: priceValue,
                priceFormatted: productPrice,
                image: productImage,
                size: selectedSize,
                color: selectedColor,
                quantity: 1
            };
            
            // Add product to cart
            addToCart(product);
            
            // Show success message
            showNotification(`Added "${productName}" to cart!`);
        });
    });
    
    // Add event listeners to size options if on product detail page
    const sizeOptions = document.querySelectorAll('.size-option');
    sizeOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all size options
            sizeOptions.forEach(opt => opt.classList.remove('active'));
            // Add active class to clicked option
            option.classList.add('active');
        });
    });
    
    // Add event listeners to color options if on product detail page
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all color options
            colorOptions.forEach(opt => opt.classList.remove('active'));
            // Add active class to clicked option
            option.classList.add('active');
        });
    });
});

// Generate a unique ID for cart items
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Add item to cart
function addToCart(product) {
    // Check if product is already in cart
    const existingProductIndex = cart.findIndex(item => 
        item.name === product.name && 
        item.size === product.size && 
        item.color === product.color
    );
    
    if (existingProductIndex > -1) {
        // Product exists, increase quantity
        cart[existingProductIndex].quantity += 1;
    } else {
        // Product doesn't exist, add new item
        cart.push(product);
    }
    
    // Save cart to localStorage
    saveCart();
    
    // Update UI
    updateCartCount();
    
    // If on cart page, refresh the display
    if (cartItemsElement) {
        displayCartItems();
    }
}

// Remove item from cart
function removeFromCart(productId) {
    // Filter out the product with the given ID
    cart = cart.filter(item => item.id !== productId);
    
    // Save cart to localStorage
    saveCart();
    
    // Update UI
    updateCartCount();
    
    // If on cart page, refresh the display
    if (cartItemsElement) {
        displayCartItems();
    }
}

// Update item quantity
function updateQuantity(productId, newQuantity) {
    // Find the product
    const productIndex = cart.findIndex(item => item.id === productId);
    
    if (productIndex > -1) {
        // Ensure quantity is at least 1
        newQuantity = Math.max(1, newQuantity);
        
        // Update quantity
        cart[productIndex].quantity = newQuantity;
        
        // Save cart to localStorage
        saveCart();
        
        // Update UI
        updateCartCount();
        
        // If on cart page, refresh the display
        if (cartItemsElement) {
            displayCartItems();
        }
    }
}

// Clear the entire cart
function clearCart() {
    // Empty the cart array
    cart = [];
    
    // Save empty cart to localStorage
    saveCart();
    
    // Update UI
    updateCartCount();
    
    // If on cart page, refresh the display
    if (cartItemsElement) {
        displayCartItems();
    }
    
    showNotification("Cart cleared!");
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Calculate totals
    calculateCartTotals();
}

// Calculate cart totals
function calculateCartTotals() {
    totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Update cart count in the UI
function updateCartCount() {
    calculateCartTotals();
    
    // Create or update cart count element in navbar
    let countElement = document.querySelector('.cart-count');
    
    if (!countElement) {
        // If count element doesn't exist, create it
        const cartLink = document.querySelector('a[href="cart.html"]');
        if (cartLink) {
            countElement = document.createElement('span');
            countElement.className = 'cart-count';
            cartLink.appendChild(countElement);
        }
    }
    
    // Update count if element exists
    if (countElement) {
        countElement.textContent = totalItems > 0 ? totalItems : '';
        countElement.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
}

// Display cart items on the cart page
function displayCartItems() {
    if (!cartItemsElement) return;
    
    // Clear current cart items
    cartItemsElement.innerHTML = '';
    
    if (cart.length === 0) {
        // Display empty cart message
        cartItemsElement.innerHTML = '<div class="empty-cart"><p>Your cart is empty</p><a href="indeex.html" class="continue-shopping">Continue Shopping</a></div>';
        cartTotalElement.textContent = '0 DA';
        return;
    }
    
    // Add each cart item to the display
    cart.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p>${item.priceFormatted}</p>
                ${item.size !== 'One Size' ? `<p>Size: ${item.size}</p>` : ''}
                ${item.color ? `<p>Color: ${item.color}</p>` : ''}
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-decrease" data-id="${item.id}">-</button>
                <span class="quantity-value">${item.quantity}</span>
                <button class="quantity-increase" data-id="${item.id}">+</button>
            </div>
            <div class="cart-item-price">
                ${(item.price * item.quantity).toFixed(0)} DA
            </div>
            <button class="remove-item" data-id="${item.id}">×</button>
        `;
        
        cartItemsElement.appendChild(cartItemElement);
    });
    
    // Add event listeners to quantity and remove buttons
    document.querySelectorAll('.quantity-decrease').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const currentItem = cart.find(item => item.id === productId);
            if (currentItem && currentItem.quantity > 1) {
                updateQuantity(productId, currentItem.quantity - 1);
            }
        });
    });
    
    document.querySelectorAll('.quantity-increase').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const currentItem = cart.find(item => item.id === productId);
            if (currentItem) {
                updateQuantity(productId, currentItem.quantity + 1);
            }
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            removeFromCart(productId);
        });
    });
    
    // Update cart total
    if (cartTotalElement) {
        cartTotalElement.textContent = `${totalPrice.toFixed(0)} DA`;
    }
}

// Show notification popup
function showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Set message and show notification
    notification.textContent = message;
    notification.classList.add('show');
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}