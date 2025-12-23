// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://localhost:5000/api',
    ENDPOINTS: {
        // Auth
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        ME: '/auth/me',
        
        // Products
        PRODUCTS: '/products',
        PRODUCT_BY_ID: (id) => `/products/${id}`,
        
        // Orders
        ORDERS: '/orders',
        MY_ORDERS: '/orders/myorders',
        ORDER_BY_ID: (id) => `/orders/${id}`,
        CANCEL_ORDER: (id) => `/orders/${id}/cancel`
    },
    TIMEOUT: 30000
};

// HTTP Helper Functions
class APIClient {
    constructor() {
        this.token = localStorage.getItem('authToken');
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }

    getHeaders(isAuth = false) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (isAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    async request(endpoint, options = {}) {
        const { method = 'GET', body, isAuth = false } = options;
        
        const config = {
            method,
            headers: this.getHeaders(isAuth)
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Có lỗi xảy ra');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth Methods
    async login(email, password) {
        const response = await this.request(API_CONFIG.ENDPOINTS.LOGIN, {
            method: 'POST',
            body: { email, password }
        });
        
        if (response.success && response.data.token) {
            this.setToken(response.data.token);
            localStorage.setItem('currentUser', JSON.stringify(response.data));
        }
        
        return response;
    }

    async register(name, email, password) {
        const response = await this.request(API_CONFIG.ENDPOINTS.REGISTER, {
            method: 'POST',
            body: { name, email, password }
        });
        
        if (response.success && response.data.token) {
            this.setToken(response.data.token);
            localStorage.setItem('currentUser', JSON.stringify(response.data));
        }
        
        return response;
    }

    async getMe() {
        return await this.request(API_CONFIG.ENDPOINTS.ME, {
            isAuth: true
        });
    }

    logout() {
        this.setToken(null);
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    // Product Methods
    async getProducts(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`${API_CONFIG.ENDPOINTS.PRODUCTS}?${params}`);
    }

    async getProduct(id) {
        return await this.request(API_CONFIG.ENDPOINTS.PRODUCT_BY_ID(id));
    }

    // Order Methods
    async createOrder(orderData) {
        return await this.request(API_CONFIG.ENDPOINTS.ORDERS, {
            method: 'POST',
            body: orderData,
            isAuth: true
        });
    }

    async getMyOrders() {
        return await this.request(API_CONFIG.ENDPOINTS.MY_ORDERS, {
            isAuth: true
        });
    }

    async getOrder(id) {
        return await this.request(API_CONFIG.ENDPOINTS.ORDER_BY_ID(id), {
            isAuth: true
        });
    }

    async cancelOrder(id) {
        return await this.request(API_CONFIG.ENDPOINTS.CANCEL_ORDER(id), {
            method: 'PUT',
            isAuth: true
        });
    }
}

// Export singleton instance
const apiClient = new APIClient();