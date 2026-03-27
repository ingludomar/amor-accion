import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { topicAPI, groupAPI, gradeAPI, studentAPI, Topic, CreateTopicRequest } from '../lib/supabaseApi';
import { useGradeScale } from '../hooks/useGradeScale';
import { BookOpen, Plus, Pencil, Trash2, X, Calendar, CheckCircle2, Clock, Star } from 'lucide-react';

const STATUS_COLORS = {
  done:    'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

export default function Topics() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [filterGroup, setFilterGroup] = useState('');
  const [filterDone, setFilterDone] = useState<string>('');
  const [form, setForm] = useState<Partial<CreateTopicRequest>>({
    title: '', description: '', group_id: '', planned_date: '', actual_date: '',
  });

  const { scaleMap } = useGradeScale();

  // Estado modal calificaciones
  const [gradingTopic, setGradingTopic] = useState<Topic | null>(null);
  const [scores, setScores] = useState<Record<string, { score: number; notes: string }>>({});

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['topics', filterGroup, filterDone],
    queryFn: async () => {
      const { data } = await topicAPI.getAll({
        group_id: filterGroup || undefined,
        is_done: filterDone === '' ? undefined : filterDone === 'true',
      });
      return data as Topic[];
    },
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => { const { data } = await groupAPI.getAll(); return data; },
  });

  const createMutation = useMutation({
    mutationFn: (t: CreateTopicRequest) => topicAPI.create(t),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['topics'] }); closeModal(); },
    onError: (e: any) => alert('Error: ' + e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => topicAPI.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['topics'] }); closeModal(); },
    onError: (e: any) => alert('Error: ' + e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: topicAPI.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['topics'] }),
    onError: (e: any) => alert('Error: ' + e.message),
  });

  const openCreate = () => {
    setEditingTopic(null);
    setForm({ title: '', description: '', group_id: filterGroup || '', planned_date: '', actual_date: '' });
    setIsModalOpen(true);
  };

  const openEdit = (t: Topic) => {
    setEditingTopic(t);
    setForm({ title: t.title, description: t.description || '', group_id: t.group_id, planned_date: t.planned_date, actual_date: t.actual_date || '' });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingTopic(null); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTopic) {
      updateMutation.mutate({ id: editingTopic.id, data: form });
    } else {
      createMutation.mutate(form as CreateTopicRequest);
    }
  };

  const toggleDone = (t: Topic) => {
    updateMutation.mutate({ id: t.id, data: { is_done: !t.is_done } });
  };

  // Estudiantes del grupo del tema seleccionado para calificar
  const { data: groupStudents = [] } = useQuery({
    queryKey: ['students-by-group', gradingTopic?.group_id],
    enabled: !!gradingTopic?.group_id,
    queryFn: async () => {
      const { data } = await studentAPI.getAll({ group_id: gradingTopic!.group_id, is_active: true });
      return data ?? [];
    },
  });

  // Calificaciones ya guardadas para el tema seleccionado
  const { data: existingGrades = [] } = useQuery({
    queryKey: ['grades-topic', gradingTopic?.id],
    enabled: !!gradingTopic?.id,
    queryFn: () => gradeAPI.getByTopic(gradingTopic!.id),
  });

  // Pre-cargar scores existentes cuando se abra el modal
  useEffect(() => {
    if (existingGrades.length > 0) {
      const map: Record<string, { score: number; notes: string }> = {};
      existingGrades.forEach((g: any) => { map[g.student_id] = { score: g.score, notes: g.notes || '' }; });
      setScores(map);
    }
  }, [existingGrades]);

  const gradeMutation = useMutation({
    mutationFn: async () => {
      const rows = Object.entries(scores)
        .filter(([, v]) => v.score > 0)
        .map(([student_id, v]) => ({
          student_id,
          topic_id: gradingTopic!.id,
          score: v.score,
          notes: v.notes || undefined,
        }));
      if (rows.length === 0) return;
      await gradeAPI.upsertBatch(rows);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades-topic'] });
      queryClient.invalidateQueries({ queryKey: ['grades-student'] });
      setGradingTopic(null);
    },
    onError: (e: any) => alert('Error al guardar: ' + e.message),
  });

  function openGrading(t: Topic) {
    setScores({});
    setGradingTopic(t);
  }

  return (
    <Layout>
      <div className="space-y-5">
        {/* Header */}
        <div className="page-header">
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-3">
            <BookOpen className="w-7 h-7" />
            Temas
          </h1>
          <p className="text-blue-100 text-sm">Planifica y gestiona los temas de cada grupo</p>
        </div>

        {/* Filtros + Acción */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)} className="input-field flex-1">
              <option value="">Todos los grupos</option>
              {groups.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <select value={filterDone} onChange={e => setFilterDone(e.target.value)} className="input-field flex-1">
              <option value="">Todos</option>
              <option value="false">Pendientes</option>
              <option value="true">Realizados</option>
            </select>
            <button onClick={openCreate} className="btn-primary whitespace-nowrap">
              <Plus className="w-5 h-5" /> Nuevo Tema
            </button>
          </div>
        </div>

        {/* Lista */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : topics.length === 0 ? (
          <div className="card p-12 text-center">
            <BookOpen className="w-14 h-14 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No hay temas registrados</p>
            <button onClick={openCreate} className="btn-primary mt-4">
              <Plus className="w-5 h-5" /> Agregar tema
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {topics.map((t) => (
              <div key={t.id} className={`card p-4 border-l-4 ${t.is_done ? 'border-green-400' : 'border-yellow-400'}`}>
                <div className="flex items-start gap-3">
                  {/* Checkbox grande (mobile friendly) */}
                  <button
                    onClick={() => toggleDone(t)}
                    className={`mt-1 w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                      t.is_done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {t.is_done && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-900">{t.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.is_done ? STATUS_COLORS.done : STATUS_COLORS.pending}`}>
                        {t.is_done ? 'Realizado' : 'Pendiente'}
                      </span>
                      {t.group && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {t.group.name}
                        </span>
                      )}
                    </div>

                    {t.description && <p className="text-sm text-gray-500 mb-2">{t.description}</p>}

                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Planificado: <strong>{new Date(t.planned_date + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                      </span>
                      {t.actual_date && (
                        <span className="flex items-center gap-1 text-green-600">
                          <Clock className="w-3 h-3" />
                          Realizado: <strong>{new Date(t.actual_date + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-1">
                    {t.is_done && (
                      <button onClick={() => openGrading(t)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg" title="Calificar estudiantes">
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => openEdit(t)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { if (confirm(`¿Eliminar tema "${t.title}"?`)) deleteMutation.mutate(t.id); }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Calificaciones */}
      {gradingTopic && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] flex flex-col">
            <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Calificar estudiantes</h2>
                <p className="text-xs text-gray-400 mt-0.5">{gradingTopic.title}</p>
              </div>
              <button onClick={() => setGradingTopic(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              {groupStudents.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No hay estudiantes en este grupo</p>
              ) : (
                groupStudents.map((s: any) => {
                  const current = scores[s.id] ?? { score: 0, notes: '' };
                  return (
                    <div key={s.id} className="border border-gray-100 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-blue-600">
                            {s.full_name.charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{s.full_name}</p>
                          <p className="text-xs text-gray-400">{s.student_code}</p>
                        </div>
                        {current.score > 0 && scaleMap[current.score] && (
                          <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${scaleMap[current.score].bg} ${scaleMap[current.score].text}`}>
                            {scaleMap[current.score].label}
                          </span>
                        )}
                      </div>

                      {/* Selector de nota 1-5 */}
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(n => (
                          <button
                            key={n}
                            onClick={() => setScores(p => ({ ...p, [s.id]: { ...current, score: n } }))}
                            title={scaleMap[n]?.label}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition ${
                              current.score === n
                                ? `${scaleMap[n]?.bg ?? 'bg-gray-100'} ${scaleMap[n]?.text ?? 'text-gray-700'} border-current`
                                : 'border-gray-200 text-gray-400 hover:border-gray-300'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>

                      {/* Nota opcional */}
                      <input
                        type="text"
                        placeholder="Observación (opcional)"
                        value={current.notes}
                        onChange={e => setScores(p => ({ ...p, [s.id]: { ...current, notes: e.target.value } }))}
                        className="input-field text-sm"
                      />
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t p-4 flex gap-3 flex-shrink-0">
              <button onClick={() => setGradingTopic(null)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button
                onClick={() => gradeMutation.mutate()}
                disabled={gradeMutation.isPending || Object.values(scores).filter(v => v.score > 0).length === 0}
                className="btn-primary flex-1"
              >
                {gradeMutation.isPending ? 'Guardando…' : 'Guardar calificaciones'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editingTopic ? 'Editar Tema' : 'Nuevo Tema'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="input-field"
                  placeholder="Nombre del tema"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input-field"
                  rows={2}
                  placeholder="Descripción opcional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grupo *</label>
                <select
                  required
                  value={form.group_id}
                  onChange={e => setForm({ ...form, group_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Seleccionar grupo</option>
                  {groups.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha planificada *</label>
                <input
                  required
                  type="date"
                  value={form.planned_date}
                  onChange={e => setForm({ ...form, planned_date: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha real <span className="text-gray-400 font-normal">(si fue diferente)</span>
                </label>
                <input
                  type="date"
                  value={form.actual_date}
                  onChange={e => setForm({ ...form, actual_date: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1">
                  {editingTopic ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
