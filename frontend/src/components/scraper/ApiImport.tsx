import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface ApiImportProps {
  onSubmit: (data: { sourceUrl: string; headers?: Record<string, string>; dataPath?: string }) => void;
  loading?: boolean;
}

export default function ApiImport({ onSubmit, loading }: ApiImportProps) {
  const [url, setUrl] = useState('');
  const [dataPath, setDataPath] = useState('');
  const [customHeaders, setCustomHeaders] = useState<{ key: string; value: string }[]>([]);

  function addHeader() {
    setCustomHeaders((h) => [...h, { key: '', value: '' }]);
  }

  function removeHeader(i: number) {
    setCustomHeaders((h) => h.filter((_, idx) => idx !== i));
  }

  function updateHeader(i: number, field: 'key' | 'value', val: string) {
    setCustomHeaders((h) => h.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url) return;
    const headersObj = customHeaders
      .filter((h) => h.key && h.value)
      .reduce<Record<string, string>>((acc, h) => ({ ...acc, [h.key]: h.value }), {});

    onSubmit({
      sourceUrl: url,
      headers: Object.keys(headersObj).length > 0 ? headersObj : undefined,
      dataPath: dataPath || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">API URL</label>
        <input
          id="api-url"
          className="input"
          type="url"
          placeholder="https://api.example.com/data"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="label">Data Path <span className="text-gray-600 normal-case font-normal">(optional — e.g. data.results)</span></label>
        <input
          className="input font-mono"
          placeholder="data.results"
          value={dataPath}
          onChange={(e) => setDataPath(e.target.value)}
        />
        <p className="text-xs text-gray-600 mt-1">Jika data ada di dalam nested object, masukkan path-nya</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Request Headers <span className="text-gray-600 normal-case font-normal">(optional)</span></label>
          <button type="button" onClick={addHeader} className="btn-secondary py-1 px-2 text-xs">
            <Plus className="w-3 h-3" /> Add Header
          </button>
        </div>
        {customHeaders.length > 0 && (
          <div className="space-y-2">
            {customHeaders.map((h, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  className="input flex-1"
                  placeholder="Authorization"
                  value={h.key}
                  onChange={(e) => updateHeader(i, 'key', e.target.value)}
                />
                <input
                  className="input flex-1"
                  placeholder="Bearer token..."
                  value={h.value}
                  onChange={(e) => updateHeader(i, 'value', e.target.value)}
                />
                <button type="button" onClick={() => removeHeader(i)} className="text-gray-600 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 bg-brand-blue/5 border border-brand-blue/15 rounded-lg text-xs text-gray-400">
        💡 <strong className="text-gray-300">Tip:</strong> API harus return JSON array atau object dengan nested array. CORS harus enabled di server target.
      </div>

      <button
        id="api-submit"
        type="submit"
        disabled={loading || !url}
        className="btn-primary w-full justify-center"
      >
        {loading ? 'Fetching...' : 'Fetch & Import'}
      </button>
    </form>
  );
}
