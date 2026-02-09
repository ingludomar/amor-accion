/**
 * Campus management page with CRUD operations
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { campusAPI, Campus, CreateCampusRequest } from '../lib/api';
import { Building2, Plus, Pencil, Trash2, X, MapPin, Phone, Mail, Home, ChevronRight } from 'lucide-react';

export default function Campuses() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampus, setEditingCampus] = useState<Campus | null>(null);
  const [formData, setFormData] = useState<CreateCampusRequest>({
    name: '',
    code: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    is_active: true,
    logo_url: '',
  });

  // Fetch campuses
  const { data, isLoading, error } = useQuery({
    queryKey: ['campuses'],
    queryFn: async () => {
      const response = await campusAPI.getAll();
      return response.data.data;
    },
  });

  // Create campus mutation
  const createMutation = useMutation({
    mutationFn: campusAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campuses'] });
      closeModal();
    },
  });

  // Update campus mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      campusAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campuses'] });
      closeModal();
    },
  });

  // Delete campus mutation
  const deleteMutation = useMutation({
    mutationFn: campusAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campuses'] });
    },
  });

  const openCreateModal = () => {
    setEditingCampus(null);
    setFormData({
      name: '',
      code: '',
      address: '',
      city: '',
      phone: '',
      email: '',
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (campus: Campus) => {
    setEditingCampus(campus);
    setFormData({
      name: campus.name,
      code: campus.code,
      address: '',
      city: campus.city || '',
      phone: '',
      email: '',
      is_active: campus.is_active,
      logo_url: campus.logo_url || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCampus(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCampus) {
      updateMutation.mutate({
        id: editingCampus.id,
        data: {
          name: formData.name,
          city: formData.city,
          is_active: formData.is_active,
          logo_url: formData.logo_url,
        },
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta sede?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error al cargar las sedes</p>
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
          <span className="text-gray-900 font-medium">Sedes</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Sedes</h2>
            <p className="text-gray-600 mt-1">
              Administra los campus de tu institución
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            <Plus className="w-5 h-5" />
            Nueva Sede
          </button>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-4 rounded-lg">
              <Building2 className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Sedes</p>
              <p className="text-3xl font-bold text-gray-900">{data?.total || 0}</p>
            </div>
          </div>
        </div>

        {/* Campuses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.items.map((campus) => (
            <div
              key={campus.id}
              className="bg-white rounded-lg shadow-sm border-2 border-gray-100 hover:border-indigo-200 transition p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <Building2 className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{campus.name}</h3>
                    <p className="text-sm text-gray-500">{campus.code}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    campus.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {campus.is_active ? 'Activa' : 'Inactiva'}
                </span>
              </div>

              {campus.city && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  {campus.city}
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openEditModal(campus)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                >
                  <Pencil className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(campus.id)}
                  className="flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {data?.items.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay sedes registradas
            </h3>
            <p className="text-gray-600 mb-6">
              Comienza agregando tu primera sede
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              <Plus className="w-5 h-5" />
              Nueva Sede
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCampus ? 'Editar Sede' : 'Nueva Sede'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Sede *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ej: Sede Principal"
                />
              </div>

              {!editingCampus && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ej: PRINCIPAL"
                  />
                </div>
              )}

              {!editingCampus && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ej: Calle 100 #15-20"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ej: Bogotá"
                />
              </div>

              {!editingCampus && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Ej: 3001234567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Ej: sede@colegio.edu"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL del Logo de la Sede
                </label>
                <input
                  type="url"
                  value={formData.logo_url || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, logo_url: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="https://ejemplo.com/logo.png"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pega aquí la URL de la imagen del logo (Imgur, Google Drive, etc.)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Sede activa
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Guardando...'
                    : editingCampus
                    ? 'Actualizar'
                    : 'Crear Sede'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
