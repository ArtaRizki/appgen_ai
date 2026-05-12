import { useState } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Globe, History, ShieldCheck, ShieldAlert, CheckCircle2, AlertCircle, XCircle, Search, Layout } from 'lucide-react';
import clsx from 'clsx';
import ExecutionHistory from '../../components/scraper/ExecutionHistory';

const TOOL_SLUG = 'site-auditor';

interface AuditMetric {
  text?: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

interface AuditResult {
  url: string;
  title: AuditMetric;
  metaDescription: AuditMetric;
  headings: { h1Count: number; h2Count: number; status: 'pass' | 'fail'; message: string };
  images: { total: number; missingAlt: number; status: 'pass' | 'fail' | 'warning'; message: string };
  ssl: AuditMetric;
  score: number;
}

export default function SiteAuditor() {
  const [viewTab, setViewTab] = useState<'tool' | 'history'>('tool');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [url, setUrl] = useState('');

  const queryClient = useQueryClient();

  async function handleAudit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const { data } = await api.post(`/tools/${TOOL_SLUG}/execute`, { url });
      setResult(data.result);
      toast.success('Audit selesai!');
      queryClient.invalidateQueries({ queryKey: ['history', TOOL_SLUG] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal melakukan audit');
    } finally {
      setLoading(false);
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="w-5 h-5 text-brand-green" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-brand-orange" />;
      case 'fail': return <XCircle className="w-5 h-5 text-brand-coral" />;
      default: return null;
    }
  };

  return (
    <div className="p-8 animate-fade-in max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-green/10 border border-brand-green/20 flex items-center justify-center">
          <Globe className="w-5 h-5 text-brand-green" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">SEO & Site Auditor</h1>
          <p className="text-sm text-gray-500">Audit kesehatan teknis dan SEO website Anda secara instan</p>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-border">
        {[
          { id: 'tool', label: 'Audit Tool', icon: <Search className="w-3.5 h-3.5" /> },
          { id: 'history', label: 'History', icon: <History className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setViewTab(tab.id as any)}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
              viewTab === tab.id
                ? 'border-brand-green text-brand-green'
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
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="card p-4">
            <form onSubmit={handleAudit} className="flex gap-3">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Masukkan URL website (misal: aidigicube.com)"
                  className="input pl-9"
                  required
                />
              </div>
              <button disabled={loading} type="submit" className="btn btn-primary bg-brand-green hover:bg-green-600 border-none px-8">
                {loading ? 'Auditing...' : 'Start Audit'}
              </button>
            </form>
          </div>

          {!result && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-600 text-sm">
              <Layout className="w-16 h-16 mb-4 opacity-10" />
              Masukkan URL di atas untuk melihat laporan audit SEO
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 rounded-full border-2 border-brand-green border-t-transparent animate-spin mb-4" />
              <p className="text-sm text-gray-400">Sedang menganalisis struktur website...</p>
            </div>
          )}

          {result && !loading && (
            <div className="grid grid-cols-12 gap-6 animate-fade-in">
              {/* Score Card */}
              <div className="col-span-12 lg:col-span-4">
                <div className="card p-8 flex flex-col items-center justify-center text-center h-full">
                  <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-bg-tertiary" />
                      <circle 
                        cx="80" 
                        cy="80" 
                        r="70" 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray={440}
                        strokeDashoffset={440 - (440 * result.score) / 100}
                        className={clsx("transition-all duration-1000", result.score >= 80 ? "text-brand-green" : (result.score >= 50 ? "text-brand-orange" : "text-brand-coral"))}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-white">{result.score}</span>
                      <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">SEO Score</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">Health Report</h3>
                  <p className="text-sm text-gray-500">{result.url}</p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="col-span-12 lg:col-span-8 grid grid-cols-2 gap-4">
                {[
                  { label: 'Title Tag', metric: result.title, value: result.title.text },
                  { label: 'Meta Description', metric: result.metaDescription, value: result.metaDescription.text },
                  { label: 'Headings (H1)', metric: result.headings, value: `${result.headings.h1Count} H1 tags found` },
                  { label: 'Images (Alt Text)', metric: result.images, value: `${result.images.missingAlt} missing alt tags` },
                ].map((m, i) => (
                  <div key={i} className="card p-5 border-l-4" style={{ borderColor: `var(--brand-${m.metric.status === 'pass' ? 'green' : (m.metric.status === 'warning' ? 'orange' : 'coral')})` }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{m.label}</span>
                      {getStatusIcon(m.metric.status)}
                    </div>
                    <p className="text-sm text-white font-medium mb-1 truncate">{m.value || 'N/A'}</p>
                    <p className="text-[10px] text-gray-500">{m.metric.message}</p>
                  </div>
                ))}

                <div className="col-span-2 card p-5 flex items-center gap-4">
                  <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center", result.ssl.status === 'pass' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
                    {result.ssl.status === 'pass' ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">SSL Connection</h4>
                    <p className="text-xs text-gray-500">{result.ssl.message}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
