const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên sản phẩm'],
        trim: true,
        maxlength: [100, 'Tên sản phẩm không được quá 100 ký tự']
    },
    description: {
        type: String,
        required: [true, 'Vui lòng nhập mô tả sản phẩm']
    },
    price: {
        type: Number,
        required: [true, 'Vui lòng nhập giá sản phẩm'],
        min: [0, 'Giá không được âm']
    },
    originalPrice: {
        type: Number,
        default: null
    },
    category: {
        type: String,
        required: [true, 'Vui lòng chọn danh mục'],
        enum: ['men', 'women', 'accessories']
    },
    badge: {
        type: String,
        enum: ['new', 'sale', null],
        default: null
    },
    image: {
        type: String,
        default: ''
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Số lượng không được âm']
    },
    sold: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numReviews: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index để tìm kiếm nhanh
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);