import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { suggestionAPI, Suggestion, SuggestionCategory, SuggestionStatus } from '../lib/supabaseApi';
import { Lightbulb, Wrench, Bug, MessageSquare, Clock, CheckCircle2, XCircle, Filter } from 'lucide-react';

const CATEGORIES: Record<SuggestionCategory, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  nueva_funcion: { label: 'Nueva función', icon: <Lightbulb size={14} />, color: 'text-purple-700', bg: 'bg-purple-100' },
  mejora:        { label: 'Mejora',        icon: <Wrench size={14} />,    color: 'text-blue-700',   bg: 'bg-blue-100'   },
  error:         { label: 'Error',         icon: <Bug size={14} />,       color: 'text-red-700',    bg: 'bg-red-100'    },
  comentario:    { label: 'Comentario',    icon: <MessageSquare size={14} />, color: 'text-gray-700', bg: 'bg-gray-100' },
};

const STATUSES: Record<SuggestionStatus, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  pendiente:   { label: 'Pendiente',  icon: <Clock size={14} />,         color: 'text-yellow-700', bg: 'bg-yellow-100' },
  revisado:    { label: 'Revisado',   icon: <CheckCircle2 size={14} />,  color: 'text-green-700',  bg: 'bg-green-100'  },
  descartado:  { label: 'Descartado', icon: <XCircle size={14} />,       color: 'text-gray-500',   bg: 'bg-gray-100'   },
};

export default function SuggestionsPage() {
  const queryClient = useQueryClient();
  const [filterCategory, setFilterCategory] = useState<SuggestionCategory | 'all'>('all');
  const [filterStatus,   setFilterStatus]   = useState<SuggestionStatus   | 'all'>('all');

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['suggestions', filterCategory, filterStatus],
    queryFn: () => suggestionAPI.getAll({
      category: filterCategory !== 'all' ? filterCategory : undefined,
      status:   filterStatus   !== 'all' ? filterStatus   : undefined,
    }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: SuggestionStatus }) =>
      suggestionAPI.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suggestions'] }),
  });

  const pendingCount = suggestions.filter(s => s.status === 'pendiente').length;

  return (
    <Layout>
      <div className="space-y-4 max-w-3xl mx-auto">
        {/* Header */}
        <div className="page-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare size={22} />
                Buzón de sugerencias
              </h1>
              <p className="text-blue-100 text-sm mt-0.5">
                {suggestions.length} sugerencias
                {pendingCount > 0 && ` · ${pendingCount} pendientes`}
              </p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="card p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter size={14} /> Filtrar por:
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Categoría */}
            {(['all', 'nueva_funcion', 'mejora', 'error', 'comentario'] as const).map(c => (
              <button key={c} onClick={() => setFilterCategory(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  filterCategory === c
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                {c === 'all' ? 'Todas' : CATEGORIES[c].label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Estado */}
            {(['all', 'pendiente', 'revisado', 'descartado'] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  filterStatus === s
                    ? 'bg-gray-800 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                {s === 'all' ? 'Todos los estados' : STATUSES[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : suggestions.length === 0 ? (
          <div className="card p-10 text-center text-gray-400">
            <MessageSquare size={40} className="mx-auto mb-3 text-gray-200" />
            <p>No hay sugerencias con estos filtros</p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((s: Suggestion) => {
              const cat = CATEGORIES[s.category];
              const sts = STATUSES[s.status];
              return (
                <div key={s.id} className={`card p-4 ${s.status === 'descartado' ? 'opacity-50' : ''}`}>
                  <div className="flex items-start gap-3">
                    {/* Ícono categoría */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.bg} ${cat.color}`}>
                      {cat.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cat.bg} ${cat.color}`}>
                          {cat.icon} {cat.label}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${sts.bg} ${sts.color}`}>
                          {sts.icon} {sts.label}
                        </span>
                      </div>

                      {/* Mensaje */}
                      <p className="text-sm text-gray-800 leading-relaxed">{s.message}</p>

                      {/* Meta */}
                      <p className="text-xs text-gray-400 mt-1.5">
                        {s.user_name || 'Usuario'} · {new Date(s.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    {/* Cambiar estado */}
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      {(['pendiente', 'revisado', 'descartado'] as SuggestionStatus[])
                        .filter(st => st !== s.status)
                        .map(st => (
                          <button key={st}
                            onClick={() => updateStatus.mutate({ id: s.id, status: st })}
                            className={`text-xs px-2 py-1 rounded-lg border transition ${STATUSES[st].bg} ${STATUSES[st].color} border-current hover:opacity-80`}>
                            → {STATUSES[st].label}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
