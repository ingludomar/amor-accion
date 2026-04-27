import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { groupAPI, userAPI } from '../lib/supabaseApi';
import type { Group } from '../lib/supabaseApi';
import { Users, UserPlus, X, ChevronDown, Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { usePermission } from '../hooks/usePermission';

const GROUP_COLORS: Record<string, { badge: string; gradient: string }> = {
  'Jardín':       { badge: 'bg-blue-100 text-blue-800 border-blue-200',   gradient: 'from-blue-500 to-blue-600' },
  'Infancia':     { badge: 'bg-green-100 text-green-800 border-green-200', gradient: 'from-green-500 to-green-600' },
  'Pre-Juventud': { badge: 'bg-purple-100 text-purple-800 border-purple-200', gradient: 'from-purple-500 to-purple-600' },
};

const DEFAULT_COLOR = { badge: 'bg-gray-100 text-gray-800 border-gray-200', gradient: 'from-gray-500 to-gray-600' };

export default function Groups() {
  const queryClient = useQueryClient();
  const perm = usePermission('groups');
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const { data } = await groupAPI.getAll();
      return data as (Group & { group_teachers: { teacher_id: string }[] })[];
    },
  });

  const { data: allTeachers = [] } = useQuery({
    queryKey: ['users-teachers'],
    queryFn: async () => {
      const { data } = await userAPI.getAll();
      return (data.data || []).filter((u: any) => u.role === 'profesor' || u.role === 'admin');
    },
  });

  const addMutation = useMutation({
    mutationFn: ({ groupId, teacherId }: { groupId: string; teacherId: string }) =>
      groupAPI.addTeacher(groupId, teacherId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setAddingTo(null);
      setSelectedTeacher('');
    },
    onError: (e: any) => alert('Error: ' + e.message),
  });

  const removeMutation = useMutation({
    mutationFn: ({ groupId, teacherId }: { groupId: string; teacherId: string }) =>
      groupAPI.removeTeacher(groupId, teacherId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
    onError: (e: any) => alert('Error: ' + e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => groupAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
    onError: (e: any) => alert(e.message),
  });

  const openNew = () => {
    setEditingGroup(null);
    setFormOpen(true);
  };

  const openEdit = (g: Group) => {
    setEditingGroup(g);
    setFormOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Users size={22} />
              Grupos
            </h1>
            <p className="text-blue-100 text-sm mt-0.5">Gestiona grupos y asigna profesores</p>
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
        ) : (
          <div className="space-y-4">
            {groups.map((group) => {
              const colors = GROUP_COLORS[group.name] || DEFAULT_COLOR;
              const assignedIds = new Set((group.group_teachers || []).map(t => t.teacher_id));
              const teachers = allTeachers.filter((t: any) => assignedIds.has(t.id));
              const available = allTeachers.filter((t: any) => !assignedIds.has(t.id));
              const isAdding = addingTo === group.id;

              return (
                <div key={group.id} className="card p-5">
                  {/* Group header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow flex-shrink-0`}>
                      <Users size={22} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${colors.badge}`}>
                        {group.name}
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">{group.description}</p>
                    </div>
                    {(perm.canEdit || perm.canDelete) && (
                      <div className="flex gap-1 flex-shrink-0">
                        {perm.canEdit && (
                          <button
                            onClick={() => openEdit(group)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>
                        )}
                        {perm.canDelete && (
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar el grupo "${group.name}"?`)) {
                                deleteMutation.mutate(group.id);
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Profesores asignados */}
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Profesores asignados
                    </p>

                    {teachers.length === 0 ? (
                      <p className="text-sm text-gray-400 italic mb-2">Sin profesores asignados</p>
                    ) : (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {teachers.map((t: any) => (
                          <span
                            key={t.id}
                            className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-700 shadow-sm"
                          >
                            {t.full_name || t.email}
                            <button
                              onClick={() => removeMutation.mutate({ groupId: group.id, teacherId: t.id })}
                              className="text-gray-400 hover:text-red-500 transition"
                              title="Quitar"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Agregar profesor */}
                    {isAdding ? (
                      <div className="flex gap-2 mt-2">
                        <div className="relative flex-1">
                          <select
                            value={selectedTeacher}
                            onChange={e => setSelectedTeacher(e.target.value)}
                            className="input-field pr-8 appearance-none text-sm"
                          >
                            <option value="">Seleccionar profesor...</option>
                            {available.map((t: any) => (
                              <option key={t.id} value={t.id}>
                                {t.full_name || t.email}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                        </div>
                        <button
                          onClick={() => {
                            if (selectedTeacher)
                              addMutation.mutate({ groupId: group.id, teacherId: selectedTeacher });
                          }}
                          disabled={!selectedTeacher || addMutation.isPending}
                          className="btn-primary text-sm px-3"
                        >
                          Agregar
                        </button>
                        <button
                          onClick={() => { setAddingTo(null); setSelectedTeacher(''); }}
                          className="btn-secondary text-sm px-3"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      available.length > 0 && (
                        <button
                          onClick={() => { setAddingTo(group.id); setSelectedTeacher(''); }}
                          className="flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:underline mt-1"
                        >
                          <UserPlus size={15} />
                          Agregar profesor
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {formOpen && (
        <GroupForm
          group={editingGroup}
          onClose={() => { setFormOpen(false); setEditingGroup(null); }}
          onSaved={() => queryClient.invalidateQueries({ queryKey: ['groups'] })}
        />
      )}
    </Layout>
  );
}

// ─── Formulario de grupo ───────────────────────────────────────
interface GroupFormProps {
  group: Group | null;
  onClose: () => void;
  onSaved: () => void;
}

function GroupForm({ group, onClose, onSaved }: GroupFormProps) {
  const [form, setForm] = useState({
    name:        group?.name || '',
    description: group?.description || '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (group) {
        await groupAPI.update(group.id, {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
        });
      } else {
        await groupAPI.create({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
        });
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{group ? 'Editar grupo' : 'Nuevo grupo'}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Nombre *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input-field"
              placeholder="Ej: Adolescencia"
              required
            />
          </div>

          <div>
            <label className="label">Descripción <span className="text-gray-400 font-normal">(opcional)</span></label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="input-field min-h-[70px]"
              placeholder="Breve descripción del grupo..."
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Guardando...' : group ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
