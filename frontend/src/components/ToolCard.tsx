import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import clsx from 'clsx';

interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  icon: string;
  isActive: boolean;
}

interface ToolCardProps {
  tool: Tool;
  disabled?: boolean;
}

const typeColors: Record<string, string> = {
  scraper: 'text-brand-blue border-brand-blue/20 bg-brand-blue/5',
  generator: 'text-brand-purple border-brand-purple/20 bg-brand-purple/5',
  finder: 'text-brand-teal border-brand-teal/20 bg-brand-teal/5',
};

const typeLabels: Record<string, string> = {
  scraper: 'Data Tool',
  generator: 'AI Tool',
  finder: 'Search Tool',
};

export default function ToolCard({ tool, disabled = false }: ToolCardProps) {
  const navigate = useNavigate();

  function handleClick() {
    if (disabled) return;
    navigate(`/tools/${tool.slug}`);
  }

  return (
    <div
      onClick={handleClick}
      className={clsx(
        'card p-5 transition-all duration-200 group relative overflow-hidden',
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer hover:border-border-light hover:glow-blue hover:-translate-y-0.5'
      )}
    >
      {/* Background shimmer on hover */}
      {!disabled && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/3 to-transparent" />
        </div>
      )}

      {disabled && (
        <div className="absolute top-3 right-3">
          <Lock className="w-3.5 h-3.5 text-gray-600" />
        </div>
      )}

      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{tool.icon}</span>
        <div>
          <h3 className="text-sm font-semibold text-white">{tool.name}</h3>
          <span className={clsx('badge text-[10px] border mt-1', typeColors[tool.type] || 'text-gray-400 border-border bg-bg-tertiary')}>
            {typeLabels[tool.type] || tool.type}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4">
        {tool.description}
      </p>

      {!disabled && (
        <div className="flex items-center gap-1 text-xs text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Open tool</span>
          <ArrowRight className="w-3 h-3" />
        </div>
      )}

      {disabled && (
        <span className="text-xs text-gray-600">Coming Soon</span>
      )}
    </div>
  );
}
