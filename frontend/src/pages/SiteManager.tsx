import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Globe, Plus, Trash2, ExternalLink, Shield, Key } from 'lucide-react';
import clsx from 'clsx';

interface ManagedSite {
  id: string;
  name: string;
  url: string;
  type: string;
  hasCredentials: boolean;
}

export default function SiteManager() {
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();

  // Form state
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [appPassword, setAppPassword] = useState('');

  const { data: sites, isLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      const { data } = await api.get('/sites');
      return data as ManagedSite[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (newSite: any) => {
      await api.post('/sites', newSite);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setIsAdding(false);
      setName('');
      setUrl('');
      setUsername('');
      setAppPassword('');
      toast.success('Website added successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to add website');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/sites/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      toast.success('Website deleted');
    },
  });

  return (
    <div className="p-8 animate-fade-in max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-brand-blue" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Project & Site Manager</h1>
            <p className="text-sm text-gray-500">Manage your 6+ websites for content automation</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Site
        </button>
      </div>

      {isAdding && (
        <div className="card p-6 mb-8 border-brand-blue/30 bg-brand-blue/5 animate-slide-up">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add New Website
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addMutation.mutate({ name, url, username, appPassword });
            }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400">Site Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Example: Aidigicell Blog" className="input" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400">Site URL</label>
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" className="input" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400">WP Username</label>
              <div className="relative">
                <Shield className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" className="input pl-9" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400">WP Application Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={appPassword}
                  onChange={(e) => setAppPassword(e.target.value)}
                  placeholder="xxxx xxxx xxxx xxxx"
                  className="input pl-9"
                  required
                />
              </div>
            </div>
            <div className="col-span-2 flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="btn btn-secondary text-xs px-4">Cancel</button>
              <button type="submit" disabled={addMutation.isPending} className="btn btn-primary text-xs px-6">
                {addMutation.isPending ? 'Saving...' : 'Save Website'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-2 border-brand-blue border-t-transparent animate-spin mb-4" />
          <p className="text-sm text-gray-500">Loading website list...</p>
        </div>
      ) : sites?.length === 0 ? (
        <div className="card p-20 text-center flex flex-col items-center gap-4">
          <Globe className="w-16 h-16 text-gray-700 opacity-20" />
          <p className="text-gray-500 italic text-sm">No websites registered yet.</p>
          <button onClick={() => setIsAdding(true)} className="text-brand-blue text-sm font-medium hover:underline">
            Add your first website
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites?.map((site) => (
            <div key={site.id} className="card p-5 group hover:border-brand-blue/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-bg-tertiary flex items-center justify-center">
                  <Globe className="w-5 h-5 text-gray-400 group-hover:text-brand-blue transition-colors" />
                </div>
                <div className="flex gap-2">
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg hover:bg-bg-tertiary text-gray-500 hover:text-white transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => {
                      if (confirm('Delete this website?')) deleteMutation.mutate(site.id);
                    }}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-white mb-1">{site.name}</h3>
              <p className="text-xs text-gray-500 truncate mb-4">{site.url}</p>
              <div className="flex items-center gap-2 pt-4 border-t border-border">
                <span className="px-2 py-0.5 rounded bg-brand-blue/10 text-[10px] font-bold text-brand-blue uppercase">
                  {site.type}
                </span>
                {site.hasCredentials && (
                  <span className="flex items-center gap-1 text-[10px] text-green-500">
                    <Shield className="w-3 h-3" /> API Ready
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
