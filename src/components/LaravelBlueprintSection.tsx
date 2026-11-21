import React, { useEffect, useState } from 'react';
import { Check, Code2, Copy } from 'lucide-react';
import { LaravelFile } from '../types/photobooth';

export const LaravelBlueprintSection: React.FC = () => {
  const [files, setFiles] = useState<LaravelFile[]>([]);
  const [activeKey, setActiveKey] = useState<string>('controller');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    fetch('/api/laravel-files')
      .then((res) => res.json())
      .then((data) => {
        if (active && Array.isArray(data.files)) {
          setFiles(data.files);
          if (data.files.length > 0) {
            setActiveKey(data.files[0].key);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const currentFile = files.find((f) => f.key === activeKey) ?? files[0];

  const handleCopy = async () => {
    if (!currentFile) return;
    try {
      await navigator.clipboard.writeText(currentFile.content);
      setCopiedKey(currentFile.key);
      window.setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      // Clipboard blocked in restricted context
    }
  };

  return (
    <section id="laravel" className="py-14 px-6 bg-[#FCEEF4] border-t border-[#F2DCE6]">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9B5A76] mb-1.5">
            Struktur MVC Laravel 11
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2F2128] mb-2">
            Kode Sumber Siap Pakai Untuk Laravel
          </h2>
          <p className="text-sm text-[#5E4652] leading-relaxed">
            Salin berkas rute, model, migrasi, controller, dan Blade template dari direktori <code className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-[#EED3DF]">laravel/</code> di bawah ini untuk server PHP Anda.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#EED3DF] overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#FFF8FA] border-b border-[#F2DCE6]">
            <div className="flex flex-wrap items-center gap-1.5">
              {files.map((file) => (
                <button
                  key={file.key}
                  type="button"
                  onClick={() => setActiveKey(file.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
                    activeKey === file.key
                      ? 'bg-[#2F2128] text-white'
                      : 'text-[#5E4652] hover:bg-[#FCEAF1]'
                  }`}
                >
                  {file.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!currentFile}
              className="px-3.5 py-1.5 rounded-lg bg-[#FCEAF1] hover:bg-[#F9D8E6] text-[#2F2128] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              {copiedKey === currentFile?.key ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Tersalin
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Salin Kode
                </>
              )}
            </button>
          </div>

          <div className="p-5 bg-[#2A1D24] text-[#FCEEF4] overflow-x-auto max-h-[380px]">
            {loading ? (
              <div className="flex items-center gap-2 text-xs font-mono text-[#D9BAC8]">
                <Code2 className="w-4 h-4" />
                Memuat berkas Laravel...
              </div>
            ) : currentFile ? (
              <pre className="font-mono text-xs leading-relaxed whitespace-pre">
                <code>{currentFile.content}</code>
              </pre>
            ) : (
              <p className="text-xs text-[#D9BAC8]">Berkas Laravel tidak ditemukan.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
