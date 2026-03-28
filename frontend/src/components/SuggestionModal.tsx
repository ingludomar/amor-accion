import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { suggestionAPI, SuggestionCategory } from '../lib/supabaseApi';
import { useAuthStore } from '../store/authStore';
import { X, Lightbulb, Wrench, Bug, MessageSquare, CheckCircle2 } from 'lucide-react';

const CATEGORIES: { value: SuggestionCategory; label: string; desc: string; icon: React.ReactNode; color: string; bg: string }[] = [
  { value: 'nueva_funcion', label: 'Nueva función', desc: 'Algo que te gustaría tener',    icon: <Lightbulb size={20} />,    color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  { value: 'mejora',        label: 'Mejora',        desc: 'Algo que podría funcionar mejor', icon: <Wrench size={20} />,       color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200'     },
  { value: 'error',         label: 'Error',         desc: 'Algo que no funciona bien',      icon: <Bug size={20} />,          color: 'text-red-700',    bg: 'bg-red-50 border-red-200'       },
  { value: 'comentario',    label: 'Comentario',    desc: 'Cualquier otra observación',     icon: <MessageSquare size={20} />, color: 'text-gray-700',  bg: 'bg-gray-50 border-gray-200'     },
];

interface Props {
  onClose: () => void;
}

export default function SuggestionModal({ onClose }: Props) {
  const { user } = useAuthStore();
  const [category, setCategory] = useState<SuggestionCategory | null>(null);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const sendMutation = useMutation({
    mutationFn: () => suggestionAPI.create(
      category!,
      message.trim(),
      user?.full_name || user?.email || 'Usuario',
    ),
    onSuccess: () => setSent(true),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category || !message.trim()) return;
    sendMutation.mutate();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
        {/* Handle mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Enviar sugerencia</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={22} />
            </button>
          </div>

          {sent ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <p className="font-semibold text-gray-900">¡Gracias por tu sugerencia!</p>
              <p className="text-sm text-gray-500">El equipo la revisará próximamente.</p>
              <button onClick={onClose} className="btn-primary mt-2">Cerrar</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">¿Qué tipo de sugerencia es? *</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(c => (
                    <button key={c.value} type="button"
                      onClick={() => setCategory(c.value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-left transition ${
                        category === c.value
                          ? `${c.bg} border-current ${c.color}`
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}>
                      <span className={category === c.value ? c.color : 'text-gray-400'}>{c.icon}</span>
                      <span className="text-xs font-semibold leading-tight">{c.label}</span>
                      <span className="text-xs text-gray-400 text-center leading-tight">{c.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mensaje */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Describe tu sugerencia *
                </label>
                <textarea
                  className="input-field"
                  rows={4}
                  placeholder="Cuéntanos con detalle..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
              </div>

              {sendMutation.isError && (
                <p className="text-sm text-red-600">Error al enviar. Intenta de nuevo.</p>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit"
                  disabled={!category || !message.trim() || sendMutation.isPending}
                  className="btn-primary flex-1">
                  {sendMutation.isPending ? 'Enviando…' : 'Enviar'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
