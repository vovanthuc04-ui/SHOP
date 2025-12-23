require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const connectDB = require('./config/db');

// Connect to DB
connectDB();

const seedData = async () => {
    try {
        // Xóa dữ liệu cũ
        await User.deleteMany({});
        await Product.deleteMany({});
        console.log('✅ Đã xóa dữ liệu cũ');

        // Tạo users
        const users = await User.create([
            {
                name: 'Admin User',
                email: 'admin@elite.com',
                password: '123456',
                role: 'admin'
            },
            {
                name: 'Test User',
                email: 'user@elite.com',
                password: '123456',
                role: 'user'
            }
        ]);
        console.log('✅ Đã thêm users mẫu');

        // Tạo products với ảnh từ Unsplash
        const products = await Product.create([
            {
                name: 'Áo Sơ Mi Premium',
                description: 'Áo sơ mi cao cấp từ vải cotton Ai Cập, thiết kế sang trọng, phù hợp công sở và dự tiệc',
                price: 1200000,
                originalPrice: null,
                category: 'men',
                badge: 'new',
                image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&h=500&fit=crop',
                stock: 50,
                sold: 5,
                rating: 4.8,
                isActive: true
            },
            {
                name: 'Quần Tây Lịch Lãm',
                description: 'Quần tây form chuẩn, vải co giãn nhẹ, thoải mái cho cả ngày dài làm việc',
                price: 1500000,
                originalPrice: null,
                category: 'men',
                badge: null,
                image: 'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=500&h=500&fit=crop',
                stock: 40,
                sold: 8,
                rating: 4.5,
                isActive: true
            },
            {
                name: 'Blazer Sang Trọng',
                description: 'Blazer cao cấp, thiết kế tối giản, dễ phối đồ, phù hợp mọi dịp',
                price: 2500000,
                originalPrice: 3500000,
                category: 'men',
                badge: 'sale',
                image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&h=500&fit=crop',
                stock: 30,
                sold: 12,
                rating: 5.0,
                isActive: true
            },
            {
                name: 'Váy Dạ Hội',
                description: 'Váy dạ hội lụa cao cấp, thiết kế thanh lịch, hoàn hảo cho các buổi tiệc',
                price: 3200000,
                originalPrice: null,
                category: 'women',
                badge: 'new',
                image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=500&fit=crop',
                stock: 25,
                sold: 3,
                rating: 4.9,
                isActive: true
            },
            {
                name: 'Áo Kiểu Nữ',
                description: 'Áo kiểu nữ thanh lịch, vải mềm mại, thoáng mát, phù hợp công sở',
                price: 980000,
                originalPrice: null,
                category: 'women',
                badge: null,
                image: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=500&h=500&fit=crop',
                stock: 60,
                sold: 15,
                rating: 4.6,
                isActive: true
            },
            {
                name: 'Chân Váy A',
                description: 'Chân váy form A thời trang, dễ phối đồ, phù hợp mọi vóc dáng',
                price: 850000,
                originalPrice: 1200000,
                category: 'women',
                badge: 'sale',
                image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500&h=500&fit=crop',
                stock: 45,
                sold: 20,
                rating: 4.7,
                isActive: true
            },
            {
                name: 'Túi Xách Da Thật',
                description: 'Túi xách da bò thật 100%, thủ công tinh xảo, bền đẹp theo năm tháng',
                price: 2800000,
                originalPrice: null,
                category: 'accessories',
                badge: 'new',
                image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&h=500&fit=crop',
                stock: 20,
                sold: 7,
                rating: 5.0,
                isActive: true
            },
            {
                name: 'Giày Tây Nam',
                description: 'Giày tây da cao cấp, đế cao su êm ái, phù hợp công sở và dự tiệc',
                price: 1600000,
                originalPrice: null,
                category: 'accessories',
                badge: null,
                image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=500&h=500&fit=crop',
                stock: 35,
                sold: 10,
                rating: 4.4,
                isActive: true
            },
            {
                name: 'Thắt Lưng Da',
                description: 'Thắt lưng da bò thật, khóa kim loại cao cấp, thiết kế cổ điển',
                price: 650000,
                originalPrice: 900000,
                category: 'accessories',
                badge: 'sale',
                image: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m48u7zh0eci7a0@resize_w900_nl.webp',
                stock: 70,
                sold: 25,
                rating: 4.3,
                isActive: true
            },
            {
                name: 'Áo Khoác Dạ',
                description: 'Áo khoác dạ cao cấp mùa đông, giữ ấm tốt, thiết kế hiện đại',
                price: 3500000,
                originalPrice: null,
                category: 'men',
                badge: 'new',
                image: 'https://images.openai.com/thumbnails/url/9glUwHicDcnbCoIwAADQL_KCQjYhYoVzlqUZEfU253JeN3Om9lH9T39T5_V8P1wp2buGwVr6nKVimabS1tLzXhFVUJ2Kxui5kLJo83W3-p8Ljxnw6WnI_dc4UK2rEpxkYXGPz3PemEXJwSkNorS2hX1z9loYV3YYNNVlMheIXO_ijQEaPeKreJ7OYIOjBApC2MI-OBV0Hh6HCANWQrST25p75WRdaL11wBws2Q8-FD17',
                stock: 15,
                sold: 4,
                rating: 4.9,
                isActive: true
            },
            {
                name: 'Đầm Công Sở',
                description: 'Đầm công sở thanh lịch, vải cotton cao cấp, form dáng chuẩn',
                price: 1200000,
                originalPrice: null,
                category: 'women',
                badge: null,
                image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&h=500&fit=crop',
                stock: 40,
                sold: 18,
                rating: 4.6,
                isActive: true
            },
            {
                name: 'Ví Da Nam',
                description: 'Ví da cao cấp nhiều ngăn, thiết kế nhỏ gọn, tiện lợi',
                price: 450000,
                originalPrice: 650000,
                category: 'accessories',
                badge: 'sale',
                image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&h=500&fit=crop',
                stock: 80,
                sold: 30,
                rating: 4.5,
                isActive: true
            }
        ]);

        console.log('✅ Đã thêm products mẫu với ảnh');
        console.log(`📸 Đã thêm ${products.length} sản phẩm với ảnh từ Unsplash`);
        console.log('\n🎉 Seed data thành công!\n');
        console.log('📝 Thông tin đăng nhập:');
        console.log('👤 Admin: admin@elite.com / 123456');
        console.log('👤 User: user@elite.com / 123456\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
};

seedData();