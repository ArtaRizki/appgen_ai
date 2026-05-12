import { useState } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Sparkles, History, Copy, Zap, PenTool, Type, FileText, Globe, Send, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import ExecutionHistory from '../../components/scraper/ExecutionHistory';

const TOOL_SLUG = 'ai-content';

interface AIResult {
  content: string;
  usage: { totalTokens: number };
}

export default function AIContent() {
  const [viewTab, setViewTab] = useState<'tool' | 'history'>('tool');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  
  // Form state
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<'article' | 'social' | 'product'>('article');
  const [tone, setTone] = useState<'professional' | 'casual' | 'creative' | 'persuasive'>('professional');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  
  // Publishing state
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [postStatus, setPostStatus] = useState<'draft' | 'publish'>('draft');

  const { data: sites } = useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      const { data } = await api.get('/sites');
      return data as { id: string, name: string }[];
    },
  });

  const queryClient = useQueryClient();

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const { data } = await api.post(`/tools/${TOOL_SLUG}/execute`, {
        prompt,
        type,
        tone,
        length,
      });
      setResult(data.result);
      toast.success('Content generated successfully!');
      queryClient.invalidateQueries({ queryKey: ['history', TOOL_SLUG] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.content);
    toast.success('Copied to clipboard!');
  };

  async function handlePublish() {
    if (!selectedSiteId || !result) return;
    setIsPublishing(true);

    try {
      // Extract title from first line or use prompt
      const lines = result.content.split('\n').filter(l => l.trim().length > 0);
      const title = lines[0].replace(/^#+\s*/, '') || prompt.substring(0, 50);
      const content = result.content;

      await api.post(`/sites/${selectedSiteId}/publish`, {
        title,
        content,
        status: postStatus,
      });

      toast.success('Published successfully!');
      setShowPublishModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to publish');
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <div className="p-8 animate-fade-in max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-brand-blue" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">AI Content Generator</h1>
          <p className="text-sm text-gray-500">Create high-quality marketing content in seconds</p>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-border">
        {[
          { id: 'tool', label: 'Generator Tool', icon: <PenTool className="w-3.5 h-3.5" /> },
          { id: 'history', label: 'History', icon: <History className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setViewTab(tab.id as any)}
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
        <div className="grid grid-cols-12 gap-6">
          {/* Left: Tool config */}
          <div className="col-span-12 lg:col-span-4">
            <div className="card p-5 space-y-5">
              <h3 className="text-sm font-semibold text-white mb-2">Content Configuration</h3>
              
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">What would you like to create?</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Example: Blog article about the benefits of vending machines in modern offices..."
                    className="input min-h-[100px] py-3"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400">Format</label>
                    <select value={type} onChange={(e) => setType(e.target.value as any)} className="input text-xs">
                      <option value="article">Blog Article</option>
                      <option value="social">Social Media</option>
                      <option value="product">Product Desc</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400">Tone</label>
                    <select value={tone} onChange={(e) => setTone(e.target.value as any)} className="input text-xs">
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                      <option value="creative">Creative</option>
                      <option value="persuasive">Persuasive</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">Content Length</label>
                  <div className="flex bg-bg-tertiary rounded-lg p-1">
                    {['short', 'medium', 'long'].map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLength(l as any)}
                        className={clsx(
                          "flex-1 py-1.5 text-[10px] font-medium rounded-md capitalize transition-all",
                          length === l ? "bg-brand-blue text-white shadow-sm" : "text-gray-500 hover:text-gray-300"
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full mt-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin mx-auto" />
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4" /> Generate Content
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Result */}
          <div className="col-span-12 lg:col-span-8">
            <div className="card p-5 min-h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-medium text-gray-300">AI Result</h3>
                </div>
                {result && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowPublishModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-blue/10 border border-brand-blue/20 text-xs text-brand-blue hover:bg-brand-blue/20 transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" /> Publish to Site
                    </button>
                    <button 
                      onClick={copyToClipboard}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-tertiary border border-border text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy Content
                    </button>
                  </div>
                )}
              </div>

              {!result && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-600 text-sm italic py-20">
                  <Type className="w-12 h-12 mb-3 opacity-20" />
                  Configure the settings on the left to start generating content
                </div>
              )}

              {loading && (
                <div className="flex-1 flex flex-col items-center justify-center py-20">
                  <div className="w-12 h-12 rounded-full border-2 border-brand-blue border-t-transparent animate-spin mb-4" />
                  <p className="text-sm text-gray-400">AI is crafting words for you...</p>
                </div>
              )}

              {result && !loading && (
                <div className="animate-fade-in flex-1">
                  <div className="bg-bg-tertiary/50 border border-border rounded-xl p-6 text-gray-300 leading-relaxed whitespace-pre-wrap font-serif text-lg">
                    {result.content}
                  </div>
                  <div className="mt-4 flex items-center justify-end gap-4 text-[10px] text-gray-600 uppercase tracking-widest">
                    <span>Model: GPT-4o-mini</span>
                    <span>Tokens: {result.usage.totalTokens}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <PublishModal 
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        sites={sites}
        selectedSiteId={selectedSiteId}
        setSelectedSiteId={setSelectedSiteId}
        status={postStatus}
        setStatus={setPostStatus}
        onPublish={handlePublish}
        loading={isPublishing}
      />
    </div>
  );
}

function PublishModal({ 
  isOpen, 
  onClose, 
  sites, 
  selectedSiteId, 
  setSelectedSiteId, 
  status, 
  setStatus, 
  onPublish,
  loading 
}: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-md p-6 border-brand-blue/30 shadow-2xl animate-scale-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-brand-blue" /> Publish to Website
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400">Select Target Website</label>
            <select 
              value={selectedSiteId} 
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="input text-sm"
            >
              <option value="">-- Select Site --</option>
              {sites?.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400">Post Status</label>
            <div className="flex bg-bg-tertiary rounded-lg p-1">
              {['draft', 'publish'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={clsx(
                    "flex-1 py-2 text-xs font-medium rounded-md capitalize transition-all",
                    status === s ? "bg-brand-blue text-white shadow-sm" : "text-gray-500 hover:text-gray-300"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button 
              onClick={onPublish} 
              disabled={loading || !selectedSiteId}
              className="btn btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? 'Publishing...' : <><Send className="w-4 h-4" /> Publish Now</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
