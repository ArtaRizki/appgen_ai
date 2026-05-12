import { useState } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Search, MapPin, Store, Send, History, Table, ExternalLink, Zap } from 'lucide-react';
import clsx from 'clsx';
import ExecutionHistory from '../../components/scraper/ExecutionHistory';

const TOOL_SLUG = 'vending-finder';

interface Lead {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  category: string;
  source: string;
  rating?: number;
}

interface FinderResult {
  leads: Lead[];
  totalFound: number;
  dataBridgeStatus?: string;
}

export default function VendingFinder() {
  const [viewTab, setViewTab] = useState<'tool' | 'history'>('tool');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FinderResult | null>(null);
  
  // Form state
  const [location, setLocation] = useState('Jakarta');
  const [category, setCategory] = useState('Office');
  const [pushToDataBridge, setPushToDataBridge] = useState(true);

  const queryClient = useQueryClient();

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const { data } = await api.post(`/tools/${TOOL_SLUG}/execute`, {
        location,
        category,
        pushToDataBridge,
      });
      setResult(data.result);
      toast.success(`Successfully found ${data.result.totalFound} potential clients!`);
      queryClient.invalidateQueries({ queryKey: ['history', TOOL_SLUG] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 animate-fade-in max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center">
          <Store className="w-5 h-5 text-brand-orange" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Vending Client Finder</h1>
          <p className="text-sm text-gray-500">Find strategic clients for vending machine placement</p>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-border">
        {[
          { id: 'tool', label: 'Finder Tool', icon: <Search className="w-3.5 h-3.5" /> },
          { id: 'history', label: 'History', icon: <History className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setViewTab(tab.id as any)}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
              viewTab === tab.id
                ? 'border-brand-orange text-brand-orange'
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
        <div className="grid grid-cols-12 gap-6">
          {/* Left: Tool config */}
          <div className="col-span-12 lg:col-span-4">
            <div className="card p-5 space-y-5">
              <h3 className="text-sm font-semibold text-white mb-2">New Search</h3>
              
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Example: South Jakarta, Bandung..."
                      className="input pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">Business Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input"
                  >
                    <option value="Office">Office / Coworking</option>
                    <option value="Gym">Gym / Fitness Center</option>
                    <option value="Hospital">Hospital / Clinic</option>
                    <option value="Apartment">Apartment</option>
                    <option value="School">School / University</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-border/50">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={pushToDataBridge}
                      onChange={(e) => setPushToDataBridge(e.target.checked)}
                      className="w-4 h-4 rounded border-border bg-bg-secondary text-brand-orange focus:ring-brand-orange"
                    />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                      Auto-push to DataBridge
                    </span>
                  </label>
                  <p className="text-[10px] text-gray-600 mt-1 ml-6">
                    Data will be instantly available for the marketing team at aidigicell.com
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full bg-brand-orange hover:bg-orange-600 border-none"
                >
                  {loading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin mx-auto" />
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4" /> Find Clients
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Result table */}
          <div className="col-span-12 lg:col-span-8">
            <div className="card p-5 min-h-[400px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-medium text-gray-300">Search Results</h3>
                </div>
                {result && (
                  <span className="px-2 py-0.5 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-[10px] font-medium text-brand-orange">
                    {result.totalFound} Leads Found
                  </span>
                )}
              </div>

              {!result && !loading && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-600 text-sm italic">
                  <Store className="w-12 h-12 mb-3 opacity-20" />
                  Enter location and category to start finding clients
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-10 h-10 rounded-full border-2 border-brand-orange border-t-transparent animate-spin mb-4" />
                  <p className="text-sm text-gray-400">Scraping potential client data...</p>
                </div>
              )}

              {result && !loading && (
                <div className="space-y-4 animate-fade-in">
                  {result.dataBridgeStatus && (
                    <div className={clsx(
                      "p-3 rounded-lg flex items-center justify-between text-xs",
                      result.dataBridgeStatus.includes('Success') 
                        ? "bg-green-500/10 border border-green-500/20 text-green-400"
                        : "bg-brand-orange/10 border border-brand-orange/20 text-brand-orange"
                    )}>
                      <span className="flex items-center gap-2">
                        <Send className="w-3.5 h-3.5" /> DataBridge Sync: <strong>{result.dataBridgeStatus}</strong>
                      </span>
                    </div>
                  )}

                  <div className="overflow-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-bg-tertiary text-gray-400 text-xs font-medium">
                          <th className="px-4 py-3 text-left">Business Name</th>
                          <th className="px-4 py-3 text-left">Address</th>
                          <th className="px-4 py-3 text-left">Contact</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {result.leads.map((lead, i) => (
                          <tr key={i} className="hover:bg-bg-tertiary/50 transition-colors">
                            <td className="px-4 py-4">
                              <div className="font-medium text-white">{lead.name}</div>
                              <div className="text-[10px] text-gray-500 uppercase tracking-wider">{lead.category}</div>
                            </td>
                            <td className="px-4 py-4 text-xs text-gray-400 max-w-[200px] truncate">
                              {lead.address}
                            </td>
                            <td className="px-4 py-4 text-xs text-gray-400">
                              {lead.phone || '-'}
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {lead.website && (
                                  <a 
                                    href={lead.website} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="p-1.5 rounded-lg bg-bg-tertiary border border-border text-gray-400 hover:text-white transition-colors"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
