<?php

// Import controller untuk manajemen akun, profil, dan buku alamat user
use App\Http\Controllers\AccountController;
// Import controller untuk autentikasi portal admin
use App\Http\Controllers\Admin\AuthController as AdminAuthController;
// Import controller untuk mengelola daftar inquiry di halaman admin (diberi alias agar tidak bentrok)
use App\Http\Controllers\Admin\InquiryController as AdminInquiryController;
// Import controller untuk mengelola konten landing page di halaman admin
use App\Http\Controllers\Admin\LandingContentController;
// Import controller untuk mengelola pesanan & tracking parcel 4 tahap di halaman admin
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
// Import controller untuk mengelola CRUD partner korporat di halaman admin
use App\Http\Controllers\Admin\PartnerController as AdminPartnerController;
// Import controller untuk mengelola CRUD produk hampers di halaman admin
use App\Http\Controllers\Admin\ProductController as AdminProductController;
// Import controller untuk 3D Customizer & pemutar video ucapan B2B
use App\Http\Controllers\Auth\GoogleAuthController;
// Import controller untuk autentikasi Google OAuth khusus pelanggan
use App\Http\Controllers\B2BCustomizerController;
// Import controller untuk keranjang belanja user
use App\Http\Controllers\CartController;
// Import controller untuk menampilkan katalog produk aktif di halaman depan (publik)
use App\Http\Controllers\CatalogController;
// Import controller untuk proses checkout pesanan internal
use App\Http\Controllers\CheckoutController;
// Import controller untuk dashboard admin
use App\Http\Controllers\DashboardController;
// Import controller publik untuk memproses pengiriman form inquiry corporate
use App\Http\Controllers\InquiryController;
// Import facade Route bawaan Laravel untuk mendefinisikan jalur URL aplikasi
use Illuminate\Support\Facades\Route;

// Route halaman utama (/). Memanggil CatalogController@index untuk mengirim data produk aktif sebagai props ke React
Route::get('/', [CatalogController::class, 'index'])->name('home');
Route::get('/katalog', [CatalogController::class, 'catalog'])->name('catalog');

// Route publik pratinjau 3D Luxury Gift Box Customizer (B2C & B2B)
Route::get('/b2b/customizer', [B2BCustomizerController::class, 'index'])->name('b2b.customizer');

// Route publik untuk memutar video ucapan B2B melalui pemindaian QR Code
Route::get('/greeting/{token}', [B2BCustomizerController::class, 'showGreeting'])->name('greeting.show');

// Route untuk menerima data form inquiry corporate (method POST)
// middleware('throttle:5,1') membatasi maksimal 5 kali pengiriman per menit per IP untuk mencegah spam
Route::post('/inquiries', [InquiryController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('inquiries.store');

// Grup route hanya bisa diakses oleh user/admin yang sudah login ('auth') dan terverifikasi ('verified')
Route::middleware(['auth', 'verified'])->group(function () {

    // Route halaman utama dashboard admin (/dashboard)
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Route manajemen akun pelanggan (edit profil, password, buku alamat, riwayat & tracking pesanan)
    Route::get('/account', [AccountController::class, 'index'])->name('account.index');
    Route::patch('/account/profile', [AccountController::class, 'updateProfile'])->name('account.profile.update');
    Route::put('/account/password', [AccountController::class, 'updatePassword'])->name('account.password.update');

    Route::post('/account/addresses', [AccountController::class, 'storeAddress'])->name('account.addresses.store');
    Route::patch('/account/addresses/{address}', [AccountController::class, 'updateAddress'])->name('account.addresses.update');
    Route::delete('/account/addresses/{address}', [AccountController::class, 'destroyAddress'])->name('account.addresses.destroy');

    // Route keranjang belanja & checkout internal (menggantikan pemesanan via WhatsApp)
    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('/cart', [CartController::class, 'store'])->name('cart.store');
    Route::patch('/cart/{cartItem}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/{cartItem}', [CartController::class, 'destroy'])->name('cart.destroy');

    Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');

    // Menyimpan konfigurasi 3D Customizer ke keranjang untuk semua user (B2C & B2B)
    Route::post('/b2b/customizer', [B2BCustomizerController::class, 'addToCart'])->name('b2b.customizer.store');

    // Grup route khusus modul admin dengan awalan URL '/admin/...' dan awalan nama route 'admin....'
    Route::prefix('admin')->name('admin.')->middleware('admin')->group(function () {

        // Mendaftarkan route CRUD produk (/admin/products) kecuali create, show, dan edit (karena memakai modal di halaman index)
        Route::resource('products', AdminProductController::class)->except(['create', 'show', 'edit']);

        // Mendaftarkan route manajemen inquiry (/admin/inquiries) hanya untuk melihat daftar (index), ubah status (update), dan hapus (destroy)
        Route::resource('inquiries', AdminInquiryController::class)->only(['index', 'update', 'destroy']);

        // Mendaftarkan route CRUD partner korporat (/admin/partners) kecuali create, show, dan edit (memakai modal di halaman index)
        Route::resource('partners', AdminPartnerController::class)->except(['create', 'show', 'edit']);

        // Route CMS untuk mengedit konten teks pada landing page
        Route::get('/landing-content', [LandingContentController::class, 'index'])->name('landing-content.index');
        Route::post('/landing-content', [LandingContentController::class, 'update'])->name('landing-content.update');

        // Route manajemen pesanan & pembaruan status tracking parcel 4 tahap
        Route::get('/orders', [AdminOrderController::class, 'index'])->name('orders.index');
        Route::patch('/orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.status');

        // Logout portal admin
        Route::post('/logout', [AdminAuthController::class, 'destroy'])->name('logout');
    });

});

// Portal Login Khusus Administrator & Autentikasi Google OAuth Customer
Route::middleware('guest')->group(function () {
    Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect'])->name('auth.google.redirect');
    Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');

    Route::get('/admin/login', [AdminAuthController::class, 'create'])->name('admin.login');
    Route::post('/admin/login', [AdminAuthController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('admin.login.store');
});

// Memuat file route tambahan bawaan starter kit untuk pengaturan profil & password akun admin
require __DIR__.'/settings.php';
