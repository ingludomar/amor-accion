/**
 * User management page with CRUD operations
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { userAPI, campusAPI, UserDetail, CreateUserRequest, UpdateUserRequest, Role, Campus } from '../lib/api';
import { Users as UsersIcon, Plus, Pencil, Trash2, X, Mail, Phone, Shield, AlertCircle, CheckCircle, Home, ChevronRight } from 'lucide-react';

export default function Users() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDetail | null>(null);
  const [formData, setFormData] = useState<CreateUserRequest>({
    email: '',
    username: '',
    password: '',
    full_name: '',
    document_type: 'CC',
    document_number: '',
    phone: '',
    role_ids: [],
    campus_ids: [],
    is_teacher: false,
    teacher_code: '',
  });

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({
    username: '',
    password: '',
    roles: '',
    campuses: '',
  });

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await userAPI.getAll();
      return response.data.data;
    },
  });

  // Fetch roles
  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await userAPI.getRoles();
      return response.data.data.items as Role[];
    },
  });

  // Fetch campuses
  const { data: campusesData } = useQuery({
    queryKey: ['campuses'],
    queryFn: async () => {
      const response = await campusAPI.getAll();
      return response.data.data.items as Campus[];
    },
  });

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: userAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeModal();
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      userAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeModal();
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: userAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      username: '',
      password: '',
      full_name: '',
      document_type: 'CC',
      document_number: '',
      phone: '',
      role_ids: [],
      campus_ids: [],
      is_teacher: false,
      teacher_code: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserDetail) => {
    setEditingUser(user);
    const roleIds = rolesData?.filter(r => user.roles.includes(r.name)).map(r => r.id) || [];
    const campusIds = user.campuses.map(c => c.id);

    setFormData({
      email: user.email,
      username: user.username,
      password: '', // Don't show password in edit mode
      full_name: user.full_name,
      document_type: user.document_type || 'CC',
      document_number: user.document_number || '',
      phone: user.phone || '',
      role_ids: roleIds,
      campus_ids: campusIds,
      is_teacher: user.is_teacher,
      teacher_code: user.teacher_code || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setValidationErrors({
      username: '',
      password: '',
      roles: '',
      campuses: '',
    });
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const errors = {
      username: '',
      password: '',
      roles: '',
      campuses: '',
    };

    let isValid = true;

    // Validate username (only for new users)
    if (!editingUser) {
      if (formData.username.length < 3) {
        errors.username = 'El usuario debe tener al menos 3 caracteres';
        isValid = false;
      }

      // Validate password
      if (formData.password.length < 8) {
        errors.password = 'La contraseña debe tener al menos 8 caracteres';
        isValid = false;
      }
    }

    // Validate roles
    if (formData.role_ids.length === 0) {
      errors.roles = 'Debe seleccionar al menos un rol';
      isValid = false;
    }

    // Validate campuses
    if (formData.campus_ids.length === 0) {
      errors.campuses = 'Debe seleccionar al menos una sede';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    if (editingUser) {
      // Update user (exclude email, username, password)
      const updateData: UpdateUserRequest = {
        full_name: formData.full_name,
        document_type: formData.document_type,
        document_number: formData.document_number,
        phone: formData.phone,
        is_active: true,
        role_ids: formData.role_ids,
        campus_ids: formData.campus_ids,
      };
      updateMutation.mutate({ id: editingUser.id, data: updateData });
    } else {
      // Create new user
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (userId: string) => {
    if (window.confirm('¿Está seguro de desactivar este usuario?')) {
      deleteMutation.mutate(userId);
    }
  };

  const handleRoleToggle = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      role_ids: prev.role_ids.includes(roleId)
        ? prev.role_ids.filter(id => id !== roleId)
        : [...prev.role_ids, roleId]
    }));
  };

  const handleCampusToggle = (campusId: string) => {
    setFormData(prev => ({
      ...prev,
      campus_ids: prev.campus_ids.includes(campusId)
        ? prev.campus_ids.filter(id => id !== campusId)
        : [...prev.campus_ids, campusId]
    }));
  };

  if (usersLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Cargando usuarios...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 hover:text-blue-600 transition"
          >
            <Home size={16} />
            Dashboard
          </button>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="text-gray-900 font-medium">Usuarios</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-gray-600 mt-1">
              Administra usuarios, roles y permisos del sistema
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5" />
            Nuevo Usuario
          </button>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sedes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usersData?.items.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-indigo-100 p-2 rounded-lg">
                        <UsersIcon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.full_name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {user.phone}
                          </div>
                        )}
                        {user.is_teacher && (
                          <div className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded mt-1 inline-block">
                            Profesor {user.teacher_code && `- ${user.teacher_code}`}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700"
                        >
                          <Shield className="w-3 h-3" />
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.campuses.map((campus) => (
                        <span
                          key={campus.id}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
                        >
                          {campus.name}
                          {campus.is_primary && ' ⭐'}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        user.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Editar"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Desactivar"
                      disabled={user.is_superuser}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {!editingUser && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                    <p className="text-sm text-blue-800 font-medium mb-1">Requisitos:</p>
                    <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                      <li>Usuario: mínimo 3 caracteres</li>
                      <li>Contraseña: mínimo 8 caracteres</li>
                      <li>Seleccionar al menos 1 rol</li>
                      <li>Seleccionar al menos 1 sede</li>
                    </ul>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    {!editingUser && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Usuario * (mínimo 3 caracteres)
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              minLength={3}
                              value={formData.username}
                              onChange={(e) => {
                                setFormData({ ...formData, username: e.target.value });
                                if (e.target.value.length >= 3) {
                                  setValidationErrors({ ...validationErrors, username: '' });
                                }
                              }}
                              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                                validationErrors.username || (formData.username && formData.username.length > 0 && formData.username.length < 3)
                                  ? 'border-red-500 bg-red-50'
                                  : formData.username.length >= 3
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-300'
                              }`}
                            />
                            {formData.username && (
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                {formData.username.length >= 3 ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                  <AlertCircle className="w-5 h-5 text-red-600" />
                                )}
                              </div>
                            )}
                          </div>
                          {(validationErrors.username || (formData.username && formData.username.length > 0 && formData.username.length < 3)) && (
                            <div className="flex items-center gap-1 mt-1 text-red-600 text-xs bg-red-50 p-2 rounded">
                              <AlertCircle className="w-3 h-3" />
                              <span className="font-medium">Error:</span> El usuario debe tener al menos 3 caracteres
                            </div>
                          )}
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contraseña * (mínimo 8 caracteres)
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              required
                              minLength={8}
                              value={formData.password}
                              onChange={(e) => {
                                setFormData({ ...formData, password: e.target.value });
                                if (e.target.value.length >= 8) {
                                  setValidationErrors({ ...validationErrors, password: '' });
                                }
                              }}
                              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                                validationErrors.password || (formData.password && formData.password.length > 0 && formData.password.length < 8)
                                  ? 'border-red-500 bg-red-50'
                                  : formData.password.length >= 8
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-300'
                              }`}
                            />
                            {formData.password && (
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                {formData.password.length >= 8 ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                  <AlertCircle className="w-5 h-5 text-red-600" />
                                )}
                              </div>
                            )}
                          </div>
                          {(validationErrors.password || (formData.password && formData.password.length > 0 && formData.password.length < 8)) && (
                            <div className="flex items-center gap-1 mt-1 text-red-600 text-xs bg-red-50 p-2 rounded">
                              <AlertCircle className="w-3 h-3" />
                              <span className="font-medium">Error:</span> La contraseña debe tener al menos 8 caracteres
                            </div>
                          )}
                          {formData.password.length >= 8 && (
                            <div className="flex items-center gap-1 mt-1 text-green-600 text-xs bg-green-50 p-2 rounded">
                              <CheckCircle className="w-3 h-3" />
                              <span className="font-medium">Válido:</span> Contraseña cumple con los requisitos
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Documento
                      </label>
                      <select
                        value={formData.document_type}
                        onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="CC">Cédula de Ciudadanía</option>
                        <option value="TI">Tarjeta de Identidad</option>
                        <option value="CE">Cédula de Extranjería</option>
                        <option value="PP">Pasaporte</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número de Documento
                      </label>
                      <input
                        type="text"
                        value={formData.document_number}
                        onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Roles */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Roles * (selecciona al menos uno)
                    </label>
                    {formData.role_ids.length === 0 ? (
                      <div className="flex items-center gap-2 mb-2 text-red-600 text-xs bg-red-50 p-3 rounded-lg border border-red-200">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <div>
                          <span className="font-bold">Error:</span> Debes seleccionar al menos un rol para continuar
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-2 text-green-600 text-xs bg-green-50 p-3 rounded-lg border border-green-200">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        <div>
                          <span className="font-bold">Válido:</span> {formData.role_ids.length} rol(es) seleccionado(s)
                        </div>
                      </div>
                    )}
                    <div className={`grid grid-cols-2 gap-2 p-3 rounded-lg border-2 ${
                      formData.role_ids.length === 0 ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'
                    }`}>
                      {rolesData?.map((role) => (
                        <label key={role.id} className="flex items-start gap-2 p-3 border rounded-lg cursor-pointer hover:bg-white bg-white">
                          <input
                            type="checkbox"
                            checked={formData.role_ids.includes(role.id)}
                            onChange={() => {
                              handleRoleToggle(role.id);
                              setValidationErrors({ ...validationErrors, roles: '' });
                            }}
                            className="mt-1"
                          />
                          <div>
                            <div className="font-medium text-sm">{role.name}</div>
                            <div className="text-xs text-gray-500">{role.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Campuses */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sedes * (selecciona al menos una)
                    </label>
                    {formData.campus_ids.length === 0 ? (
                      <div className="flex items-center gap-2 mb-2 text-red-600 text-xs bg-red-50 p-3 rounded-lg border border-red-200">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <div>
                          <span className="font-bold">Error:</span> Debes seleccionar al menos una sede para continuar
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-2 text-green-600 text-xs bg-green-50 p-3 rounded-lg border border-green-200">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        <div>
                          <span className="font-bold">Válido:</span> {formData.campus_ids.length} sede(s) seleccionada(s)
                        </div>
                      </div>
                    )}
                    <div className={`grid grid-cols-2 gap-2 p-3 rounded-lg border-2 ${
                      formData.campus_ids.length === 0 ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'
                    }`}>
                      {campusesData?.map((campus) => (
                        <label key={campus.id} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-white bg-white">
                          <input
                            type="checkbox"
                            checked={formData.campus_ids.includes(campus.id)}
                            onChange={() => {
                              handleCampusToggle(campus.id);
                              setValidationErrors({ ...validationErrors, campuses: '' });
                            }}
                          />
                          <div>
                            <div className="font-medium text-sm">{campus.name}</div>
                            <div className="text-xs text-gray-500">{campus.code}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Teacher Info */}
                  <div className="border-t pt-4">
                    <label className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={formData.is_teacher}
                        onChange={(e) => setFormData({ ...formData, is_teacher: e.target.checked })}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Este usuario es profesor
                      </span>
                    </label>

                    {formData.is_teacher && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Código de Profesor
                        </label>
                        <input
                          type="text"
                          value={formData.teacher_code}
                          onChange={(e) => setFormData({ ...formData, teacher_code: e.target.value })}
                          placeholder="Ej: PROF-001"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                      {editingUser ? 'Actualizar' : 'Crear'} Usuario
                    </button>
                  </div>

                  {/* Error Messages */}
                  {(createMutation.isError || updateMutation.isError) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="text-red-800 font-medium mb-2">Error al guardar usuario</h4>
                      <div className="text-red-600 text-sm">
                        {(() => {
                          const error = (createMutation.error || updateMutation.error) as any;
                          const responseData = error?.response?.data;

                          // Handle Pydantic validation errors
                          if (responseData?.detail && Array.isArray(responseData.detail)) {
                            return (
                              <ul className="list-disc list-inside space-y-1">
                                {responseData.detail.map((err: any, idx: number) => (
                                  <li key={idx}>
                                    <strong>{err.loc?.join(' → ') || 'Campo'}:</strong> {err.msg}
                                  </li>
                                ))}
                              </ul>
                            );
                          }

                          // Handle simple error message
                          if (responseData?.message) {
                            return <p>{responseData.message}</p>;
                          }

                          if (typeof responseData?.detail === 'string') {
                            return <p>{responseData.detail}</p>;
                          }

                          return <p>Ocurrió un error al procesar la solicitud. Verifica los datos ingresados.</p>;
                        })()}
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
