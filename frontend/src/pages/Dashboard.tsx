import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import ToolCard from '../components/ToolCard';
import { Loader2, Wrench, TrendingUp, Globe, PlusCircle, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { Link } from 'react-router-dom';

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

  const { data: toolsData, isLoading: toolsLoading } = useQuery({
    queryKey: ['tools'],
    queryFn: () => api.get('/tools').then((r) => r.data.tools as Tool[]),
  });

  const { data: sitesData } = useQuery({
    queryKey: ['sites'],
    queryFn: () => api.get('/sites').then((r) => r.data),
  });

  const activeTools = toolsData?.filter((t) => t.isActive) ?? [];
  const comingSoonTools = toolsData?.filter((t) => !t.isActive) ?? [];

  return (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header Section with Glassmorphism feel */}
      <div className="relative mb-10 p-8 rounded-3xl overflow-hidden bg-gradient-to-br from-brand-blue/20 via-bg-secondary to-bg-secondary border border-white/5">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center shadow-lg shadow-brand-blue/10">
              <TrendingUp className="w-6 h-6 text-brand-blue" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Selamat Datang, {user?.name?.split(' ')[0]} 👋
              </h1>
              <p className="text-sm text-gray-400">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <p className="text-gray-400 max-w-2xl leading-relaxed">
            Pusat otomasi ekosistem <strong>aidigicube.com</strong>. Mulai cari leads, audit SEO, atau buat konten AI untuk 6+ website Anda hari ini.
          </p>
        </div>
        {/* Abstract background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-[100px] -mr-32 -mt-32" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Available Tools', value: activeTools.length, color: 'text-brand-blue', icon: Wrench },
          { label: 'Managed Sites', value: sitesData?.length ?? 0, color: 'text-brand-green', icon: Globe },
          { label: 'Coming Soon', value: comingSoonTools.length, color: 'text-brand-amber', icon: Loader2 },
          { label: 'Team Members', value: 1, color: 'text-white', icon: TrendingUp },
        ].map((stat) => (
          <div key={stat.label} className="card p-6 border-white/5 hover:border-brand-blue/20 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
              <stat.icon className="w-4 h-4 text-gray-600 group-hover:text-brand-blue transition-colors" />
            </div>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left: Active Tools */}
        <div className="col-span-12 lg:col-span-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-brand-blue" />
              <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Aplikasi Aktif</h2>
            </div>
          </div>

          {toolsLoading ? (
            <div className="flex items-center justify-center py-20 card border-dashed border-border">
              <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
            </div>
          ) : activeTools.length === 0 ? (
            <div className="card p-12 text-center text-gray-500 text-sm italic border-dashed border-border">
              Belum ada tool yang tersedia
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick Actions & Recent Sites */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="card p-6 border-brand-blue/20 bg-brand-blue/5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-brand-blue" /> Quick Actions
            </h3>
            <div className="space-y-2">
              <Link to="/sites" className="flex items-center justify-between p-3 rounded-xl bg-bg-tertiary hover:bg-bg-primary border border-border hover:border-brand-blue/30 transition-all group">
                <span className="text-xs text-gray-300">Tambah Website Baru</span>
                <ArrowRight className="w-3 h-3 text-gray-600 group-hover:text-brand-blue" />
              </Link>
              <Link to="/tools/data-scraper" className="flex items-center justify-between p-3 rounded-xl bg-bg-tertiary hover:bg-bg-primary border border-border hover:border-brand-blue/30 transition-all group">
                <span className="text-xs text-gray-300">Mulai Web Scraping</span>
                <ArrowRight className="w-3 h-3 text-gray-600 group-hover:text-brand-blue" />
              </Link>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-green" /> Managed Projects
            </h3>
            <div className="space-y-3">
              {sitesData?.slice(0, 3).map((site: any) => (
                <div key={site.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-bg-tertiary flex items-center justify-center text-xs text-brand-green font-bold border border-brand-green/10">
                    {site.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-200 truncate">{site.name}</p>
                    <p className="text-[10px] text-gray-600 truncate">{site.url}</p>
                  </div>
                </div>
              ))}
              {(!sitesData || sitesData.length === 0) && (
                <p className="text-[10px] text-gray-600 italic">Belum ada project terdaftar</p>
              )}
              <Link to="/sites" className="block text-center text-[10px] text-brand-blue font-bold uppercase tracking-widest pt-4 border-t border-border hover:underline">
                Lihat Semua Project
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
