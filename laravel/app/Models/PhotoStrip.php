<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhotoStrip extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'frame_theme',
        'layout_type',
        'filter_name',
        'sticker_motif',
        'image_path',
    ];
}
