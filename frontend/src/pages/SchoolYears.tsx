import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Calendar, CheckCircle2, X } from 'lucide-react';
import Layout from '../components/Layout';
import { schoolYearAPI, type SchoolYear, type CreateSchoolYearRequest, type UpdateSchoolYearRequest } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export default function SchoolYears() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const campusId = user?.campuses?.[0]?.id || '';

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<SchoolYear | null>(null);

  // Fetch school years
  const { data: schoolYears = [], isLoading } = useQuery({
    queryKey: ['school-years', campusId],
    queryFn: async () => {
      const response = await schoolYearAPI.list(campusId);
      return response.data.data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: schoolYearAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-years'] });
      setShowCreateModal(false);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Error al crear año escolar');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSchoolYearRequest }) =>
      schoolYearAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-years'] });
      setShowEditModal(false);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Error al actualizar año escolar');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: schoolYearAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-years'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Error al eliminar año escolar');
    },
  });

  // Set current mutation
  const setCurrentMutation = useMutation({
    mutationFn: schoolYearAPI.setCurrent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-years'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Error al marcar año como actual');
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este año escolar?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSetCurrent = (id: string) => {
    if (window.confirm('¿Marcar este año como actual?')) {
      setCurrentMutation.mutate(id);
    }
  };

  const openEditModal = (schoolYear: SchoolYear) => {
    setSelectedSchoolYear(schoolYear);
    setShowEditModal(true);
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Años Escolares</h1>
            <p className="text-gray-600 mt-1">Gestión de años académicos</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus size={20} />
            Nuevo Año Escolar
          </button>
        </div>

        {/* School Years Grid */}
        {isLoading ? (
          <div className="text-center py-12">Cargando...</div>
        ) : schoolYears.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No hay años escolares registrados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schoolYears.map((schoolYear) => (
              <div
                key={schoolYear.id}
                className={`bg-white rounded-lg shadow p-6 border-2 ${
                  schoolYear.is_current ? 'border-green-500' : 'border-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{schoolYear.name}</h3>
                  {schoolYear.is_current && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      <CheckCircle2 size={14} />
                      Actual
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    <span>Inicio: {new Date(schoolYear.start_date).toLocaleDateString('es-CO')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    <span>Fin: {new Date(schoolYear.end_date).toLocaleDateString('es-CO')}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  {!schoolYear.is_current && (
                    <button
                      onClick={() => handleSetCurrent(schoolYear.id)}
                      className="flex-1 px-3 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 text-sm"
                    >
                      Marcar Actual
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(schoolYear)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(schoolYear.id)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <CreateSchoolYearModal
            campusId={campusId}
            onClose={() => setShowCreateModal(false)}
            onSubmit={(data) => createMutation.mutate(data)}
          />
        )}

        {/* Edit Modal */}
        {showEditModal && selectedSchoolYear && (
          <EditSchoolYearModal
            schoolYear={selectedSchoolYear}
            onClose={() => setShowEditModal(false)}
            onSubmit={(data) => updateMutation.mutate({ id: selectedSchoolYear.id, data })}
          />
        )}
      </div>
    </Layout>
  );
}

// CreateSchoolYearModal component
function CreateSchoolYearModal({
  campusId,
  onClose,
  onSubmit,
}: {
  campusId: string;
  onClose: () => void;
  onSubmit: (data: CreateSchoolYearRequest) => void;
}) {
  const [formData, setFormData] = useState<CreateSchoolYearRequest>({
    campus_id: campusId,
    name: '',
    start_date: '',
    end_date: '',
    is_current: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Nuevo Año Escolar</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Año Escolar *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Ej: 2024-2025"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Inicio *
            </label>
            <input
              type="date"
              required
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Fin *
            </label>
            <input
              type="date"
              required
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_current"
              checked={formData.is_current}
              onChange={(e) => setFormData({ ...formData, is_current: e.target.checked })}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="is_current" className="ml-2 text-sm text-gray-700">
              Marcar como año actual
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// EditSchoolYearModal component
function EditSchoolYearModal({
  schoolYear,
  onClose,
  onSubmit,
}: {
  schoolYear: SchoolYear;
  onClose: () => void;
  onSubmit: (data: UpdateSchoolYearRequest) => void;
}) {
  const [formData, setFormData] = useState<UpdateSchoolYearRequest>({
    name: schoolYear.name,
    start_date: schoolYear.start_date,
    end_date: schoolYear.end_date,
    is_current: schoolYear.is_current,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Editar Año Escolar</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Año Escolar
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Inicio
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Fin
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="edit_is_current"
              checked={formData.is_current}
              onChange={(e) => setFormData({ ...formData, is_current: e.target.checked })}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="edit_is_current" className="ml-2 text-sm text-gray-700">
              Marcar como año actual
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
