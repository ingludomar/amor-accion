import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { doctrineCourseAPI, DoctrineCourse, DAY_NAMES } from '../lib/supabaseApi';
import { usePermission } from '../hooks/usePermission';
import { BookMarked, Plus, Pencil, Trash2, X, Clock, Lock } from 'lucide-react';

const DAY_COLORS: Record<number, string> = {
  1: 'bg-blue-100 text-blue-800 border-blue-200',
  2: 'bg-green-100 text-green-800 border-green-200',
  3: 'bg-purple-100 text-purple-800 border-purple-200',
  4: 'bg-amber-100 text-amber-800 border-amber-200',
  5: 'bg-pink-100 text-pink-800 border-pink-200',
  6: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  7: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function DoctrineCourses() {
  const perm = usePermission('doctrine_courses');
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DoctrineCourse | null>(null);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['doctrine-courses'],
    queryFn: () => doctrineCourseAPI.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => doctrineCourseAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['doctrine-courses'] }),
    onError: (e: any) => alert('Error: ' + e.message),
  });

  const openNew = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (c: DoctrineCourse) => { setEditing(c); setFormOpen(true); };

  return (
    <Layout>
      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <BookMarked size={22} />
              Cursos de Doctrina
            </h1>
            <p className="text-blue-100 text-sm mt-0.5">Cursos por día y horario</p>
          </div>
          {perm.canCreate && (
            <button onClick={openNew} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5">
              <Plus size={16} /> Nuevo
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">
            <BookMarked className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Aún no hay cursos creados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map(c => (
              <div key={c.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${DAY_COLORS[c.day_of_week] || DAY_COLORS[7]}`}>
                      {DAY_NAMES[c.day_of_week]}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mt-2">{c.name}</h3>
                    {c.description && <p className="text-sm text-gray-500 mt-0.5">{c.description}</p>}
                  </div>
                  {(perm.canEdit || perm.canDelete) && (
                    <div className="flex gap-1 flex-shrink-0">
                      {perm.canEdit && (
                        <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Pencil size={15} />
                        </button>
                      )}
                      {perm.canDelete && (
                        <button onClick={() => { if (confirm(`¿Eliminar curso "${c.name}"?`)) deleteMutation.mutate(c.id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {c.start_time.slice(0, 5)} - {c.end_time.slice(0, 5)}
                  </span>
                </div>

                {c.prerequisite && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded mt-2">
                    <Lock size={11} />
                    Requiere: {c.prerequisite.name}
                  </div>
                )}

                {!c.is_active && (
                  <span className="inline-block mt-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Inactivo</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {formOpen && (
        <CourseForm
          course={editing}
          courses={courses}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          onSaved={() => queryClient.invalidateQueries({ queryKey: ['doctrine-courses'] })}
        />
      )}
    </Layout>
  );
}

function CourseForm({ course, courses, onClose, onSaved }: {
  course: DoctrineCourse | null;
  courses: DoctrineCourse[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: course?.name || '',
    description: course?.description || '',
    day_of_week: course?.day_of_week ?? 1,
    start_time: course?.start_time?.slice(0, 5) || '19:00',
    end_time: course?.end_time?.slice(0, 5) || '21:00',
    prerequisite_id: course?.prerequisite_id || '',
    is_active: course?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        day_of_week: form.day_of_week,
        start_time: form.start_time + ':00',
        end_time: form.end_time + ':00',
        prerequisite_id: form.prerequisite_id || undefined,
        is_active: form.is_active,
      };
      if (course) {
        await doctrineCourseAPI.update(course.id, payload);
      } else {
        await doctrineCourseAPI.create(payload as any);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  const otherCourses = courses.filter(c => c.id !== course?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{course ? 'Editar curso' : 'Nuevo curso'}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Nombre *</label>
            <input
              type="text" required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input-field"
              placeholder="Ej: Curso Inicial"
            />
          </div>

          <div>
            <label className="label">Día de la semana *</label>
            <select
              value={form.day_of_week}
              onChange={e => setForm(f => ({ ...f, day_of_week: Number(e.target.value) }))}
              className="input-field"
            >
              {[1, 2, 3, 4, 5, 6, 7].map(d => (
                <option key={d} value={d}>{DAY_NAMES[d]}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Hora inicio *</label>
              <input type="time" required value={form.start_time}
                onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                className="input-field" />
            </div>
            <div>
              <label className="label">Hora fin *</label>
              <input type="time" required value={form.end_time}
                onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                className="input-field" />
            </div>
          </div>

          <div>
            <label className="label">Prerequisito <span className="text-gray-400 font-normal">(opcional)</span></label>
            <select
              value={form.prerequisite_id}
              onChange={e => setForm(f => ({ ...f, prerequisite_id: e.target.value }))}
              className="input-field"
            >
              <option value="">Sin prerequisito</option>
              {otherCourses.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({DAY_NAMES[c.day_of_week]})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Descripción <span className="text-gray-400 font-normal">(opcional)</span></label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="input-field min-h-[60px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox" id="is_active"
              checked={form.is_active}
              onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
              className="w-4 h-4"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">Curso activo</label>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Guardando...' : course ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
