<?php

namespace App\Http\Controllers;

use App\Models\PhotoStrip;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\View\View;

class PhotoboothController extends Controller
{
    public function index(): View
    {
        $strips = PhotoStrip::latest()->take(18)->get();

        return view('photobooth', [
            'strips' => $strips,
        ]);
    }

    public function list(): JsonResponse
    {
        $strips = PhotoStrip::latest()->take(24)->get()->map(function (PhotoStrip $strip) {
            return [
                'id' => $strip->id,
                'title' => $strip->title,
                'frameTheme' => $strip->frame_theme,
                'layout' => $strip->layout_type,
                'filter' => $strip->filter_name,
                'sticker' => $strip->sticker_motif,
                'imageUrl' => Storage::url($strip->image_path),
                'createdAt' => $strip->created_at->toIso8601String(),
            ];
        });

        return response()->json(['strips' => $strips]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:80'],
            'frameTheme' => ['required', 'string', 'in:blush-daisy,lavender-cloud,buttercream,berry-sorbet'],
            'layout' => ['required', 'string', 'in:house-studio,kid-again,birthday-cal,crossword-cute,strip-4,grid-2x2,polaroid-1'],
            'filter' => ['required', 'string', 'max:40'],
            'sticker' => ['required', 'string', 'max:40'],
            'imageData' => ['required', 'string', 'starts_with:data:image/png;base64,'],
        ]);

        $rawBase64 = substr($validated['imageData'], strpos($validated['imageData'], ',') + 1);
        $binary = base64_decode($rawBase64, true);

        if ($binary === false || strlen($binary) > 10 * 1024 * 1024) {
            return response()->json(['message' => 'Format gambar tidak valid atau melebihi 10MB.'], 422);
        }

        $filename = 'photobooth/' . now()->format('Ymd_His') . '_' . Str::random(8) . '.png';
        Storage::disk('public')->put($filename, $binary);

        $strip = PhotoStrip::create([
            'title' => $validated['title'],
            'frame_theme' => $validated['frameTheme'],
            'layout_type' => $validated['layout'],
            'filter_name' => $validated['filter'],
            'sticker_motif' => $validated['sticker'],
            'image_path' => $filename,
        ]);

        return response()->json([
            'strip' => [
                'id' => $strip->id,
                'title' => $strip->title,
                'frameTheme' => $strip->frame_theme,
                'layout' => $strip->layout_type,
                'filter' => $strip->filter_name,
                'sticker' => $strip->sticker_motif,
                'imageUrl' => Storage::url($strip->image_path),
                'createdAt' => $strip->created_at->toIso8601String(),
            ],
        ], 201);
    }

    public function destroy(PhotoStrip $photoStrip): JsonResponse
    {
        if (Storage::disk('public')->exists($photoStrip->image_path)) {
            Storage::disk('public')->delete($photoStrip->image_path);
        }

        $photoStrip->delete();

        return response()->json(['deleted' => true]);
    }
}
