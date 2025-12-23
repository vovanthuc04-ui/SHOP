const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
const protect = async (req, res, next) => {
    let token;

    console.log('🔐 ========== AUTH MIDDLEWARE ==========');
    
    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            console.log('✅ Token found in Authorization header');
            console.log('   Token (first 30 chars):', token.substring(0, 30) + '...');

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production');

            console.log('✅ Token verified successfully');
            console.log('   User ID from token:', decoded.id);
            console.log('   Token issued at:', new Date(decoded.iat * 1000).toISOString());
            console.log('   Token expires at:', new Date(decoded.exp * 1000).toISOString());

            // Get user from token (exclude password)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                console.log('❌ User not found in database');
                return res.status(401).json({
                    success: false,
                    message: 'Không tìm thấy người dùng'
                });
            }

            console.log('✅ User authenticated:');
            console.log('   User ID:', req.user._id);
            console.log('   Email:', req.user.email);
            console.log('   Name:', req.user.name);
            console.log('   Role:', req.user.role);
            console.log('========================================\n');

            next();

        } catch (error) {
            console.error('❌ Token verification failed');
            console.error('   Error:', error.message);
            console.error('========================================\n');
            
            return res.status(401).json({
                success: false,
                message: 'Token không hợp lệ hoặc đã hết hạn'
            });
        }
    }

    if (!token) {
        console.log('❌ No token provided');
        console.log('   Authorization header:', req.headers.authorization);
        console.log('========================================\n');
        
        return res.status(401).json({
            success: false,
            message: 'Vui lòng đăng nhập để tiếp tục'
        });
    }
};

// Admin middleware
const admin = (req, res, next) => {
    console.log('👑 ========== ADMIN CHECK ==========');
    console.log('   User ID:', req.user._id);
    console.log('   User role:', req.user.role);
    
    if (req.user && req.user.role === 'admin') {
        console.log('✅ Admin access granted');
        console.log('===================================\n');
        next();
    } else {
        console.log('❌ Admin access denied - User is not admin');
        console.log('===================================\n');
        
        res.status(403).json({
            success: false,
            message: 'Chỉ admin mới có quyền truy cập'
        });
    }
};

module.exports = { protect, admin };