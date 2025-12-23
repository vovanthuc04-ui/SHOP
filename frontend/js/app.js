// ==================== AUTH FUNCTIONS ====================
function login(email, password) {
    return apiClient.login(email, password)
        .then(response => {
            if (response.success) {
                return { success: true, user: response.data };
            }
            return { success: false, message: response.message };
        })
        .catch(error => {
            return { success: false, message: error.message || 'Email hoặc mật khẩu không đúng' };
        });
}

function register(email, password, name) {
    return apiClient.register(name, email, password)
        .then(response => {
            if (response.success) {
                return { success: true, user: response.data };
            }
            return { success: false, message: response.message };
        })
        .catch(error => {
            return { success: false, message: error.message || 'Đăng ký thất bại' };
        });
}

function logout() {
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    window.location.href = 'index.html';
}

function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// ==================== CART FUNCTIONS ====================
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(productId) {
    let cart = getCart();
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            productId: productId,
            name: window.currentProductName || 'Sản phẩm',
            price: window.currentProductPrice || 0,
            image: window.currentProductImage || '', // ← THÊM IMAGE
            quantity: 1
        });
    }
    
    saveCart(cart);
    return { success: true, message: 'Đã thêm vào giỏ hàng' };
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.productId !== productId);
    saveCart(cart);
}

function updateQuantity(productId, quantity) {
    let cart = getCart();
    const item = cart.find(item => item.productId === productId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            saveCart(cart);
        }
    }
}

function clearCart() {
    localStorage.removeItem('cart');
    updateCartCount();
}

function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountEl = document.getElementById('cartCount');
    if (cartCountEl) {
        cartCountEl.textContent = count;
    }
}

// ==================== PRODUCT FUNCTIONS ====================
function getProducts(filters = {}) {
    return apiClient.getProducts(filters)
        .then(response => {
            if (response.success) {
                return response.data;
            }
            return [];
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            return [];
        });
}

function getProductById(id) {
    return apiClient.getProduct(id)
        .then(response => {
            if (response.success) {
                return response.data;
            }
            return null;
        })
        .catch(error => {
            console.error('Error fetching product:', error);
            return null;
        });
}

// ==================== ORDER FUNCTIONS ====================
function createOrder(orderData) {
    const cart = getCart();
    const user = getCurrentUser();
    
    if (!user) {
        return Promise.resolve({
            success: false,
            message: 'Vui lòng đăng nhập'
        });
    }

    const orderItems = cart.map(item => ({
        product: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price
    }));

    const itemsPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingPrice = itemsPrice >= 2000000 ? 0 : 50000;
    const totalPrice = itemsPrice + shippingPrice;

    const order = {
        orderItems,
        shippingInfo: orderData.shippingInfo,
        paymentMethod: orderData.paymentMethod,
        itemsPrice,
        shippingPrice,
        totalPrice
    };

    return apiClient.createOrder(order)
        .then(response => {
            if (response.success) {
                clearCart();
            }
            return response;
        })
        .catch(error => {
            return {
                success: false,
                message: error.message || 'Đặt hàng thất bại'
            };
        });
}

// ==================== UI FUNCTIONS ====================
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(price);
}

function getCategoryName(category) {
    const categories = {
        'men': 'Thời Trang Nam',
        'women': 'Thời Trang Nữ',
        'accessories': 'Phụ Kiện',
        'new': 'Hàng Mới',
        'sale': 'Giảm Giá'
    };
    return categories[category] || category;
}

// ==================== RENDER PRODUCTS - CÓ ẢNH ====================
function renderProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">Không tìm thấy sản phẩm nào</p>';
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                ${product.badge ? `<span class="product-badge ${product.badge}">${product.badge === 'new' ? 'MỚI' : 'SALE'}</span>` : ''}
                ${product.image 
                    ? `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`
                    : `<i class="fas fa-tshirt" style="font-size: 60px; color: #ddd;"></i>`
                }
            </div>
            <div class="product-info">
                <div class="product-category">${getCategoryName(product.category)}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price ${product.originalPrice ? 'sale' : ''}">
                    <span>${formatPrice(product.price)}</span>
                    ${product.originalPrice ? `<span class="original-price">${formatPrice(product.originalPrice)}</span>` : ''}
                </div>
                <button class="add-to-cart" onclick="handleAddToCart('${product._id}', '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.image || ''}')">
                    <i class="fas fa-shopping-cart"></i> Thêm Vào Giỏ
                </button>
            </div>
        </div>
    `).join('');
}

// ==================== HANDLE ADD TO CART - LƯU ẢNH ====================
function handleAddToCart(productId, productName, productPrice, productImage) {
    // Lưu thông tin sản phẩm tạm
    window.currentProductName = productName;
    window.currentProductPrice = productPrice;
    window.currentProductImage = productImage; // ← LƯU ẢNH
    
    const result = addToCart(productId);
    if (result.success) {
        showNotification('Đã thêm sản phẩm vào giỏ hàng!', 'success');
    } else {
        showNotification(result.message, 'error');
    }
}

function showNotification(message, type = 'success') {
    const existingNotifications = document.querySelectorAll('.app-notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = 'app-notification';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==================== SLIDER FUNCTIONS ====================
let currentSlideIndex = 0;

function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    if (!slides.length) return;
    
    slides[currentSlideIndex].classList.remove('active');
    dots[currentSlideIndex].classList.remove('active');
    
    currentSlideIndex += direction;
    
    if (currentSlideIndex >= slides.length) currentSlideIndex = 0;
    if (currentSlideIndex < 0) currentSlideIndex = slides.length - 1;
    
    slides[currentSlideIndex].classList.add('active');
    dots[currentSlideIndex].classList.add('active');
}

function currentSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    if (!slides.length) return;
    
    slides[currentSlideIndex].classList.remove('active');
    dots[currentSlideIndex].classList.remove('active');
    
    currentSlideIndex = index;
    
    slides[currentSlideIndex].classList.add('active');
    dots[currentSlideIndex].classList.add('active');
}

// Auto slide
setInterval(() => {
    if (document.querySelector('.hero-slider')) {
        changeSlide(1);
    }
}, 5000);

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('App initialized!');
    
    updateCartCount();
    
    const user = getCurrentUser();
    const userName = document.getElementById('userName');
    const userBtn = document.getElementById('userBtn');
    
    if (user && userName) {
        userName.textContent = user.name;
        if (userBtn) {
            userBtn.onclick = (e) => {
                e.preventDefault();
                if (confirm('Bạn có muốn đăng xuất?')) {
                    logout();
                }
            };
        }
    }
    
    // Load featured products on homepage
    if (document.getElementById('featuredProducts')) {
        console.log('Loading featured products...');
        getProducts({ badge: 'new', limit: 6 }).then(products => {
            renderProducts(products, 'featuredProducts');
        });
    }
    
    // Search functionality
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `products.html?search=${encodeURIComponent(query)}`;
            }
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }
});

// Animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);