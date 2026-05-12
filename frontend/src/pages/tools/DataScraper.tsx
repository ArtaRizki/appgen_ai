import { useState } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import CsvImport from '../../components/scraper/CsvImport';
import ApiImport from '../../components/scraper/ApiImport';
import WebScraper from '../../components/scraper/WebScraper';
import ExecutionHistory from '../../components/scraper/ExecutionHistory';
import { Search, Upload, Globe, Zap, Table, History } from 'lucide-react';
import clsx from 'clsx';

type Tab = 'csv' | 'api' | 'web';
type ViewTab = 'tool' | 'history';

const TOOL_SLUG = 'data-scraper';

const sourceTabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'csv', label: 'CSV Upload', icon: <Upload className="w-4 h-4" /> },
  { id: 'api', label: 'API Import', icon: <Zap className="w-4 h-4" /> },
  { id: 'web', label: 'Web Scraper', icon: <Globe className="w-4 h-4" /> },
];

interface Result {
  sourceType: string;
  headers: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
  rowsImported: number;
  rowsFailed: number;
  previewData: Record<string, unknown>[];
}

export default function DataScraper() {
  const [activeSource, setActiveSource] = useState<Tab>('csv');
  const [viewTab, setViewTab] = useState<ViewTab>('tool');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const queryClient = useQueryClient();

  async function handleCsvSubmit({ file, mappingConfig }: { file: File; mappingConfig: Record<string, string> }) {
    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sourceType', 'csv');
    formData.append('mappingConfig', JSON.stringify(mappingConfig));

    try {
      const { data } = await api.post(`/tools/${TOOL_SLUG}/execute`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data.result);
      toast.success(`Import complete! ${data.result.rowsImported} rows imported.`);
      queryClient.invalidateQueries({ queryKey: ['history', TOOL_SLUG] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Import failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleApiSubmit(data: { sourceUrl: string; headers?: Record<string, string>; dataPath?: string }) {
    setLoading(true);
    setResult(null);
    try {
      const { data: res } = await api.post(`/tools/${TOOL_SLUG}/execute`, {
        sourceType: 'api',
        ...data,
      });
      setResult(res.result);
      toast.success(`API import complete! ${res.result.rowsImported} rows fetched.`);
      queryClient.invalidateQueries({ queryKey: ['history', TOOL_SLUG] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'API import failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleWebSubmit(data: { sourceUrl: string; selectors: { container: string; fields: Record<string, string> } }) {
    setLoading(true);
    setResult(null);
    try {
      const { data: res } = await api.post(`/tools/${TOOL_SLUG}/execute`, {
        sourceType: 'web',
        sourceUrl: data.sourceUrl,
        selectors: JSON.stringify(data.selectors),
      });
      setResult(res.result);
      toast.success(`Scraping complete! ${res.result.rowsImported} rows extracted.`);
      queryClient.invalidateQueries({ queryKey: ['history', TOOL_SLUG] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Scraping failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center">
          <Search className="w-5 h-5 text-brand-blue" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Data Scraper</h1>
          <p className="text-sm text-gray-500">Import data from CSV, API, or web scraping</p>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-border">
        {[
          { id: 'tool' as ViewTab, label: 'Import Tool', icon: <Upload className="w-3.5 h-3.5" /> },
          { id: 'history' as ViewTab, label: 'History', icon: <History className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setViewTab(tab.id)}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
              viewTab === tab.id
                ? 'border-brand-blue text-brand-blue'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            )}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {viewTab === 'history' ? (
        <ExecutionHistory toolSlug={TOOL_SLUG} />
      ) : (
        <div className="grid grid-cols-5 gap-6">
          {/* Left: Tool config */}
          <div className="col-span-3">
            <div className="card overflow-hidden">
              {/* Source tabs */}
              <div className="flex border-b border-border">
                {sourceTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSource(tab.id)}
                    className={clsx(
                      'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors flex-1 justify-center',
                      activeSource === tab.id
                        ? 'bg-bg-tertiary text-white border-b-2 border-brand-blue'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-bg-tertiary/50'
                    )}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {activeSource === 'csv' && <CsvImport onSubmit={handleCsvSubmit} loading={loading} />}
                {activeSource === 'api' && <ApiImport onSubmit={handleApiSubmit} loading={loading} />}
                {activeSource === 'web' && <WebScraper onSubmit={handleWebSubmit} loading={loading} />}
              </div>
            </div>
          </div>

          {/* Right: Result preview */}
          <div className="col-span-2">
            <div className="card p-5 h-full">
              <div className="flex items-center gap-2 mb-4">
                <Table className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-medium text-gray-300">Result Preview</h3>
              </div>

              {!result && !loading && (
                <div className="text-center py-8 text-gray-600 text-sm">
                  Run an import to see results here
                </div>
              )}

              {loading && (
                <div className="text-center py-8">
                  <div className="inline-flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full border-2 border-brand-blue border-t-transparent animate-spin" />
                    <p className="text-sm text-gray-500">Processing...</p>
                  </div>
                </div>
              )}

              {result && !loading && (
                <div className="space-y-3 animate-fade-in">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-bg-tertiary rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-white">{result.totalRows}</p>
                      <p className="text-[10px] text-gray-500">Total</p>
                    </div>
                    <div className="bg-green-500/5 border border-green-500/15 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-brand-green">{result.rowsImported}</p>
                      <p className="text-[10px] text-gray-500">Imported</p>
                    </div>
                    <div className={clsx('rounded-lg p-2 text-center', result.rowsFailed > 0 ? 'bg-red-500/5 border border-red-500/15' : 'bg-bg-tertiary')}>
                      <p className={clsx('text-lg font-bold', result.rowsFailed > 0 ? 'text-brand-coral' : 'text-gray-500')}>{result.rowsFailed}</p>
                      <p className="text-[10px] text-gray-500">Failed</p>
                    </div>
                  </div>

                  {/* Preview table */}
                  {result.previewData.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1.5">First {result.previewData.length} rows:</p>
                      <div className="overflow-auto rounded-lg border border-border max-h-64">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-bg-tertiary sticky top-0">
                              {result.headers.slice(0, 4).map((h) => (
                                <th key={h} className="px-2 py-1.5 text-left text-gray-500 font-medium whitespace-nowrap">{h}</th>
                              ))}
                              {result.headers.length > 4 && <th className="px-2 py-1.5 text-gray-600">+{result.headers.length - 4}</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {result.previewData.map((row, i) => (
                              <tr key={i} className="border-t border-border">
                                {result.headers.slice(0, 4).map((h) => (
                                  <td key={h} className="px-2 py-1 text-gray-400 whitespace-nowrap max-w-24 truncate">
                                    {String(row[h] ?? '')}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
