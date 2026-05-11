import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import ToolCard from '../components/ToolCard';
import { Loader2, Wrench, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../store/auth';

interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  icon: string;
  isActive: boolean;
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ['tools'],
    queryFn: () => api.get('/tools').then((r) => r.data.tools as Tool[]),
  });

  const activeTools = data?.filter((t) => t.isActive) ?? [];
  const comingSoonTools = data?.filter((t) => !t.isActive) ?? [];

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-brand-blue" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-gray-500">Adigicube Tools Portal — {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Available Tools', value: activeTools.length, color: 'text-brand-blue' },
          { label: 'Coming Soon', value: comingSoonTools.length, color: 'text-brand-amber' },
          { label: 'Team Members', value: 1, color: 'text-brand-green' },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Active Tools */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Available Tools</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-brand-blue animate-spin" />
          </div>
        ) : activeTools.length === 0 ? (
          <div className="card p-8 text-center text-gray-500 text-sm">No tools available</div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {activeTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </div>

      {/* Coming Soon */}
      {comingSoonTools.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm">⏳</span>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Coming Soon</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {comingSoonTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} disabled />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
