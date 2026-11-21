<!doctype html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>DaisyBooth — Aesthetic Pastel Photobooth</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="bg-[#FFF8FA] text-[#35242D] font-sans antialiased">
    {{-- Top Pastel Announcement Band --}}
    <div class="bg-[#F9C5DA] text-[#35242D] text-center text-xs font-medium py-1.5 tracking-wide">
        Studio Photobooth Pastel · Bingkai Scalloped & Ekspor Strip HD
    </div>

    {{-- 3-Zone Header --}}
    <header class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-8 border-b border-[#F4DCE6]">
        <a href="{{ route('photobooth.index') }}" class="font-serif text-2xl font-bold tracking-tight whitespace-nowrap shrink-0">
            DaisyBooth
        </a>
        <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-[#5A424E]">
            <a href="#studio" class="hover:text-[#35242D] whitespace-nowrap shrink-0">Studio</a>
            <a href="#koleksi" class="hover:text-[#35242D] whitespace-nowrap shrink-0">Koleksi Bingkai</a>
            <a href="#galeri" class="hover:text-[#35242D] whitespace-nowrap shrink-0">Galeri</a>
        </nav>
        <a href="#studio" class="px-5 py-2 rounded-xl bg-[#F49DBB] text-[#2E1F27] text-sm font-semibold hover:bg-[#EE88AC] transition whitespace-nowrap shrink-0">
            Mulai Foto
        </a>
    </header>

    {{-- Hero with Tilted Polaroids --}}
    <section class="relative bg-[#FFF4F8] py-16 px-6 overflow-hidden">
        <div class="max-w-5xl mx-auto text-center">
            <p class="text-xs uppercase tracking-[0.2em] text-[#7A5B6B] mb-3">Studio Photobooth Pastel</p>
            <h1 class="font-serif text-4xl md:text-5xl font-bold text-[#35242D] mb-4">
                Abadikan Momen Manis Dalam Sekejap
            </h1>
            <p class="text-[#5A424E] max-w-xl mx-auto mb-8">
                Pilih bingkai pastel bergelombang, nyalakan kamera langsung, dan simpan strip foto Polaroid ke galeri Laravel Anda.
            </p>
            <a href="#studio" class="inline-block px-7 py-3 rounded-xl bg-[#F49DBB] text-[#2E1F27] font-semibold hover:bg-[#EE88AC] transition">
                Buka Kamera Studio
            </a>
        </div>
    </section>

    {{-- Gallery Grid Rendered via Blade --}}
    <section id="galeri" class="max-w-6xl mx-auto px-6 py-14">
        <h2 class="font-serif text-3xl font-bold text-center mb-8">Galeri Strip Tersimpan</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @forelse ($strips as $strip)
                <article class="bg-white p-4 rounded-2xl border border-[#F2DCE5] shadow-sm">
                    <img src="{{ Storage::url($strip->image_path) }}" alt="{{ $strip->title }}" class="w-full rounded-xl mb-3 object-cover">
                    <h3 class="font-serif font-semibold text-base">{{ $strip->title }}</h3>
                    <p class="text-xs text-[#7A5B6B] mt-1">
                        {{ $strip->frame_theme }} · {{ $strip->layout_type }} · {{ $strip->created_at->format('d M Y') }}
                    </p>
                </article>
            @empty
                <p class="col-span-full text-center text-sm text-[#7A5B6B]">
                    Belum ada strip tersimpan. Ambil foto pertama Anda di studio!
                </p>
            @endforelse
        </div>
    </section>

    <script>
        // Kirim hasil canvas.toDataURL('image/png') ke PhotoboothController@store
        async function saveStripToLaravel(payload) {
            const response = await fetch("{{ route('photobooth.store') }}", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            return response.json();
        }
    </script>
</body>
</html>
