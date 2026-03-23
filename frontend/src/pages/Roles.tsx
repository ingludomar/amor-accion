import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';
import { usePermission } from '../hooks/usePermission';
import { ShieldCheck, Plus, Save, Trash2 } from 'lucide-react';

// ============================================
// TIPOS
// ============================================

interface Role {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface RolePermission {
  id?: string;
  role_name: string;
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

// ============================================
// MÓDULOS Y ETIQUETAS
// ============================================

const MODULES = [
  { key: 'dashboard',  label: 'Dashboard' },
  { key: 'campuses',   label: 'Sedes' },
  { key: 'users',      label: 'Usuarios' },
  { key: 'students',   label: 'Estudiantes' },
  { key: 'groups',     label: 'Grupos' },
  { key: 'topics',     label: 'Temas' },
  { key: 'attendance', label: 'Asistencia' },
  { key: 'reports',    label: 'Reportes' },
  { key: 'settings',   label: 'Configuración' },
  { key: 'roles',      label: 'Roles' },
];

const ACTIONS: { key: keyof Omit<RolePermission, 'id' | 'role_name' | 'module'>; label: string }[] = [
  { key: 'can_view',   label: 'Ver' },
  { key: 'can_create', label: 'Crear' },
  { key: 'can_edit',   label: 'Editar' },
  { key: 'can_delete', label: 'Eliminar' },
];

// ============================================
// HELPERS API
// ============================================

async function fetchRoles(): Promise<Role[]> {
  const { data, error } = await supabase.from('roles').select('*').order('name');
  if (error) throw error;
  return data || [];
}

async function fetchPermissions(roleName: string): Promise<RolePermission[]> {
  const { data, error } = await supabase
    .from('role_permissions')
    .select('*')
    .eq('role_name', roleName);
  if (error) throw error;
  return data || [];
}

function buildPermissionMatrix(roleName: string, existing: RolePermission[]): RolePermission[] {
  return MODULES.map(m => {
    const found = existing.find(p => p.module === m.key);
    return found || {
      role_name: roleName,
      module: m.key,
      can_view: false,
      can_create: false,
      can_edit: false,
      can_delete: false,
    };
  });
}

// ============================================
// COMPONENTE
// ============================================

export default function Roles() {
  const qc = useQueryClient();
  const { canCreate, canEdit, canDelete } = usePermission('roles');

  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [matrix, setMatrix] = useState<RolePermission[]>([]);
  const [showNewRoleForm, setShowNewRoleForm] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  // Cargar roles
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
  });

  // Cargar permisos del rol seleccionado
  const { isLoading: loadingPerms } = useQuery({
    queryKey: ['role_permissions', selectedRole],
    queryFn: () => fetchPermissions(selectedRole!),
    enabled: !!selectedRole,
    onSuccess: (data) => {
      setMatrix(buildPermissionMatrix(selectedRole!, data));
    },
  });

  // Guardar permisos
  const saveMutation = useMutation({
    mutationFn: async (perms: RolePermission[]) => {
      for (const perm of perms) {
        const { error } = await supabase
          .from('role_permissions')
          .upsert(
            { role_name: perm.role_name, module: perm.module, can_view: perm.can_view, can_create: perm.can_create, can_edit: perm.can_edit, can_delete: perm.can_delete },
            { onConflict: 'role_name,module' }
          );
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['role_permissions', selectedRole] });
    },
  });

  // Crear rol nuevo
  const createRoleMutation = useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      const { error } = await supabase.from('roles').insert({ name: name.toLowerCase().trim(), description });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] });
      setShowNewRoleForm(false);
      setNewRoleName('');
      setNewRoleDesc('');
    },
  });

  // Eliminar rol
  const deleteRoleMutation = useMutation({
    mutationFn: async (roleName: string) => {
      await supabase.from('role_permissions').delete().eq('role_name', roleName);
      const { error } = await supabase.from('roles').delete().eq('name', roleName);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] });
      setSelectedRole(null);
      setMatrix([]);
    },
  });

  function togglePermission(moduleKey: string, action: keyof Omit<RolePermission, 'id' | 'role_name' | 'module'>) {
    setMatrix(prev =>
      prev.map(p =>
        p.module === moduleKey ? { ...p, [action]: !p[action] } : p
      )
    );
  }

  function handleSelectRole(roleName: string) {
    setSelectedRole(roleName);
    setMatrix([]);
  }

  const SYSTEM_ROLES = ['admin', 'coordinador', 'profesor'];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Roles y Permisos</h1>
              <p className="text-sm text-gray-500">Gestiona qué puede hacer cada rol en el sistema</p>
            </div>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowNewRoleForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" />
              Nuevo Rol
            </button>
          )}
        </div>

        {/* Formulario nuevo rol */}
        {showNewRoleForm && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Crear nuevo rol</h3>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del rol</label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={e => setNewRoleName(e.target.value)}
                  placeholder="ej: supervisor"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input
                  type="text"
                  value={newRoleDesc}
                  onChange={e => setNewRoleDesc(e.target.value)}
                  placeholder="Descripción del rol"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => createRoleMutation.mutate({ name: newRoleName, description: newRoleDesc })}
                disabled={!newRoleName.trim() || createRoleMutation.isPending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                Crear
              </button>
              <button
                onClick={() => setShowNewRoleForm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Lista de roles */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Roles</h3>
            {isLoading ? (
              <p className="text-sm text-gray-500">Cargando...</p>
            ) : (
              <ul className="space-y-1">
                {roles.map(role => (
                  <li key={role.id}>
                    <button
                      onClick={() => handleSelectRole(role.name)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        selectedRole === role.name
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-semibold capitalize">{role.name}</span>
                      {role.description && (
                        <span className="block text-xs text-gray-500 font-normal mt-0.5">{role.description}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Matriz de permisos */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
            {!selectedRole ? (
              <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                Selecciona un rol para ver sus permisos
              </div>
            ) : loadingPerms ? (
              <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                Cargando permisos...
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div>
                    <h3 className="font-semibold text-gray-900 capitalize">{selectedRole}</h3>
                    <p className="text-xs text-gray-500">{roles.find(r => r.name === selectedRole)?.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {canDelete && !SYSTEM_ROLES.includes(selectedRole) && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar el rol "${selectedRole}"?`)) {
                            deleteRoleMutation.mutate(selectedRole);
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    )}
                    {canEdit && (
                      <button
                        onClick={() => saveMutation.mutate(matrix)}
                        disabled={saveMutation.isPending}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
                      >
                        <Save className="w-4 h-4" />
                        {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Módulo</th>
                        {ACTIONS.map(a => (
                          <th key={a.key} className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{a.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {matrix.map(perm => (
                        <tr key={perm.module} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-3 font-medium text-gray-700">
                            {MODULES.find(m => m.key === perm.module)?.label || perm.module}
                          </td>
                          {ACTIONS.map(action => (
                            <td key={action.key} className="text-center px-4 py-3">
                              <input
                                type="checkbox"
                                checked={perm[action.key] as boolean}
                                onChange={() => canEdit && togglePermission(perm.module, action.key)}
                                disabled={!canEdit}
                                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {saveMutation.isSuccess && (
                  <div className="mx-6 mb-4 mt-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                    Permisos guardados correctamente.
                  </div>
                )}
                {saveMutation.isError && (
                  <div className="mx-6 mb-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    Error al guardar. Verifica los permisos en Supabase.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
