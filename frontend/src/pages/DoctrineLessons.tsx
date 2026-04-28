import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { doctrineCourseAPI, doctrineLessonAPI, userAPI, DoctrineLesson, DAY_NAMES } from '../lib/supabaseApi';
import { usePermission } from '../hooks/usePermission';
import { BookOpen, Plus, Pencil, Trash2, X, CheckCircle2, User, Calendar } from 'lucide-react';

export default function DoctrineLessons() {
  const perm = usePermission('doctrine_lessons');
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DoctrineLesson | null>(null);

  const { data: courses = [] } = useQuery({
    queryKey: ['doctrine-courses-active'],
    queryFn: () => doctrineCourseAPI.getAll({ is_active: true }),
  });

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['doctrine-lessons', selectedCourse],
    queryFn: () => doctrineLessonAPI.getAll(selectedCourse ? { course_id: selectedCourse } : undefined),
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ['users-teachers-doctrine'],
    queryFn: async () => {
      const { data } = await userAPI.getAll();
      return (data.data || []).filter((u: any) => u.role === 'profesor' || u.role === 'admin' || u.role === 'coordinador');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => doctrineLessonAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['doctrine-lessons'] }),
    onError: (e: any) => alert('Error: ' + e.message),
  });

  const toggleDoneMutation = useMutation({
    mutationFn: ({ id, done }: { id: string; done: boolean }) =>
      doctrineLessonAPI.update(id, { is_done: done, actual_date: done ? new Date().toISOString().split('T')[0] : undefined }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['doctrine-lessons'] }),
  });

  const openNew = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (l: DoctrineLesson) => { setEditing(l); setFormOpen(true); };

  return (
    <Layout>
      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <BookOpen size={22} />
              Lecciones de Doctrina
            </h1>
            <p className="text-blue-100 text-sm mt-0.5">Lecciones secuenciales por curso</p>
          </div>
          {perm.canCreate && (
            <button onClick={openNew} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5">
              <Plus size={16} /> Nueva
            </button>
          )}
        </div>

        {/* Filtro por curso */}
        <div className="card p-3">
          <select
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            className="input-field text-sm"
          >
            <option value="">Todos los cursos</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({DAY_NAMES[c.day_of_week]})</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : lessons.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No hay lecciones {selectedCourse ? 'en este curso' : 'creadas'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {lessons.map(l => (
              <div key={l.id} className={`card p-4 ${l.is_done ? 'border-l-4 border-l-green-500 bg-green-50/30' : ''}`}>
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => perm.canEdit && toggleDoneMutation.mutate({ id: l.id, done: !l.is_done })}
                    disabled={!perm.canEdit}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition ${
                      l.is_done ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    title={l.is_done ? 'Marcar como pendiente' : 'Marcar como realizada'}
                  >
                    {l.is_done ? <CheckCircle2 size={18} /> : l.sequence_number}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-gray-900">{l.title}</h4>
                      {l.scripture_ref && (
                        <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {l.scripture_ref}
                        </span>
                      )}
                      {l.has_quiz && (
                        <span className="text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded">📝 Cuestionario</span>
                      )}
                    </div>

                    {l.description && <p className="text-xs text-gray-500 mt-0.5">{l.description}</p>}

                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(l.planned_date + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      {l.course && (
                        <span className="text-blue-600 font-medium">{l.course.name}</span>
                      )}
                      {l.teacher && (
                        <span className="flex items-center gap-1">
                          <User size={11} />
                          {l.teacher.full_name || l.teacher.email}
                        </span>
                      )}
                    </div>
                  </div>

                  {(perm.canEdit || perm.canDelete) && (
                    <div className="flex gap-1 flex-shrink-0">
                      {perm.canEdit && (
                        <button onClick={() => openEdit(l)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Pencil size={15} />
                        </button>
                      )}
                      {perm.canDelete && (
                        <button onClick={() => { if (confirm(`¿Eliminar lección "${l.title}"?`)) deleteMutation.mutate(l.id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {formOpen && (
        <LessonForm
          lesson={editing}
          courses={courses}
          teachers={teachers}
          defaultCourseId={selectedCourse}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          onSaved={() => queryClient.invalidateQueries({ queryKey: ['doctrine-lessons'] })}
        />
      )}
    </Layout>
  );
}

function LessonForm({ lesson, courses, teachers, defaultCourseId, onClose, onSaved }: {
  lesson: DoctrineLesson | null;
  courses: any[];
  teachers: any[];
  defaultCourseId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    course_id: lesson?.course_id || defaultCourseId || (courses[0]?.id || ''),
    sequence_number: lesson?.sequence_number ?? 1,
    title: lesson?.title || '',
    scripture_ref: lesson?.scripture_ref || '',
    description: lesson?.description || '',
    planned_date: lesson?.planned_date || today,
    teacher_id: lesson?.teacher_id || '',
    has_quiz: lesson?.has_quiz ?? false,
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.course_id) return;
    setSaving(true);
    try {
      const payload = {
        course_id: form.course_id,
        sequence_number: form.sequence_number,
        title: form.title.trim(),
        scripture_ref: form.scripture_ref.trim() || undefined,
        description: form.description.trim() || undefined,
        planned_date: form.planned_date,
        teacher_id: form.teacher_id || undefined,
        has_quiz: form.has_quiz,
      };
      if (lesson) {
        await doctrineLessonAPI.update(lesson.id, payload);
      } else {
        await doctrineLessonAPI.create(payload as any);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{lesson ? 'Editar lección' : 'Nueva lección'}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Curso *</label>
            <select required value={form.course_id}
              onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))}
              className="input-field">
              <option value="">Seleccionar...</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({DAY_NAMES[c.day_of_week]})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Número *</label>
              <input type="number" required min={1} value={form.sequence_number}
                onChange={e => setForm(f => ({ ...f, sequence_number: Number(e.target.value) }))}
                className="input-field" />
            </div>
            <div>
              <label className="label">Fecha *</label>
              <input type="date" required value={form.planned_date}
                onChange={e => setForm(f => ({ ...f, planned_date: e.target.value }))}
                className="input-field" />
            </div>
          </div>

          <div>
            <label className="label">Título *</label>
            <input type="text" required value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="input-field"
              placeholder="Ej: Evangelio Cap V item 10" />
          </div>

          <div>
            <label className="label">Referencia bíblica <span className="text-gray-400 font-normal">(opcional)</span></label>
            <input type="text" value={form.scripture_ref}
              onChange={e => setForm(f => ({ ...f, scripture_ref: e.target.value }))}
              className="input-field"
              placeholder="Ej: Mat 5:10" />
          </div>

          <div>
            <label className="label">Profesor a cargo <span className="text-gray-400 font-normal">(opcional)</span></label>
            <select value={form.teacher_id}
              onChange={e => setForm(f => ({ ...f, teacher_id: e.target.value }))}
              className="input-field">
              <option value="">Sin asignar</option>
              {teachers.map((t: any) => (
                <option key={t.id} value={t.id}>{t.full_name || t.email}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Descripción <span className="text-gray-400 font-normal">(opcional)</span></label>
            <textarea value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="input-field min-h-[60px]" />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="has_quiz"
              checked={form.has_quiz}
              onChange={e => setForm(f => ({ ...f, has_quiz: e.target.checked }))}
              className="w-4 h-4" />
            <label htmlFor="has_quiz" className="text-sm text-gray-700">Tiene cuestionario / examen</label>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Guardando...' : lesson ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
