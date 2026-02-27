/**
 * Guardian (Padres/Acudientes) management page with CRUD operations
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { familyAPI, guardianAPI, Guardian, CreateGuardianRequest } from '../lib/supabaseApi';
import { 
  UserCheck, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Phone, 
  Mail, 
  Home,
  MapPin,
  MessageCircle,
  Search,
  Briefcase
} from 'lucide-react';

const RELATIONSHIP_TYPES = [
  { value: 'padre', label: 'Padre' },
  { value: 'madre', label: 'Madre' },
  { value: 'abuelo', label: 'Abuelo/a' },
  { value: 'abuela', label: 'Abuela' },
  { value: 'tio', label: 'Tío/a' },
  { value: 'hermano', label: 'Hermano/a' },
  { value: 'tutor', label: 'Tutor legal' },
  { value: 'otro', label: 'Otro' },
];

export default function Guardians() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<Guardian | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<Partial<CreateGuardianRequest>>({
    first_name: '',
    last_name: '',
    document_type: '',
    document_number: '',
    phone_home: '',
    phone_mobile: '',
    whatsapp_phone: '',
    has_whatsapp: false,
    whatsapp_note: '',
    email: '',
    address: '',
    occupation: '',
  });

  // Fetch guardians
  const { data, isLoading } = useQuery({
    queryKey: ['guardians', searchTerm],
    queryFn: async () => {
      const { data } = await guardianAPI.getAll(searchTerm || undefined);
      return data;
    },
  });

  // Create guardian mutation
  const createMutation = useMutation({
    mutationFn: (guardian: CreateGuardianRequest) => guardianAPI.create(guardian),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardians'] });
      closeModal();
      alert('Acudiente creado exitosamente');
    },
    onError: (error: any) => {
      alert('Error al crear acudiente: ' + (error.message || 'Error desconocido'));
    },
  });

  // Update guardian mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateGuardianRequest> }) =>
      guardianAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardians'] });
      closeModal();
      alert('Acudiente actualizado exitosamente');
    },
    onError: (error: any) => {
      alert('Error al actualizar acudiente: ' + (error.message || 'Error desconocido'));
    },
  });

  // Delete guardian mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      // guardianAPI no tiene delete, usamos update para desactivar
      return guardianAPI.update(id, { is_active: false } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardians'] });
      alert('Acudiente eliminado exitosamente');
    },
    onError: (error: any) => {
      alert('Error al eliminar acudiente: ' + (error.message || 'Error desconocido'));
    },
  });

  const openCreateModal = () => {
    setEditingGuardian(null);
    setFormData({
      first_name: '',
      last_name: '',
      document_type: '',
      document_number: '',
      phone_home: '',
      phone_mobile: '',
      whatsapp_phone: '',
      has_whatsapp: false,
      whatsapp_note: '',
      email: '',
      address: '',
      occupation: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (guardian: Guardian) => {
    setEditingGuardian(guardian);
    setFormData({
      first_name: guardian.first_name || '',
      last_name: guardian.last_name || '',
      document_type: guardian.document_type || '',
      document_number: guardian.document_number || '',
      phone_home: guardian.phone_home || '',
      phone_mobile: guardian.phone_mobile || '',
      whatsapp_phone: guardian.whatsapp_phone || '',
      has_whatsapp: guardian.has_whatsapp || false,
      whatsapp_note: guardian.whatsapp_note || '',
      email: guardian.email || '',
      address: guardian.address || '',
      occupation: guardian.occupation || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGuardian(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingGuardian) {
      updateMutation.mutate({ id: editingGuardian.id, data: formData });
    } else {
      createMutation.mutate(formData as CreateGuardianRequest);
    }
  };

  const handleDelete = (guardian: Guardian) => {
    if (window.confirm(`¿Está seguro de eliminar a "${guardian.full_name}"?`)) {
      deleteMutation.mutate(guardian.id);
    }
  };

  const guardians = data || [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="page-header">
          <div className="relative">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <UserCheck className="w-8 h-8" />
              Gestión de Padres y Acudientes
            </h1>
            <p className="text-blue-100">
              Administra padres, madres y acudientes de los estudiantes
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
                placeholder="Buscar por nombre o documento..."
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
              Nuevo Acudiente
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Acudientes</p>
                <p className="text-2xl font-bold text-gray-900">{guardians.length}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Con WhatsApp</p>
                <p className="text-2xl font-bold text-gray-900">
                  {guardians.filter(g => g.has_whatsapp).length}
                </p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Phone className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Con Teléfono Móvil</p>
                <p className="text-2xl font-bold text-gray-900">
                  {guardians.filter(g => g.phone_mobile).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Guardians Table */}
        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Cargando acudientes...</p>
            </div>
          ) : guardians.length === 0 ? (
            <div className="p-12 text-center">
              <UserCheck className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay acudientes registrados
              </h3>
              <p className="text-gray-600 mb-6">
                Comienza agregando padres o acudientes al sistema
              </p>
              <button
                onClick={openCreateModal}
                className="btn-primary"
              >
                <Plus className="w-5 h-5" />
                Agregar Acudiente
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
                      Documento
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Teléfonos
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      WhatsApp
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {guardians.map((guardian: Guardian) => (
                    <tr key={guardian.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {guardian.first_name?.[0]}{guardian.last_name?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {guardian.full_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {guardian.occupation || 'Sin ocupación'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {guardian.document_type && guardian.document_number 
                          ? `${guardian.document_type} ${guardian.document_number}` 
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="space-y-1">
                          {guardian.phone_mobile && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span>{guardian.phone_mobile}</span>
                            </div>
                          )}
                          {guardian.phone_home && (
                            <div className="flex items-center gap-1">
                              <Home className="w-3 h-3 text-gray-400" />
                              <span>{guardian.phone_home}</span>
                            </div>
                          )}
                          {!guardian.phone_mobile && !guardian.phone_home && (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {guardian.has_whatsapp ? (
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-700">
                              {guardian.whatsapp_phone || guardian.phone_mobile}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {guardian.email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(guardian)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(guardian)}
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
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingGuardian ? 'Editar Acudiente' : 'Nuevo Acudiente'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Nombres */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="input-field"
                    placeholder="Nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="input-field"
                    placeholder="Apellido"
                  />
                </div>
              </div>

              {/* Documento */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo Documento
                  </label>
                  <select
                    value={formData.document_type}
                    onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Seleccionar</option>
                    <option value="CC">CC</option>
                    <option value="CE">CE</option>
                    <option value="PAS">PAS</option>
                    <option value="RC">RC</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número Documento
                  </label>
                  <input
                    type="text"
                    value={formData.document_number}
                    onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                    className="input-field"
                    placeholder="Número de documento"
                  />
                </div>
              </div>

              {/* Teléfonos */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Información de Contacto
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono Fijo (Casa)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone_home}
                      onChange={(e) => setFormData({ ...formData, phone_home: e.target.value })}
                      className="input-field"
                      placeholder="01 234 5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono Móvil
                    </label>
                    <input
                      type="tel"
                      value={formData.phone_mobile}
                      onChange={(e) => setFormData({ ...formData, phone_mobile: e.target.value })}
                      className="input-field"
                      placeholder="300 123 4567"
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  <h3 className="text-sm font-semibold text-gray-900">WhatsApp</h3>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.has_whatsapp}
                      onChange={(e) => setFormData({ ...formData, has_whatsapp: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">¿Tiene WhatsApp?</span>
                  </label>
                  
                  {formData.has_whatsapp && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Teléfono de WhatsApp (si es diferente)
                        </label>
                        <input
                          type="tel"
                          value={formData.whatsapp_phone}
                          onChange={(e) => setFormData({ ...formData, whatsapp_phone: e.target.value })}
                          className="input-field"
                          placeholder="300 123 4567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notas de WhatsApp
                        </label>
                        <input
                          type="text"
                          value={formData.whatsapp_note}
                          onChange={(e) => setFormData({ ...formData, whatsapp_note: e.target.value })}
                          className="input-field"
                          placeholder="Ej: Prefiere mensajes por la mañana"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Email y Ocupación */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    placeholder="email@ejemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ocupación
                  </label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="input-field"
                    placeholder="Ocupación"
                  />
                </div>
              </div>

              {/* Dirección */}
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

              {/* Botones */}
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
                  {editingGuardian ? 'Actualizar' : 'Crear'} Acudiente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
