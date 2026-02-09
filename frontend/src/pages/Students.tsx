import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  studentAPI,
  campusAPI,
  Student,
  CreateStudentRequest,
  UpdateStudentRequest,
  GuardianCreate,
  GuardianSearchResult,
  Gender,
  RelationshipType
} from '../lib/api';
import { Plus, Search, Edit2, Trash2, X, AlertCircle, CheckCircle, UserPlus, UserMinus, Users as UsersIcon, Home, ChevronRight, CreditCard } from 'lucide-react';
import StudentIDCard from '../components/StudentIDCard';

export default function Students() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampus, setSelectedCampus] = useState<string>('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(true);
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const queryClient = useQueryClient();

  // Fetch students
  const { data: studentsResponse, isLoading } = useQuery({
    queryKey: ['students', page, selectedCampus, isActiveFilter, searchTerm],
    queryFn: async () => {
      const response = await studentAPI.getAll({
        skip: (page - 1) * 10,
        limit: 10,
        campus_id: selectedCampus || undefined,
        is_active: isActiveFilter,
        search: searchTerm || undefined,
      });
      return response.data;
    },
  });

  // Fetch campuses for filter
  const { data: campusesResponse } = useQuery({
    queryKey: ['campuses'],
    queryFn: async () => {
      const response = await campusAPI.getAll({ skip: 0, limit: 100 });
      return response.data;
    },
  });

  // Create student mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateStudentRequest) => studentAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setShowCreateModal(false);
      alert('Estudiante creado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al crear estudiante';
      alert(message);
    },
  });

  // Update student mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStudentRequest }) =>
      studentAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setShowEditModal(false);
      setSelectedStudent(null);
      alert('Estudiante actualizado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al actualizar estudiante';
      alert(message);
    },
  });

  // Delete student mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => studentAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      alert('Estudiante desactivado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al desactivar estudiante';
      alert(message);
    },
  });

  const handleDelete = (student: Student) => {
    if (window.confirm(`¿Está seguro de desactivar al estudiante ${student.full_name}?`)) {
      deleteMutation.mutate(student.id);
    }
  };

  const handleViewDetails = async (student: Student) => {
    try {
      const response = await studentAPI.getById(student.id);
      setSelectedStudent(response.data.data);
      setShowDetailsModal(true);
    } catch (error: any) {
      alert('Error al cargar detalles del estudiante');
    }
  };

  const handleEdit = async (student: Student) => {
    try {
      // Cargar datos completos del estudiante incluyendo acudientes
      const response = await studentAPI.getById(student.id);
      setSelectedStudent(response.data.data);
      setShowEditModal(true);
    } catch (error: any) {
      alert('Error al cargar datos del estudiante');
    }
  };

  const students = studentsResponse?.data?.items || [];
  const totalPages = studentsResponse?.data?.total_pages || 1;

  return (
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
        <span className="text-gray-900 font-medium">Estudiantes</span>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Estudiantes</h1>
          <p className="text-sm text-gray-600 mt-1">Administra los estudiantes del sistema</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Estudiante
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre, código o documento..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sede
            </label>
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las sedes</option>
              {campusesResponse?.data?.items.map((campus) => (
                <option key={campus.id} value={campus.id}>
                  {campus.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={isActiveFilter === undefined ? '' : isActiveFilter ? 'true' : 'false'}
              onChange={(e) => setIsActiveFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No se encontraron estudiantes</div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Edad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sede</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acudientes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.student_code}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer hover:text-blue-600"
                      onClick={() => handleViewDetails(student)}
                    >
                      {student.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.document_number || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.age} años
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.campus_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.guardians?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        student.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(student)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar estudiante"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(student)}
                          className="text-red-600 hover:text-red-800"
                          title="Desactivar estudiante"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Página {page} de {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateStudentModal
          campuses={campusesResponse?.data?.items || []}
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => createMutation.mutate(data)}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedStudent && (
        <EditStudentModal
          student={selectedStudent}
          campuses={campusesResponse?.data?.items || []}
          onClose={() => {
            setShowEditModal(false);
            setSelectedStudent(null);
          }}
          onSubmit={(data) => updateMutation.mutate({ id: selectedStudent.id, data })}
        />
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </div>
  );
}

// Guardian with Relationship Info (for the list)
interface GuardianWithRelationship extends GuardianCreate {
  id?: string;
  existing?: boolean;
}

// Create Student Modal Component
function CreateStudentModal({
  campuses,
  onClose,
  onSubmit,
}: {
  campuses: any[];
  onClose: () => void;
  onSubmit: (data: CreateStudentRequest) => void;
}) {
  const [formData, setFormData] = useState<CreateStudentRequest>({
    first_name: '',
    last_name: '',
    birth_date: '',
    gender: Gender.MALE,
    campus_id: '',
    guardians: [],
  });

  const [guardians, setGuardians] = useState<GuardianWithRelationship[]>([]);
  const [showGuardianSelector, setShowGuardianSelector] = useState(false);

  const [validationErrors, setValidationErrors] = useState({
    first_name: '',
    last_name: '',
    birth_date: '',
    campus_id: '',
  });

  const validateForm = (): boolean => {
    const errors = {
      first_name: '',
      last_name: '',
      birth_date: '',
      campus_id: '',
    };

    if (!formData.first_name || formData.first_name.length < 2) {
      errors.first_name = 'El nombre debe tener al menos 2 caracteres';
    }
    if (!formData.last_name || formData.last_name.length < 2) {
      errors.last_name = 'El apellido debe tener al menos 2 caracteres';
    }
    if (!formData.birth_date) {
      errors.birth_date = 'La fecha de nacimiento es requerida';
    }
    if (!formData.campus_id) {
      errors.campus_id = 'Debe seleccionar una sede';
    }

    setValidationErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Filter out the extra properties before sending
      const cleanGuardians = guardians.map(g => {
        const { id, existing, ...guardianData } = g;
        return guardianData;
      });
      onSubmit({ ...formData, guardians: cleanGuardians });
    }
  };

  const addGuardian = (guardian: GuardianWithRelationship) => {
    setGuardians([...guardians, guardian]);
    setShowGuardianSelector(false);
  };

  const removeGuardian = (index: number) => {
    setGuardians(guardians.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl m-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Crear Estudiante</h2>
            <p className="text-sm text-gray-500 mt-1">Complete el formulario para registrar un nuevo estudiante</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <X size={18} />
              Cerrar
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Validation Requirements */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Campos Requeridos:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Nombres y apellidos (mínimo 2 caracteres cada uno)</li>
              <li>• Fecha de nacimiento</li>
              <li>• Sede</li>
            </ul>
            {guardians.length === 0 && (
              <div className="mt-2 text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded p-2">
                <strong>Nota:</strong> Se recomienda agregar al menos un acudiente. Puede buscarlo si ya existe en el sistema (ej: hermanos) o crear uno nuevo.
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombres *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.first_name
                      ? 'border-red-500 bg-red-50'
                      : formData.first_name.length >= 2
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300'
                  }`}
                />
                {validationErrors.first_name && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <AlertCircle size={20} className="text-red-500" />
                  </div>
                )}
                {formData.first_name.length >= 2 && !validationErrors.first_name && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle size={20} className="text-green-500" />
                  </div>
                )}
              </div>
              {validationErrors.first_name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.first_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellidos *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.last_name
                      ? 'border-red-500 bg-red-50'
                      : formData.last_name.length >= 2
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300'
                  }`}
                />
                {validationErrors.last_name && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <AlertCircle size={20} className="text-red-500" />
                  </div>
                )}
                {formData.last_name.length >= 2 && !validationErrors.last_name && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle size={20} className="text-green-500" />
                  </div>
                )}
              </div>
              {validationErrors.last_name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.last_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Documento
              </label>
              <select
                value={formData.document_type || ''}
                onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar</option>
                <option value="RC">Registro Civil</option>
                <option value="TI">Tarjeta de Identidad</option>
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="PAS">Pasaporte</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Documento
              </label>
              <input
                type="text"
                value={formData.document_number || ''}
                onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Nacimiento *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.birth_date
                      ? 'border-red-500 bg-red-50'
                      : formData.birth_date
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300'
                  }`}
                />
                {validationErrors.birth_date && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <AlertCircle size={20} className="text-red-500" />
                  </div>
                )}
                {formData.birth_date && !validationErrors.birth_date && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle size={20} className="text-green-500" />
                  </div>
                )}
              </div>
              {validationErrors.birth_date && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.birth_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Género *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={Gender.MALE}>Masculino</option>
                <option value={Gender.FEMALE}>Femenino</option>
                <option value={Gender.OTHER}>Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grupo Sanguíneo
              </label>
              <select
                value={formData.blood_type || ''}
                onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sede *
              </label>
              <div className="relative">
                <select
                  value={formData.campus_id}
                  onChange={(e) => setFormData({ ...formData, campus_id: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.campus_id
                      ? 'border-red-500 bg-red-50'
                      : formData.campus_id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar sede</option>
                  {campuses.map((campus) => (
                    <option key={campus.id} value={campus.id}>
                      {campus.name}
                    </option>
                  ))}
                </select>
                {validationErrors.campus_id && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <AlertCircle size={20} className="text-red-500" />
                  </div>
                )}
                {formData.campus_id && !validationErrors.campus_id && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle size={20} className="text-green-500" />
                  </div>
                )}
              </div>
              {validationErrors.campus_id && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.campus_id}</p>
              )}
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alergias
            </label>
            <textarea
              value={formData.allergies || ''}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ingrese alergias conocidas si las hay..."
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de Foto del Estudiante
            </label>
            <input
              type="url"
              value={formData.photo_url || ''}
              onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://ejemplo.com/foto.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Pega aquí la URL de una imagen alojada en internet (Imgur, Google Drive, etc.)
            </p>
          </div>

          {/* Guardians Section */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Acudientes {guardians.length > 0 && `(${guardians.length})`}
              </h3>
              <button
                type="button"
                onClick={() => setShowGuardianSelector(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <UserPlus size={18} />
                Agregar Acudiente
              </button>
            </div>

            {guardians.length > 0 ? (
              <div className="space-y-3">
                {guardians.map((guardian, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${guardian.existing ? 'bg-purple-50 border-purple-200' : 'bg-green-50 border-green-200'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {guardian.first_name} {guardian.last_name}
                          </p>
                          {guardian.existing && (
                            <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full flex items-center gap-1">
                              <UsersIcon size={12} />
                              Existente
                            </span>
                          )}
                          {guardian.is_primary && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Principal
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {guardian.relationship_type}
                          {guardian.phone && ` • ${guardian.phone}`}
                          {guardian.email && ` • ${guardian.email}`}
                        </p>
                        {guardian.document_number && (
                          <p className="text-sm text-gray-500">
                            Doc: {guardian.document_type} {guardian.document_number}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeGuardian(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <UserMinus size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <UsersIcon size={48} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No hay acudientes agregados</p>
                <p className="text-sm text-gray-400 mt-1">Haga clic en "Agregar Acudiente" para buscar uno existente o crear uno nuevo</p>
              </div>
            )}

            {showGuardianSelector && (
              <GuardianSelector
                onSelectExisting={(guardian) => addGuardian({ ...guardian, existing: true })}
                onCreateNew={(guardian) => addGuardian({ ...guardian, existing: false })}
                onCancel={() => setShowGuardianSelector(false)}
                isPrimary={guardians.length === 0}
              />
            )}
          </div>

        </form>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Los campos marcados con * son obligatorios
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                const form = document.querySelector('form');
                if (form) {
                  const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                  form.dispatchEvent(submitEvent);
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              Crear Estudiante
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Guardian Selector Component - Search existing or create new
function GuardianSelector({
  onSelectExisting,
  onCreateNew,
  onCancel,
  isPrimary,
}: {
  onSelectExisting: (guardian: GuardianWithRelationship) => void;
  onCreateNew: (guardian: GuardianCreate) => void;
  onCancel: () => void;
  isPrimary: boolean;
}) {
  const [mode, setMode] = useState<'search' | 'create'>('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<GuardianSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedGuardian, setSelectedGuardian] = useState<GuardianSearchResult | null>(null);

  // Relationship data for selected guardian
  const [relationshipData, setRelationshipData] = useState({
    relationship_type: RelationshipType.ACUDIENTE,
    is_primary: isPrimary,
    is_authorized_pickup: true,
    lives_with: true,
    notes: '',
  });

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      alert('Ingrese un nombre o número de documento para buscar');
      return;
    }

    setIsSearching(true);
    try {
      const response = await studentAPI.searchGuardians({ search: searchTerm });
      setSearchResults(response.data.data.items);
      if (response.data.data.items.length === 0) {
        alert('No se encontraron acudientes. Puede crear uno nuevo.');
      }
    } catch (error) {
      alert('Error al buscar acudientes');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectExisting = () => {
    if (!selectedGuardian) {
      alert('Seleccione un acudiente');
      return;
    }

    onSelectExisting({
      first_name: selectedGuardian.first_name,
      last_name: selectedGuardian.last_name,
      document_type: selectedGuardian.document_type,
      document_number: selectedGuardian.document_number,
      phone: selectedGuardian.phone,
      email: selectedGuardian.email,
      address: selectedGuardian.address,
      occupation: selectedGuardian.occupation,
      ...relationshipData,
      id: selectedGuardian.id,
    });
  };

  return (
    <div className="mt-4 border-2 border-purple-300 rounded-lg p-4 bg-purple-50">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">Agregar Acudiente</h4>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('search')}
            className={`px-3 py-1 rounded-lg text-sm ${mode === 'search' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
          >
            Buscar Existente
          </button>
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`px-3 py-1 rounded-lg text-sm ${mode === 'create' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
          >
            Crear Nuevo
          </button>
        </div>
      </div>

      {mode === 'search' ? (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
            <strong>Tip:</strong> Si el acudiente ya está registrado (ej: hermanos que comparten el mismo acudiente), puede buscarlo aquí por nombre o documento.
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Nombre o número de documento..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {isSearching ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Resultados ({searchResults.length}):</p>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {searchResults.map((guardian) => (
                  <div
                    key={guardian.id}
                    onClick={() => setSelectedGuardian(guardian)}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition ${
                      selectedGuardian?.id === guardian.id
                        ? 'border-purple-600 bg-purple-100'
                        : 'border-gray-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{guardian.full_name}</p>
                        <p className="text-sm text-gray-600">
                          {guardian.document_type} {guardian.document_number}
                        </p>
                        <p className="text-sm text-gray-500">
                          {guardian.phone} • {guardian.email}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {guardian.student_count} estudiante(s)
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {selectedGuardian && (
                <div className="bg-white border border-gray-300 rounded-lg p-4 space-y-3">
                  <h5 className="font-medium text-gray-900">Configurar Relación</h5>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parentesco
                    </label>
                    <select
                      value={relationshipData.relationship_type}
                      onChange={(e) => setRelationshipData({ ...relationshipData, relationship_type: e.target.value as RelationshipType })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value={RelationshipType.PADRE}>Padre</option>
                      <option value={RelationshipType.MADRE}>Madre</option>
                      <option value={RelationshipType.ACUDIENTE}>Acudiente</option>
                      <option value={RelationshipType.OTRO}>Otro</option>
                    </select>
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={relationshipData.is_primary}
                        onChange={(e) => setRelationshipData({ ...relationshipData, is_primary: e.target.checked })}
                        disabled={isPrimary}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Acudiente Principal</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={relationshipData.is_authorized_pickup}
                        onChange={(e) => setRelationshipData({ ...relationshipData, is_authorized_pickup: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Autorizado para recoger</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={relationshipData.lives_with}
                        onChange={(e) => setRelationshipData({ ...relationshipData, lives_with: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Vive con el estudiante</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notas (opcional)
                    </label>
                    <textarea
                      value={relationshipData.notes}
                      onChange={(e) => setRelationshipData({ ...relationshipData, notes: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Información adicional..."
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSelectExisting}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                  >
                    Usar Este Acudiente
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <GuardianCreateForm
          onSubmit={onCreateNew}
          isPrimary={isPrimary}
        />
      )}

      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

// Guardian Create Form Component
function GuardianCreateForm({
  onSubmit,
  isPrimary,
}: {
  onSubmit: (guardian: GuardianCreate) => void;
  isPrimary: boolean;
}) {
  const [formData, setFormData] = useState<GuardianCreate>({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    relationship_type: RelationshipType.ACUDIENTE,
    is_primary: isPrimary,
    is_authorized_pickup: true,
    lives_with: true,
  });

  const handleSubmit = () => {
    if (formData.first_name && formData.last_name && formData.phone) {
      onSubmit(formData);
    } else {
      alert('Por favor complete los campos requeridos: nombres, apellidos y teléfono');
    }
  };

  return (
    <div className="space-y-4 bg-white rounded-lg p-4 border border-gray-300">
      <h5 className="font-medium text-gray-900">Crear Nuevo Acudiente</h5>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombres *
          </label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apellidos *
          </label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Documento
          </label>
          <select
            value={formData.document_type || ''}
            onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">Seleccionar</option>
            <option value="CC">Cédula de Ciudadanía</option>
            <option value="CE">Cédula de Extranjería</option>
            <option value="PAS">Pasaporte</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Documento
          </label>
          <input
            type="text"
            value={formData.document_number || ''}
            onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="Si ingresa documento, el sistema lo reutilizará"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono *
          </label>
          <input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parentesco *
          </label>
          <select
            value={formData.relationship_type}
            onChange={(e) => setFormData({ ...formData, relationship_type: e.target.value as RelationshipType })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value={RelationshipType.PADRE}>Padre</option>
            <option value={RelationshipType.MADRE}>Madre</option>
            <option value={RelationshipType.ACUDIENTE}>Acudiente</option>
            <option value={RelationshipType.OTRO}>Otro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ocupación
          </label>
          <input
            type="text"
            value={formData.occupation || ''}
            onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dirección
        </label>
        <input
          type="text"
          value={formData.address || ''}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="flex gap-4 flex-wrap">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.is_primary}
            onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
            disabled={isPrimary}
            className="rounded"
          />
          <span className="text-sm text-gray-700">Acudiente Principal</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.is_authorized_pickup}
            onChange={(e) => setFormData({ ...formData, is_authorized_pickup: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm text-gray-700">Autorizado para recoger</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.lives_with}
            onChange={(e) => setFormData({ ...formData, lives_with: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm text-gray-700">Vive con el estudiante</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas
        </label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
      >
        Crear y Agregar Acudiente
      </button>
    </div>
  );
}

// Edit Student Modal Component - Con gestión de acudientes
function EditStudentModal({
  student,
  campuses,
  onClose,
  onSubmit,
}: {
  student: Student;
  campuses: any[];
  onClose: () => void;
  onSubmit: (data: UpdateStudentRequest) => void;
}) {
  const [formData, setFormData] = useState<any>({
    first_name: student.first_name,
    last_name: student.last_name,
    document_type: student.document_type,
    document_number: student.document_number,
    birth_date: student.birth_date,
    gender: student.gender as Gender,
    blood_type: student.blood_type,
    allergies: student.allergies,
    email: student.email,
    phone: student.phone,
    address: student.address,
    campus_id: student.campus_id,
    is_active: student.is_active,
  });

  const [guardians, setGuardians] = useState<Guardian[]>(student.guardians || []);
  const [showGuardianSelector, setShowGuardianSelector] = useState(false);
  const [isAddingGuardian, setIsAddingGuardian] = useState(false);
  const [editingGuardianId, setEditingGuardianId] = useState<string | null>(null);
  const [editingGuardianData, setEditingGuardianData] = useState<any>(null);
  const [showIDCard, setShowIDCard] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Asegurar que todos los campos estén incluidos
    const updateData: any = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      document_type: formData.document_type,
      document_number: formData.document_number,
      birth_date: formData.birth_date,
      gender: formData.gender,
      blood_type: formData.blood_type,
      allergies: formData.allergies, // Asegurar que se incluyan las alergias
      email: formData.email,
      phone: formData.phone,
      address: formData.address, // Asegurar que se incluya la dirección
      campus_id: formData.campus_id, // Incluir el campus/sede
      is_active: formData.is_active,
    };

    onSubmit(updateData);
  };

  const handleAddGuardian = async (guardian: GuardianWithRelationship) => {
    setIsAddingGuardian(true);
    try {
      // Preparar datos del acudiente
      const guardianData: any = {
        first_name: guardian.first_name,
        last_name: guardian.last_name,
        relationship_type: guardian.relationship_type,
        is_primary: guardian.is_primary,
        is_authorized_pickup: guardian.is_authorized_pickup !== undefined ? guardian.is_authorized_pickup : true,
        lives_with: guardian.lives_with !== undefined ? guardian.lives_with : true,
      };

      // Agregar campos opcionales solo si existen
      if (guardian.document_type) guardianData.document_type = guardian.document_type;
      if (guardian.document_number) guardianData.document_number = guardian.document_number;
      if (guardian.phone) guardianData.phone = guardian.phone;
      if (guardian.email) guardianData.email = guardian.email;
      if (guardian.address) guardianData.address = guardian.address;
      if (guardian.occupation) guardianData.occupation = guardian.occupation;
      if (guardian.notes) guardianData.notes = guardian.notes;

      await studentAPI.addGuardian(student.id, guardianData);

      // Recargar los datos del estudiante
      const response = await studentAPI.getById(student.id);
      setGuardians(response.data.data.guardians);
      setShowGuardianSelector(false);
      alert('Acudiente agregado exitosamente');
    } catch (error: any) {
      console.error('Error al agregar acudiente:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Error al agregar acudiente';
      alert(errorMessage);
    } finally {
      setIsAddingGuardian(false);
    }
  };

  const handleRemoveGuardian = async (guardianId: string) => {
    if (!confirm('¿Está seguro de eliminar este acudiente del estudiante?')) {
      return;
    }

    try {
      await studentAPI.removeGuardian(student.id, guardianId);
      setGuardians(guardians.filter(g => g.id !== guardianId));
      alert('Acudiente eliminado exitosamente');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al eliminar acudiente');
    }
  };

  const handleEditGuardian = (guardian: Guardian) => {
    setEditingGuardianId(guardian.id);
    setEditingGuardianData({
      first_name: guardian.first_name,
      last_name: guardian.last_name,
      document_type: guardian.document_type || '',
      document_number: guardian.document_number || '',
      phone: guardian.phone || '',
      email: guardian.email || '',
      address: guardian.address || '',
      occupation: guardian.occupation || '',
      relationship_type: guardian.relationship_type,
      is_primary: guardian.is_primary,
      is_authorized_pickup: guardian.is_authorized_pickup !== undefined ? guardian.is_authorized_pickup : true,
      lives_with: guardian.lives_with !== undefined ? guardian.lives_with : true,
      notes: guardian.notes || '',
    });
  };

  const handleSaveGuardianEdit = async () => {
    if (!editingGuardianId || !editingGuardianData) return;

    try {
      // Separar datos del guardian y datos de la relación
      const guardianInfo = {
        first_name: editingGuardianData.first_name,
        last_name: editingGuardianData.last_name,
        document_type: editingGuardianData.document_type,
        document_number: editingGuardianData.document_number,
        phone: editingGuardianData.phone,
        email: editingGuardianData.email,
        address: editingGuardianData.address,
        occupation: editingGuardianData.occupation,
      };

      const relationshipInfo = {
        relationship_type: editingGuardianData.relationship_type,
        is_primary: editingGuardianData.is_primary,
        is_authorized_pickup: editingGuardianData.is_authorized_pickup,
        lives_with: editingGuardianData.lives_with,
        notes: editingGuardianData.notes,
      };

      // Actualizar datos del guardian
      await studentAPI.updateGuardian(editingGuardianId, guardianInfo);

      // Actualizar relación
      await studentAPI.updateGuardianRelationship(student.id, editingGuardianId, relationshipInfo);

      // Recargar datos del estudiante
      const response = await studentAPI.getById(student.id);
      setGuardians(response.data.data.guardians);

      setEditingGuardianId(null);
      setEditingGuardianData(null);
      alert('Acudiente actualizado exitosamente');
    } catch (error: any) {
      console.error('Error al actualizar acudiente:', error);
      alert(error.response?.data?.detail || 'Error al actualizar acudiente');
    }
  };

  const handleCancelGuardianEdit = () => {
    setEditingGuardianId(null);
    setEditingGuardianData(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl m-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Editar Estudiante</h2>
            <p className="text-sm text-gray-500 mt-1">{student.student_code} - {student.full_name}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowIDCard(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <CreditCard size={18} />
              Ver Carnet
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <X size={18} />
              Cerrar
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Personal */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombres
                  </label>
                  <input
                    type="text"
                    value={formData.first_name || ''}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    value={formData.last_name || ''}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sede / Campus
                  </label>
                  <select
                    value={formData.campus_id || ''}
                    onChange={(e) => setFormData({ ...formData, campus_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar Sede</option>
                    {campuses.map((campus) => (
                      <option key={campus.id} value={campus.id}>
                        {campus.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grupo Sanguíneo
                  </label>
                  <select
                    value={formData.blood_type || ''}
                    onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 h-full items-end pb-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Estudiante Activo</span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de Foto del Estudiante
                  </label>
                  <input
                    type="url"
                    value={formData.photo_url || ''}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://ejemplo.com/foto.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Pega aquí la URL de una imagen alojada en internet (Imgur, Google Drive, etc.)
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alergias
                  </label>
                  <textarea
                    value={formData.allergies || ''}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingrese alergias conocidas si las hay..."
                  />
                </div>
              </div>
            </div>

            {/* Gestión de Acudientes */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Acudientes {guardians.length > 0 && `(${guardians.length})`}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowGuardianSelector(true)}
                  disabled={isAddingGuardian}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <UserPlus size={18} />
                  {isAddingGuardian ? 'Agregando...' : 'Agregar Acudiente'}
                </button>
              </div>

              {guardians.length > 0 ? (
                <div className="space-y-3">
                  {guardians.map((guardian) => (
                    <div key={guardian.id} className="border rounded-lg p-4 bg-gray-50">
                      {editingGuardianId === guardian.id ? (
                        // Formulario de edición
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900 mb-3">Editar Acudiente</h4>

                          {/* Información Personal */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Nombres *</label>
                              <input
                                type="text"
                                value={editingGuardianData.first_name}
                                onChange={(e) => setEditingGuardianData({ ...editingGuardianData, first_name: e.target.value })}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Apellidos *</label>
                              <input
                                type="text"
                                value={editingGuardianData.last_name}
                                onChange={(e) => setEditingGuardianData({ ...editingGuardianData, last_name: e.target.value })}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de Documento</label>
                              <select
                                value={editingGuardianData.document_type}
                                onChange={(e) => setEditingGuardianData({ ...editingGuardianData, document_type: e.target.value })}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Seleccionar</option>
                                <option value="CC">Cédula de Ciudadanía</option>
                                <option value="CE">Cédula de Extranjería</option>
                                <option value="TI">Tarjeta de Identidad</option>
                                <option value="Pasaporte">Pasaporte</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Número de Documento</label>
                              <input
                                type="text"
                                value={editingGuardianData.document_number}
                                onChange={(e) => setEditingGuardianData({ ...editingGuardianData, document_number: e.target.value })}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
                              <input
                                type="tel"
                                value={editingGuardianData.phone}
                                onChange={(e) => setEditingGuardianData({ ...editingGuardianData, phone: e.target.value })}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                              <input
                                type="email"
                                value={editingGuardianData.email}
                                onChange={(e) => setEditingGuardianData({ ...editingGuardianData, email: e.target.value })}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Dirección</label>
                              <input
                                type="text"
                                value={editingGuardianData.address}
                                onChange={(e) => setEditingGuardianData({ ...editingGuardianData, address: e.target.value })}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Ocupación</label>
                              <input
                                type="text"
                                value={editingGuardianData.occupation}
                                onChange={(e) => setEditingGuardianData({ ...editingGuardianData, occupation: e.target.value })}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Relación *</label>
                              <select
                                value={editingGuardianData.relationship_type}
                                onChange={(e) => setEditingGuardianData({ ...editingGuardianData, relationship_type: e.target.value })}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                required
                              >
                                <option value="padre">Padre</option>
                                <option value="madre">Madre</option>
                                <option value="acudiente">Acudiente</option>
                                <option value="otro">Otro</option>
                              </select>
                            </div>
                          </div>

                          {/* Opciones de Relación */}
                          <div className="space-y-2 pt-2 border-t">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={editingGuardianData.is_primary}
                                onChange={(e) => setEditingGuardianData({ ...editingGuardianData, is_primary: e.target.checked })}
                                className="rounded"
                              />
                              <span className="text-sm text-gray-700">Acudiente principal</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={editingGuardianData.is_authorized_pickup}
                                onChange={(e) => setEditingGuardianData({ ...editingGuardianData, is_authorized_pickup: e.target.checked })}
                                className="rounded"
                              />
                              <span className="text-sm text-gray-700">Autorizado para recoger</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={editingGuardianData.lives_with}
                                onChange={(e) => setEditingGuardianData({ ...editingGuardianData, lives_with: e.target.checked })}
                                className="rounded"
                              />
                              <span className="text-sm text-gray-700">Vive con el estudiante</span>
                            </label>
                          </div>

                          {/* Notas */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Notas</label>
                            <textarea
                              value={editingGuardianData.notes}
                              onChange={(e) => setEditingGuardianData({ ...editingGuardianData, notes: e.target.value })}
                              rows={2}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {/* Botones */}
                          <div className="flex gap-2 justify-end pt-2">
                            <button
                              type="button"
                              onClick={handleCancelGuardianEdit}
                              className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveGuardianEdit}
                              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Guardar Cambios
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Vista normal
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{guardian.full_name}</p>
                              {guardian.is_primary && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  Principal
                                </span>
                              )}
                              {guardian.is_authorized_pickup && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                  Autorizado
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {guardian.relationship_type}
                              {guardian.phone && ` • ${guardian.phone}`}
                              {guardian.email && ` • ${guardian.email}`}
                            </p>
                            {guardian.document_number && (
                              <p className="text-sm text-gray-500">
                                Doc: {guardian.document_type} {guardian.document_number}
                              </p>
                            )}
                            {guardian.occupation && (
                              <p className="text-sm text-gray-500">
                                Ocupación: {guardian.occupation}
                              </p>
                            )}
                            {guardian.address && (
                              <p className="text-sm text-gray-500">
                                Dirección: {guardian.address}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditGuardian(guardian)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Editar acudiente"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveGuardian(guardian.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Eliminar acudiente"
                            >
                              <UserMinus size={18} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <UsersIcon size={48} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No hay acudientes asignados</p>
                  <p className="text-sm text-gray-400 mt-1">Haga clic en "Agregar Acudiente" para asignar uno</p>
                </div>
              )}

              {showGuardianSelector && (
                <div className="mt-4">
                  <GuardianSelector
                    onSelectExisting={(guardian) => handleAddGuardian({ ...guardian, existing: true })}
                    onCreateNew={(guardian) => handleAddGuardian({ ...guardian, existing: false })}
                    onCancel={() => setShowGuardianSelector(false)}
                    isPrimary={guardians.length === 0}
                  />
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Los cambios se guardarán al hacer clic en "Guardar Cambios"
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e as any);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Guardar Cambios
            </button>
          </div>
        </div>

        {/* Student ID Card Modal */}
        {showIDCard && campuses.length > 0 && (
          <StudentIDCard
            student={student}
            campus={campuses.find(c => c.id === student.campus_id) || campuses[0]}
            onClose={() => setShowIDCard(false)}
          />
        )}
      </div>
    </div>
  );
}

// Student Details Modal Component (unchanged from before)
function StudentDetailsModal({
  student,
  onClose,
}: {
  student: Student;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Detalles del Estudiante</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Información Personal</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Código:</span>
                <p className="font-medium">{student.student_code}</p>
              </div>
              <div>
                <span className="text-gray-500">Nombre Completo:</span>
                <p className="font-medium">{student.full_name}</p>
              </div>
              <div>
                <span className="text-gray-500">Documento:</span>
                <p className="font-medium">
                  {student.document_type} {student.document_number}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Fecha de Nacimiento:</span>
                <p className="font-medium">
                  {new Date(student.birth_date).toLocaleDateString()} ({student.age} años)
                </p>
              </div>
              <div>
                <span className="text-gray-500">Género:</span>
                <p className="font-medium">
                  {student.gender === 'MALE' ? 'Masculino' : student.gender === 'FEMALE' ? 'Femenino' : 'Otro'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Grupo Sanguíneo:</span>
                <p className="font-medium">{student.blood_type || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">Sede:</span>
                <p className="font-medium">{student.campus_name}</p>
              </div>
              <div>
                <span className="text-gray-500">Estado:</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  student.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {student.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            {student.allergies && (
              <div className="mt-4">
                <span className="text-gray-500">Alergias:</span>
                <p className="font-medium text-red-600">{student.allergies}</p>
              </div>
            )}
          </div>

          {/* Contact Info */}
          {(student.email || student.phone || student.address) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Información de Contacto</h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                {student.email && (
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-medium">{student.email}</p>
                  </div>
                )}
                {student.phone && (
                  <div>
                    <span className="text-gray-500">Teléfono:</span>
                    <p className="font-medium">{student.phone}</p>
                  </div>
                )}
                {student.address && (
                  <div>
                    <span className="text-gray-500">Dirección:</span>
                    <p className="font-medium">{student.address}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Guardians */}
          {student.guardians && student.guardians.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">
                Acudientes ({student.guardians.length})
              </h3>
              <div className="space-y-3">
                {student.guardians.map((guardian) => (
                  <div key={guardian.id} className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-gray-900">{guardian.full_name}</p>
                      {guardian.is_primary && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Principal
                        </span>
                      )}
                    </div>
                    <div className="text-sm space-y-1">
                      <p className="text-gray-600">
                        <span className="font-medium">Parentesco:</span> {guardian.relationship_type}
                      </p>
                      {guardian.document_number && (
                        <p className="text-gray-600">
                          <span className="font-medium">Documento:</span> {guardian.document_type} {guardian.document_number}
                        </p>
                      )}
                      {guardian.phone && (
                        <p className="text-gray-600">
                          <span className="font-medium">Teléfono:</span> {guardian.phone}
                        </p>
                      )}
                      {guardian.email && (
                        <p className="text-gray-600">
                          <span className="font-medium">Email:</span> {guardian.email}
                        </p>
                      )}
                      {guardian.occupation && (
                        <p className="text-gray-600">
                          <span className="font-medium">Ocupación:</span> {guardian.occupation}
                        </p>
                      )}
                      {guardian.address && (
                        <p className="text-gray-600">
                          <span className="font-medium">Dirección:</span> {guardian.address}
                        </p>
                      )}
                      <div className="flex gap-3 mt-2">
                        {guardian.is_authorized_pickup && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                            Autorizado para recoger
                          </span>
                        )}
                        {guardian.lives_with && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                            Vive con el estudiante
                          </span>
                        )}
                      </div>
                      {guardian.notes && (
                        <p className="text-gray-600 mt-2">
                          <span className="font-medium">Notas:</span> {guardian.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
