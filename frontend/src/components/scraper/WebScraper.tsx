import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface WebScraperProps {
  onSubmit: (data: { sourceUrl: string; selectors: { container: string; fields: Record<string, string> } }) => void;
  loading?: boolean;
}

export default function WebScraper({ onSubmit, loading }: WebScraperProps) {
  const [url, setUrl] = useState('');
  const [container, setContainer] = useState('');
  const [fields, setFields] = useState<{ name: string; selector: string }[]>([
    { name: 'title', selector: 'h2' },
    { name: 'link', selector: 'a[href]' },
  ]);

  function addField() {
    setFields((f) => [...f, { name: '', selector: '' }]);
  }

  function removeField(i: number) {
    setFields((f) => f.filter((_, idx) => idx !== i));
  }

  function updateField(i: number, key: 'name' | 'selector', val: string) {
    setFields((f) => f.map((item, idx) => idx === i ? { ...item, [key]: val } : item));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url || !container) return;
    const fieldsObj = fields
      .filter((f) => f.name && f.selector)
      .reduce<Record<string, string>>((acc, f) => ({ ...acc, [f.name]: f.selector }), {});

    onSubmit({ sourceUrl: url, selectors: { container, fields: fieldsObj } });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Target URL</label>
        <input
          id="web-url"
          className="input"
          type="url"
          placeholder="https://example.com/data"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="label">Container Selector</label>
        <input
          className="input font-mono"
          placeholder="table tr, .product-card, li.item"
          value={container}
          onChange={(e) => setContainer(e.target.value)}
          required
        />
        <p className="text-xs text-gray-600 mt-1">CSS selector untuk element yang berulang (setiap row/item)</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Fields to Extract</label>
          <button type="button" onClick={addField} className="btn-secondary py-1 px-2 text-xs">
            <Plus className="w-3 h-3" /> Add Field
          </button>
        </div>
        <div className="space-y-2">
          {fields.map((f, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                className="input w-32"
                placeholder="Field name"
                value={f.name}
                onChange={(e) => updateField(i, 'name', e.target.value)}
              />
              <input
                className="input flex-1 font-mono"
                placeholder="CSS selector"
                value={f.selector}
                onChange={(e) => updateField(i, 'selector', e.target.value)}
              />
              <button type="button" onClick={() => removeField(i)} className="text-gray-600 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-lg text-xs text-gray-400">
        ⚠️ <strong className="text-gray-300">Note:</strong> Web scraping hanya bekerja pada halaman yang bisa diakses secara publik (bukan yang butuh login). Gunakan selector CSS yang spesifik.
      </div>

      <button
        id="web-submit"
        type="submit"
        disabled={loading || !url || !container}
        className="btn-primary w-full justify-center"
      >
        {loading ? 'Scraping...' : 'Start Scraping'}
      </button>
    </form>
  );
}
