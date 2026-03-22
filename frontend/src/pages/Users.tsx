/**
 * User management - Admin, Coordinador, Profesor roles
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { userAPI } from '../lib/supabaseApi';
import type { UserDetail } from '../lib/supabaseApi';
import {
  Shield, Users, GraduationCap, Plus, Pencil, Eye, EyeOff,
  X, ToggleLeft, ToggleRight, AlertCircle
} from 'lucide-react';

type RoleKey = 'admin' | 'coordinador' | 'profesor';

const ROLES: Record<RoleKey, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  admin: {
    label: 'Administrador',
    color: 'text-red-700',
    bg: 'bg-red-100',
    icon: <Shield size={16} />,
  },
  coordinador: {
    label: 'Coordinador',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    icon: <Users size={16} />,
  },
  profesor: {
    label: 'Profesor',
    color: 'text-green-700',
    bg: 'bg-green-100',
    icon: <GraduationCap size={16} />,
  },
};

function RoleBadge({ role }: { role: string }) {
  const r = ROLES[role as RoleKey];
  if (!r) return <span className="text-xs text-gray-400">{role}</span>;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${r.bg} ${r.color}`}>
      {r.icon}
      {r.label}
    </span>
  );
}

interface FormData {
  full_name: string;
  email: string;
  password: string;
  role: RoleKey;
}

const emptyForm: FormData = {
  full_name: '',
  email: '',
  password: '',
  role: 'profesor',
};

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [filterRole, setFilterRole] = useState<RoleKey | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserDetail | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const { data: users = [], isLoading } = useQuery<UserDetail[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await userAPI.getAll();
      return res.data.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (f: FormData) => {
      return userAPI.create({
        email: f.email,
        password: f.password,
        full_name: f.full_name,
        role_ids: [f.role],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeModal();
    },
    onError: (e: any) => setError(e?.message || 'Error al crear usuario'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, f }: { id: string; f: FormData }) => {
      return userAPI.update(id, {
        full_name: f.full_name,
        role_ids: [f.role],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeModal();
    },
    onError: (e: any) => setError(e?.message || 'Error al actualizar usuario'),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      userAPI.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setShowPass(false);
    setModalOpen(true);
  }

  function openEdit(u: UserDetail) {
    setEditing(u);
    setForm({
      full_name: u.full_name || '',
      email: u.email,
      password: '',
      role: (u.role as RoleKey) || 'profesor',
    });
    setError('');
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.full_name.trim()) return setError('El nombre es obligatorio');
    if (!editing) {
      if (!form.email.trim()) return setError('El correo es obligatorio');
      if (form.password.length < 8) return setError('La contraseña debe tener mínimo 8 caracteres');
      createMutation.mutate(form);
    } else {
      updateMutation.mutate({ id: editing.id, f: form });
    }
  }

  const filtered = users.filter(u =>
    filterRole === 'all' ? true : u.role === filterRole
  );

  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="page-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Usuarios</h1>
              <p className="text-blue-100 text-sm mt-0.5">{users.length} usuarios registrados</p>
            </div>
            <button onClick={openCreate} className="flex items-center gap-2 bg-white text-blue-700 font-semibold px-4 py-2 rounded-xl text-sm shadow">
              <Plus size={18} />
              Nuevo
            </button>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['all', 'admin', 'coordinador', 'profesor'] as const).map(r => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                filterRole === r
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {r === 'all' ? 'Todos' : ROLES[r].label}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-8 text-center text-gray-500">
            <Users size={40} className="mx-auto mb-3 text-gray-300" />
            <p>No hay usuarios</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(u => (
              <div key={u.id} className={`card p-4 flex items-center gap-3 ${!u.is_active ? 'opacity-60' : ''}`}>
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${ROLES[u.role as RoleKey]?.bg || 'bg-gray-100'}`}>
                  <span className={`text-sm font-bold ${ROLES[u.role as RoleKey]?.color || 'text-gray-600'}`}>
                    {(u.full_name || u.email).charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{u.full_name || '—'}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  <div className="mt-1">
                    <RoleBadge role={u.role} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(u)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition"
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => toggleActive.mutate({ id: u.id, is_active: !u.is_active })}
                    className={`p-2 transition ${u.is_active ? 'text-green-500 hover:text-gray-400' : 'text-gray-400 hover:text-green-500'}`}
                    title={u.is_active ? 'Desactivar' : 'Activar'}
                  >
                    {u.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom-sheet modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center bg-black/50">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="p-5">
              {/* Title */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">
                  {editing ? 'Editar usuario' : 'Nuevo usuario'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full name */}
                <div>
                  <label className="label">Nombre completo *</label>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="Juan García"
                    value={form.full_name}
                    onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                  />
                </div>

                {/* Email — only on create */}
                {!editing && (
                  <div>
                    <label className="label">Correo electrónico *</label>
                    <input
                      className="input-field"
                      type="email"
                      placeholder="juan@ejemplo.com"
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                )}

                {/* Password — only on create */}
                {!editing && (
                  <div>
                    <label className="label">Contraseña * (mín. 8 caracteres)</label>
                    <div className="relative">
                      <input
                        className="input-field pr-10"
                        type={showPass ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={form.password}
                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(p => !p)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                      >
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Role selector */}
                <div>
                  <label className="label">Rol *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.entries(ROLES) as [RoleKey, typeof ROLES[RoleKey]][]).map(([key, r]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setForm(p => ({ ...p, role: key }))}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition ${
                          form.role === key
                            ? `border-current ${r.bg} ${r.color}`
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <span className={form.role === key ? r.color : 'text-gray-400'}>{r.icon}</span>
                        <span className="text-xs font-medium leading-tight text-center">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    {error}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                    Cancelar
                  </button>
                  <button type="submit" disabled={pending} className="btn-primary flex-1">
                    {pending ? 'Guardando…' : editing ? 'Guardar' : 'Crear usuario'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
