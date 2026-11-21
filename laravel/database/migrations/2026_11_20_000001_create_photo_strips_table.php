<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('photo_strips', function (Blueprint $table) {
            $table->id();
            $table->string('title', 80);
            $table->string('frame_theme', 40)->default('blush-daisy');
            $table->string('layout_type', 30)->default('strip-4');
            $table->string('filter_name', 40)->default('original');
            $table->string('sticker_motif', 40)->default('daisy');
            $table->string('image_path');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('photo_strips');
    }
};
