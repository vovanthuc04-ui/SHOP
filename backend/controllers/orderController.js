const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    try {
        console.log('📦 ========== CREATING NEW ORDER ==========');
        console.log('👤 User ID:', req.user._id);
        console.log('📧 User Email:', req.user.email);
        console.log('📋 Request Body:', JSON.stringify(req.body, null, 2));

        const {
            orderItems,
            shippingInfo,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalPrice
        } = req.body;

        // ========== VALIDATION ==========
        
        // 1. Validate order items
        if (!orderItems || orderItems.length === 0) {
            console.log('❌ Validation failed: Empty cart');
            return res.status(400).json({
                success: false,
                message: 'Giỏ hàng trống'
            });
        }

        console.log('✅ Order items:', orderItems.length, 'items');

        // 2. Validate shipping info - KHỚP VỚI MODEL
        if (!shippingInfo) {
            console.log('❌ Validation failed: Missing shippingInfo');
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin giao hàng'
            });
        }

        // Check required fields theo model của bạn
        const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'district'];
        const missingFields = requiredFields.filter(field => !shippingInfo[field]);
        
        if (missingFields.length > 0) {
            console.log('❌ Validation failed: Missing fields:', missingFields);
            return res.status(400).json({
                success: false,
                message: `Thiếu thông tin bắt buộc: ${missingFields.join(', ')}`
            });
        }

        console.log('✅ Shipping info complete');
        console.log('   - Full Name:', shippingInfo.fullName);
        console.log('   - Email:', shippingInfo.email);
        console.log('   - Phone:', shippingInfo.phone);
        console.log('   - Address:', shippingInfo.address);
        console.log('   - City:', shippingInfo.city);
        console.log('   - District:', shippingInfo.district);

        // 3. Validate payment method
        const validPaymentMethods = ['cod', 'bank', 'card', 'momo'];
        if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
            console.log('❌ Validation failed: Invalid payment method:', paymentMethod);
            return res.status(400).json({
                success: false,
                message: 'Phương thức thanh toán không hợp lệ. Chọn: cod, bank, card, hoặc momo'
            });
        }

        console.log('✅ Payment method:', paymentMethod);

        // 4. Validate prices
        if (itemsPrice === undefined || shippingPrice === undefined || totalPrice === undefined) {
            console.log('❌ Validation failed: Missing price data');
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin giá'
            });
        }

        console.log('✅ Prices validated');
        console.log('   - Items:', itemsPrice);
        console.log('   - Shipping:', shippingPrice);
        console.log('   - Total:', totalPrice);

        // ========== CREATE ORDER - KHỚP VỚI MODEL ==========
        console.log('💾 Creating order document...');

        const order = new Order({
            user: req.user._id,
            orderItems: orderItems.map(item => ({
                product: item.productId || item.product,
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            shippingInfo: {
                fullName: shippingInfo.fullName,
                email: shippingInfo.email,
                phone: shippingInfo.phone,
                address: shippingInfo.address,
                city: shippingInfo.city,
                district: shippingInfo.district,
                note: shippingInfo.note || ''
            },
            paymentMethod: paymentMethod,
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
            itemsPrice: itemsPrice,
            shippingPrice: shippingPrice,
            totalPrice: totalPrice,
            orderStatus: 'pending'
        });

        console.log('💾 Saving to database...');
        const createdOrder = await order.save();

        console.log('✅ ========== ORDER CREATED SUCCESSFULLY ==========');
        console.log('🆔 Order ID:', createdOrder._id);
        console.log('👤 User:', createdOrder.user);
        console.log('📦 Items:', createdOrder.orderItems.length);
        console.log('💰 Total:', createdOrder.totalPrice);
        console.log('📍 Status:', createdOrder.orderStatus);
        console.log('=============================================\n');

        res.status(201).json({
            success: true,
            message: 'Đặt hàng thành công',
            data: createdOrder
        });

    } catch (error) {
        console.error('❌ ========== ERROR CREATING ORDER ==========');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Mongoose validation error
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            console.error('Validation errors:', messages);
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: messages
            });
        }

        // Cast error (invalid ObjectId)
        if (error.name === 'CastError') {
            console.error('Cast error:', error.message);
            return res.status(400).json({
                success: false,
                message: 'ID không hợp lệ'
            });
        }

        console.error('=============================================\n');
        
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi tạo đơn hàng',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res) => {
    try {
        console.log('🔍 Getting order:', req.params.id);
        console.log('👤 Requested by user:', req.user._id);

        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('orderItems.product', 'name price image');

        if (!order) {
            console.log('❌ Order not found');
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        // Check if user owns this order or is admin
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            console.log('❌ Unauthorized access attempt');
            console.log('   Order owner:', order.user._id);
            console.log('   Requester:', req.user._id);
            return res.status(403).json({
                success: false,
                message: 'Không có quyền truy cập đơn hàng này'
            });
        }

        console.log('✅ Order found and authorized');

        res.json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error('❌ Error getting order:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi lấy thông tin đơn hàng'
        });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        console.log('📋 Getting orders for user:', req.user._id);

        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate('orderItems.product', 'name price image');

        console.log('✅ Found', orders.length, 'orders');

        res.json({
            success: true,
            count: orders.length,
            data: orders
        });

    } catch (error) {
        console.error('❌ Error getting my orders:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi lấy danh sách đơn hàng'
        });
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
    try {
        console.log('📊 Admin getting all orders');

        const orders = await Order.find({})
            .populate('user', 'name email')
            .populate('orderItems.product', 'name price image')
            .sort({ createdAt: -1 });

        console.log('✅ Found', orders.length, 'total orders');

        res.json({
            success: true,
            count: orders.length,
            data: orders
        });

    } catch (error) {
        console.error('❌ Error getting all orders:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi lấy danh sách đơn hàng'
        });
    }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        console.log('🔄 Updating order status:', req.params.id);
        console.log('New status data:', req.body);

        const order = await Order.findById(req.params.id);

        if (!order) {
            console.log('❌ Order not found');
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        const { orderStatus, paymentStatus } = req.body;

        // Update order status
        if (orderStatus) {
            const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
            if (!validStatuses.includes(orderStatus)) {
                return res.status(400).json({
                    success: false,
                    message: 'Trạng thái đơn hàng không hợp lệ'
                });
            }
            order.orderStatus = orderStatus;
            
            // Set deliveredAt if status is delivered
            if (orderStatus === 'delivered') {
                order.deliveredAt = Date.now();
                console.log('📦 Order marked as delivered');
            }
        }

        // Update payment status
        if (paymentStatus) {
            const validPaymentStatuses = ['pending', 'paid', 'failed'];
            if (!validPaymentStatuses.includes(paymentStatus)) {
                return res.status(400).json({
                    success: false,
                    message: 'Trạng thái thanh toán không hợp lệ'
                });
            }
            order.paymentStatus = paymentStatus;
        }

        const updatedOrder = await order.save();

        console.log('✅ Order status updated');
        console.log('   Order Status:', updatedOrder.orderStatus);
        console.log('   Payment Status:', updatedOrder.paymentStatus);

        res.json({
            success: true,
            message: 'Cập nhật trạng thái thành công',
            data: updatedOrder
        });

    } catch (error) {
        console.error('❌ Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi cập nhật trạng thái đơn hàng'
        });
    }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
    try {
        console.log('🚫 Cancelling order:', req.params.id);
        console.log('👤 Requested by user:', req.user._id);

        const order = await Order.findById(req.params.id);

        if (!order) {
            console.log('❌ Order not found');
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        // Check if user owns this order
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            console.log('❌ Unauthorized cancel attempt');
            return res.status(403).json({
                success: false,
                message: 'Không có quyền hủy đơn hàng này'
            });
        }

        // Can only cancel pending or processing orders
        if (order.orderStatus !== 'pending' && order.orderStatus !== 'processing') {
            console.log('❌ Cannot cancel order with status:', order.orderStatus);
            return res.status(400).json({
                success: false,
                message: `Không thể hủy đơn hàng đang ở trạng thái "${order.orderStatus}"`
            });
        }

        order.orderStatus = 'cancelled';
        const updatedOrder = await order.save();

        console.log('✅ Order cancelled successfully');

        res.json({
            success: true,
            message: 'Đã hủy đơn hàng',
            data: updatedOrder
        });

    } catch (error) {
        console.error('❌ Error cancelling order:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi hủy đơn hàng'
        });
    }
};

module.exports = {
    createOrder,
    getOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    cancelOrder
};