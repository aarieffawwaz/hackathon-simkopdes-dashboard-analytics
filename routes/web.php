<?php

use App\Http\Controllers\DashboardAnalyticsController;
use App\Http\Controllers\KoperasiSessionController;
use App\Http\Middleware\EnsureKoperasiSelected;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// 1. Rute Publik (Akses Login)
// Pastikan rute ini di luar middleware EnsureKoperasiSelected
Route::get('/login', [KoperasiSessionController::class, 'create'])->name('login');
Route::post('/login', [KoperasiSessionController::class, 'store'])->name('login.post');
Route::post('/logout', [KoperasiSessionController::class, 'destroy'])->name('logout');

// 2. Rute Terlindungi (Memerlukan Koperasi Terpilih)
Route::middleware([EnsureKoperasiSelected::class])->group(function () {
    
    // Redirect root ke dashboard
    Route::get('/', function () {
        return redirect()->route('dashboard');
    });

    // Halaman Utama Dashboard
    Route::get('/dashboard', [DashboardAnalyticsController::class, 'index'])->name('dashboard');

    // Fitur Ganti Koperasi (Menghapus sesi, kembali ke login)
    Route::get('/ganti-koperasi', function () {
        session()->forget(['koperasi_ref', 'koperasi_nama']);
        return redirect()->route('login');
    })->name('koperasi.ganti');

});