import { useState } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Mail, Send, History, Users, MessageSquare, Layout, CheckCircle, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import ExecutionHistory from '../../components/scraper/ExecutionHistory';

const TOOL_SLUG = 'lead-messenger';

interface MessengerResult {
  platform: string;
  totalSent: number;
  totalFailed: number;
  details: { recipient: string; status: 'success' | 'failed'; error?: string }[];
}

export default function LeadMessenger() {
  const [viewTab, setViewTab] = useState<'tool' | 'history'>('tool');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MessengerResult | null>(null);
  
  // Form state
  const [platform, setPlatform] = useState<'email' | 'whatsapp'>('email');
  const [recipientsRaw, setRecipientsRaw] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const queryClient = useQueryClient();

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const recipients = recipientsRaw.split(/[\n,]+/).map(r => r.trim()).filter(r => r.length > 0);
    
    if (recipients.length === 0) {
      return toast.error('Recipient list cannot be empty');
    }

    setLoading(true);
    setResult(null);

    try {
      const { data } = await api.post(`/tools/${TOOL_SLUG}/execute`, {
        platform,
        recipients,
        subject: platform === 'email' ? subject : undefined,
        message,
      });
      setResult(data.result);
      toast.success(`Successfully processed delivery to ${recipients.length} recipients!`);
      queryClient.invalidateQueries({ queryKey: ['history', TOOL_SLUG] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send messages');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 animate-fade-in max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-coral/10 border border-brand-coral/20 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-brand-coral" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Lead Messenger</h1>
          <p className="text-sm text-gray-500">Send marketing campaigns via Email or WhatsApp</p>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-border">
        {[
          { id: 'tool', label: 'Message Tool', icon: <Send className="w-3.5 h-3.5" /> },
          { id: 'history', label: 'History', icon: <History className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setViewTab(tab.id as any)}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
              viewTab === tab.id
                ? 'border-brand-coral text-brand-coral'
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
          {/* Left: Compose */}
          <div className="col-span-12 lg:col-span-7">
            <div className="card p-6 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-brand-coral" />
                <h3 className="text-sm font-semibold text-white">Compose Campaign</h3>
              </div>
              
              <form onSubmit={handleSend} className="space-y-5">
                <div className="flex bg-bg-tertiary rounded-xl p-1 p-1">
                  <button
                    type="button"
                    onClick={() => setPlatform('email')}
                    className={clsx(
                      "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all",
                      platform === 'email' ? "bg-bg-primary text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
                    )}
                  >
                    <Mail className="w-4 h-4" /> Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatform('whatsapp')}
                    className={clsx(
                      "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all",
                      platform === 'whatsapp' ? "bg-bg-primary text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
                    )}
                  >
                    <MessageSquare className="w-4 h-4" /> WhatsApp
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400">Recipients (One per line)</label>
                  <textarea
                    value={recipientsRaw}
                    onChange={(e) => setRecipientsRaw(e.target.value)}
                    placeholder={platform === 'email' ? "email1@example.com\nemail2@example.com" : "6281234567890\n628998877665"}
                    className="input min-h-[100px] text-xs font-mono"
                    required
                  />
                </div>

                {platform === 'email' && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400">Email Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter campaign subject..."
                      className="input"
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400">Message Content</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="input min-h-[150px]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full bg-brand-coral hover:bg-red-600 border-none py-3"
                >
                  {loading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin mx-auto" />
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" /> Send Message Now
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Results / Status */}
          <div className="col-span-12 lg:col-span-5">
            <div className="card p-6 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <Layout className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-medium text-gray-300">Delivery Status</h3>
              </div>

              {!result && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-600 text-sm italic">
                  No messages sent yet
                </div>
              )}

              {loading && (
                <div className="flex-1 flex flex-col items-center justify-center py-20">
                  <div className="w-10 h-10 rounded-full border-2 border-brand-coral border-t-transparent animate-spin mb-4" />
                  <p className="text-sm text-gray-400">Sending messages one by one...</p>
                </div>
              )}

              {result && !loading && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-bg-tertiary rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-green-500">{result.totalSent}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Sent</p>
                    </div>
                    <div className="bg-bg-tertiary rounded-xl p-4 text-center">
                      <p className={clsx("text-2xl font-bold", result.totalFailed > 0 ? "text-brand-coral" : "text-gray-500")}>
                        {result.totalFailed}
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Failed</p>
                    </div>
                  </div>

                  <div className="space-y-2 overflow-auto max-h-[300px] pr-2">
                    {result.details.map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-bg-tertiary/30 border border-border/50">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-white truncate">{d.recipient}</p>
                          {d.error && <p className="text-[10px] text-brand-coral mt-0.5">{d.error}</p>}
                        </div>
                        {d.status === 'success' ? (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-brand-coral flex-shrink-0" />
                        )}
                      </div>
                    ))}
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
