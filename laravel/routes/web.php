<?php

use App\Http\Controllers\PhotoboothController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PhotoboothController::class, 'index'])->name('photobooth.index');
Route::get('/api/strips', [PhotoboothController::class, 'list'])->name('photobooth.list');
Route::post('/api/strips', [PhotoboothController::class, 'store'])->name('photobooth.store');
Route::delete('/api/strips/{photoStrip}', [PhotoboothController::class, 'destroy'])->name('photobooth.destroy');
