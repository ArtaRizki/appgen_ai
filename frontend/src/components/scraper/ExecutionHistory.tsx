import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Clock, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

interface Execution {
  id: string;
  status: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  error: string;
  duration: number;
  createdAt: string;
}

interface ExecutionHistoryProps {
  toolSlug: string;
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: React.ReactNode; className: string; label: string }> = {
    success: { icon: <CheckCircle className="w-3 h-3" />, className: 'badge-success', label: 'Success' },
    error: { icon: <XCircle className="w-3 h-3" />, className: 'badge-error', label: 'Error' },
    processing: { icon: <Loader2 className="w-3 h-3 animate-spin" />, className: 'badge-processing', label: 'Processing' },
    pending: { icon: <Clock className="w-3 h-3" />, className: 'badge-pending', label: 'Pending' },
  };

  const c = config[status] || config.pending;
  return (
    <span className={clsx('badge', c.className, 'flex items-center gap-1')}>
      {c.icon} {c.label}
    </span>
  );
}

export default function ExecutionHistory({ toolSlug }: ExecutionHistoryProps) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['history', toolSlug],
    queryFn: () => api.get(`/tools/${toolSlug}/history`).then((r) => r.data.executions as Execution[]),
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 text-brand-blue animate-spin" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 text-sm">
        No executions yet. Run the tool above to see history.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-500">{data.length} execution(s)</p>
        <button onClick={() => refetch()} className="btn-secondary py-1 px-2 text-xs">
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      <div className="space-y-2">
        {data.map((exec) => {
          const output = exec.output as any;
          return (
            <div key={exec.id} className="card-sm p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <StatusBadge status={exec.status} />
                  <span className="text-xs text-gray-500 font-mono">{exec.id}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  {exec.duration && <span>{exec.duration}ms</span>}
                  <span>{new Date(exec.createdAt).toLocaleString('en-US')}</span>
                </div>
              </div>

              {exec.status === 'success' && output && (
                <div className="flex gap-4 text-xs mt-1">
                  <span className="text-gray-500">Source: <span className="text-gray-300">{output.sourceType}</span></span>
                  <span className="text-gray-500">Total: <span className="text-brand-green font-medium">{output.totalRows}</span></span>
                  <span className="text-gray-500">Imported: <span className="text-brand-green font-medium">{output.rowsImported}</span></span>
                  {output.rowsFailed > 0 && (
                    <span className="text-gray-500">Failed: <span className="text-brand-coral font-medium">{output.rowsFailed}</span></span>
                  )}
                </div>
              )}

              {exec.status === 'error' && (
                <p className="text-xs text-red-400 mt-1 font-mono">{exec.error}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
