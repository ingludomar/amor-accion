/**
 * Family management page with CRUD operations
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { familyAPI, Family, CreateFamilyRequest } from '../lib/supabaseApi';
import { 
  FamilyRestroom, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  Home,
  Users,
  ChevronRight,
  Search
} from 'lucide-react';

export default function Families() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState<Family | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<CreateFamilyRequest>>({
    name: '',
    address: '',
    phone: '',
    is_active: true,
  });

  // Fetch families
  const { data, isLoading, error } = useQuery({
    queryKey: ['families', searchTerm],
    queryFn: async () => {
      const { data } = await familyAPI.getAll(searchTerm || undefined);
      return data;
    },
  });

  // Create family mutation
  const createMutation = useMutation({
    mutationFn: (family: CreateFamilyRequest) => familyAPI.create(family),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
      closeModal();
      alert('Familia creada exitosamente');
    },
    onError: (error: any) => {
      alert('Error al crear familia: ' + (error.message || 'Error desconocido'));
    },
  });

  // Update family mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateFamilyRequest> }) =>
      familyAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
      closeModal();
      alert('Familia actualizada exitosamente');
    },
    onError: (error: any) => {
      alert('Error al actualizar familia: ' + (error.message || 'Error desconocido'));
    },
  });

  // Delete family mutation
  const deleteMutation = useMutation({
    mutationFn: familyAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
      alert('Familia eliminada exitosamente');
    },
    onError: (error: any) => {
      alert('Error al eliminar familia: ' + (error.message || 'Error desconocido'));
    },
  });

  const openCreateModal = () => {
    setEditingFamily(null);
    setFormData({
      name: '',
      address: '',
      phone: '',
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (family: Family) => {
    setEditingFamily(family);
    setFormData({
      name: family.name || '',
      address: family.address || '',
      phone: family.phone || '',
      is_active: family.is_active,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFamily(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingFamily) {
      updateMutation.mutate({ id: editingFamily.id, data: formData });
    } else {
      createMutation.mutate(formData as CreateFamilyRequest);
    }
  };

  const handleDelete = (family: Family) => {
    if (window.confirm(`¿Está seguro de eliminar la familia "${family.name}"?`)) {
      deleteMutation.mutate(family.id);
    }
  };

  const families = data || [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="page-header">
          <div className="relative">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <FamilyRestroom className="w-8 h-8" />
              Gestión de Familias
            </h1>
            <p className="text-blue-100">
              Administra las familias y sus miembros
            </p>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="card p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar familia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <button
              onClick={openCreateModal}
              className="btn-primary whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Nueva Familia
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FamilyRestroom className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Familias</p>
                <p className="text-2xl font-bold text-gray-900">{families.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Families Table */}
        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Cargando familias...</p>
            </div>
          ) : families.length === 0 ? (
            <div className="p-12 text-center">
              <FamilyRestroom className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay familias registradas
              </h3>
              <p className="text-gray-600 mb-6">
                Comienza creando tu primera familia en el sistema
              </p>
              <button
                onClick={openCreateModal}
                className="btn-primary"
              >
                <Plus className="w-5 h-5" />
                Agregar Familia
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Dirección
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {families.map((family: Family) => (
                    <tr key={family.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {(family.name || 'F')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {family.name || 'Familia sin nombre'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {family.students?.length || 0} miembro(s)
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {family.phone || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {family.address || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          family.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {family.is_active ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(family)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(family)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingFamily ? 'Editar Familia' : 'Nueva Familia'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Familia
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Ej: Familia Rodríguez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                  placeholder="300 123 4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-field"
                  placeholder="Dirección de residencia"
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Familia activa
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  <Plus className="w-5 h-5" />
                  {editingFamily ? 'Actualizar' : 'Crear'} Familia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
