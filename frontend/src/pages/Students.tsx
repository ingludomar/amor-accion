import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { studentAPI, campusAPI, familyAPI, guardianAPI, Student, CreateStudentRequest, Guardian, Family } from '../lib/supabaseApi';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  UserPlus,
  GraduationCap,
  Filter,
  ChevronLeft,
  ChevronRight,
  FamilyRestroom,
  UserCheck,
  MessageCircle,
  Trash,
  PlusCircle
} from 'lucide-react';

export default function Students() {
  // TEST: Auto-open modal on first render if there are students
  useEffect(() => {
    // Simular click después de 2 segundos si hay estudiantes
    const timer = setTimeout(() => {
      console.log('Students page loaded - checking for students');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampus, setSelectedCampus] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch students
  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students', selectedCampus, searchTerm],
    queryFn: async () => {
      const { data } = await studentAPI.getAll({
        campus_id: selectedCampus || undefined,
        is_active: true,
        search: searchTerm || undefined,
      });
      return data;
    },
  });

  // Fetch campuses
  const { data: campuses = [] } = useQuery({
    queryKey: ['campuses'],
    queryFn: async () => {
      const { data } = await campusAPI.getAll();
      return data;
    },
  });

  // Fetch families
  const { data: families = [] } = useQuery({
    queryKey: ['families'],
    queryFn: async () => {
      const { data } = await familyAPI.getAll();
      return data;
    },
  });

  // Fetch guardians
  const { data: guardians = [] } = useQuery({
    queryKey: ['guardians'],
    queryFn: async () => {
      const { data } = await guardianAPI.getAll();
      return data;
    },
  });

  // Pagination
  const totalStudents = students.length;
  const totalPages = Math.ceil(totalStudents / itemsPerPage);
  const paginatedStudents = students.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateStudentRequest) => studentAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setShowCreateModal(false);
      alert('Estudiante creado exitosamente');
    },
    onError: (error: any) => {
      alert(error.message || 'Error al crear estudiante');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => studentAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      alert('Estudiante eliminado exitosamente');
    },
    onError: (error: any) => {
      alert(error.message || 'Error al eliminar estudiante');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => studentAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setShowCreateModal(false);
      setEditingStudent(null);
      alert('Estudiante actualizado exitosamente');
    },
    onError: (error: any) => {
      alert(error.message || 'Error al actualizar estudiante');
    },
  });

  const handleEdit = (student: Student) => {
    // Abrir modal directamente
    setEditingStudent(student);
    setShowCreateModal(true);
  };

  const handleDelete = (student: Student) => {
    if (window.confirm(`¿Está seguro de eliminar a ${student.full_name}?`)) {
      deleteMutation.mutate(student.id);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 test-container-v2">
        {/* Header */}
        <div className="page-header">
          <div className="relative">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <GraduationCap className="w-8 h-8" />
              Gestión de Estudiantes
            </h1>
            <p className="text-blue-100">
              Administra los estudiantes matriculados en el sistema
            </p>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="card p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar estudiante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>

              {/* Campus Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedCampus}
                  onChange={(e) => setSelectedCampus(e.target.value)}
                  className="input-field pl-10 pr-8 appearance-none cursor-pointer"
                >
                  <option value="">Todas las sedes</option>
                  {campuses.map((campus) => (
                    <option key={campus.id} value={campus.id}>
                      {campus.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Add Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Nuevo Estudiante
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Estudiantes</p>
                <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <UserPlus className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Página Actual</p>
                <p className="text-2xl font-bold text-gray-900">{page} de {totalPages || 1}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-violet-100 rounded-xl">
                <Filter className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Mostrando</p>
                <p className="text-2xl font-bold text-gray-900">{paginatedStudents.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Cargando estudiantes...</p>
            </div>
          ) : paginatedStudents.length === 0 ? (
            <div className="p-12 text-center">
              <GraduationCap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay estudiantes registrados
              </h3>
              <p className="text-gray-600 mb-6">
                Comienza agregando tu primer estudiante al sistema
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                <Plus className="w-5 h-5" />
                Agregar Estudiante
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Documento
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Sede
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
                    {paginatedStudents.map((student: Student) => (
                      <tr key={student.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {student.student_code}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {student.first_name?.[0]}{student.last_name?.[0]}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {student.full_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {student.email || 'Sin email'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {student.document_number || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {campuses.find(c => c.id === student.campus_id)?.name || 'Sin sede'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            student.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {student.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(student)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(student)}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Mostrando {(page - 1) * itemsPerPage + 1} a {Math.min(page * itemsPerPage, totalStudents)} de {totalStudents} estudiantes
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium text-gray-900">
                      Página {page} de {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create/Edit Modal - ConFamilia y Acudientes */}
      {showCreateModal && (
        <CreateStudentModal
          campuses={campuses}
          families={families}
          guardians={guardians}
          editingStudent={editingStudent}
          onClose={() => {
            setShowCreateModal(false);
            setEditingStudent(null);
          }}
          onSubmit={(data) => {
            if (editingStudent) {
              updateMutation.mutate({ id: editingStudent.id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
        />
      )}
    </Layout>
  );
}

// Modal completo para crear/editar estudiante con Familia y Acudientes
function CreateStudentModal({ 
  campuses, 
  families,
  guardians,
  editingStudent,
  onClose, 
  onSubmit 
}: { 
  campuses: any[];
  families: Family[];
  guardians: Guardian[];
  editingStudent?: Student | null;
  onClose: () => void; 
  onSubmit: (data: CreateStudentRequest, familyId?: string, guardianIds?: string[]) => void;
}) {
  const [activeTab, setActiveTab] = useState<'basic' | 'family'>('basic');
  const [formData, setFormData] = useState<CreateStudentRequest>({
    first_name: editingStudent?.first_name || '',
    last_name: editingStudent?.last_name || '',
    birth_date: editingStudent?.birth_date || '',
    gender: editingStudent?.gender as any || 'male',
    campus_id: editingStudent?.campus_id || campuses[0]?.id || '',
    document_type: editingStudent?.document_type || '',
    document_number: editingStudent?.document_number || '',
    blood_type: editingStudent?.blood_type || '',
    allergies: editingStudent?.allergies || '',
    email: editingStudent?.email || '',
    phone: editingStudent?.phone || '',
    address: editingStudent?.address || '',
    photo_url: editingStudent?.photo_url || '',
    is_active: editingStudent?.is_active ?? true,
  });

  // Estado para familia
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('');
  const [newFamilyName, setNewFamilyName] = useState('');
  const [showNewFamily, setShowNewFamily] = useState(false);

  // Estado para nuevos acudientes
  const [selectedGuardianIds, setSelectedGuardianIds] = useState<string[]>([]);
  const [showNewGuardian, setShowNewGuardian] = useState(false);
  const [newGuardian, setNewGuardian] = useState({
    first_name: '',
    last_name: '',
    phone_mobile: '',
    has_whatsapp: false,
    whatsapp_phone: '',
    email: '',
    relationship: 'padre',
  });

  // Cargar datos existentes si es edición
  useEffect(() => {
    if (editingStudent) {
      setFormData({
        first_name: editingStudent.first_name || '',
        last_name: editingStudent.last_name || '',
        birth_date: editingStudent.birth_date || '',
        gender: editingStudent.gender as any || 'male',
        campus_id: editingStudent.campus_id || campuses[0]?.id || '',
        document_type: editingStudent.document_type || '',
        document_number: editingStudent.document_number || '',
        blood_type: editingStudent.blood_type || '',
        allergies: editingStudent.allergies || '',
        email: editingStudent.email || '',
        phone: editingStudent.phone || '',
        address: editingStudent.address || '',
        photo_url: editingStudent.photo_url || '',
        is_active: editingStudent.is_active ?? true,
      });

      // Cargar familia si existe
      if ((editingStudent as any).family_id) {
        setSelectedFamilyId((editingStudent as any).family_id);
      }

      // Cargar guardianes si existen
      if (editingStudent.guardians && editingStudent.guardians.length > 0) {
        setSelectedGuardianIds(editingStudent.guardians.map(g => g.id));
      }
    }
  }, [editingStudent, campuses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let familyId = selectedFamilyId;

    // Crear nueva familia si es necesario
    if (showNewFamily && newFamilyName.trim()) {
      try {
        const { data: newFamily } = await familyAPI.create({
          name: newFamilyName,
          is_active: true,
        });
        familyId = newFamily.id;
      } catch (error) {
        alert('Error al crear familia');
        return;
      }
    }

    // Crear nuevos guardianes si hay
    const newGuardianIds: string[] = [];
    if (showNewGuardian && newGuardian.first_name.trim() && newGuardian.last_name.trim()) {
      try {
        const { data: createdGuardian } = await guardianAPI.create({
          first_name: newGuardian.first_name,
          last_name: newGuardian.last_name,
          phone_mobile: newGuardian.phone_mobile,
          has_whatsapp: newGuardian.has_whatsapp,
          whatsapp_phone: newGuardian.whatsapp_phone || newGuardian.phone_mobile,
        } as any);
        newGuardianIds.push(createdGuardian.id);
      } catch (error) {
        alert('Error al crear acudiente');
        return;
      }
    }

    // Combinar guardianes existentes con nuevos
    const allGuardianIds = [...selectedGuardianIds, ...newGuardianIds];

    // Relacionar guardianes con la familia
    if (familyId && allGuardianIds.length > 0) {
      try {
        for (const guardianId of allGuardianIds) {
          await familyAPI.assignGuardian(guardianId, familyId, newGuardian.relationship, true);
        }
        // Asignar estudiante a la familia
        if (editingStudent) {
          await familyAPI.unassignStudent(editingStudent.id, familyId);
        }
        await familyAPI.assignStudent(editingStudent?.id || '', familyId, 'hijo');
      } catch (error) {
        console.error('Error al relacionar con familia:', error);
      }
    }

    onSubmit(formData, familyId, allGuardianIds);
  };

  const toggleGuardian = (guardianId: string) => {
    setSelectedGuardianIds(prev => 
      prev.includes(guardianId) 
        ? prev.filter(id => id !== guardianId)
        : [...prev, guardianId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {editingStudent ? 'Editar Estudiante' : 'Nuevo Estudiante'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab('basic')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition ${
              activeTab === 'basic'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Datos Básicos
          </button>
          <button
            onClick={() => setActiveTab('family')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === 'family'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FamilyRestroom className="w-4 h-4" />
            Familia y Acudientes
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {activeTab === 'basic' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sede *</label>
                <select
                  required
                  value={formData.campus_id}
                  onChange={(e) => setFormData({ ...formData, campus_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Selecciona una sede</option>
                  {campuses.map((campus) => (
                    <option key={campus.id} value={campus.id}>
                      {campus.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="input-field"
                  >
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Documento de Identidad</label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={formData.document_type}
                    onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                    className="input-field col-span-1"
                  >
                    <option value="">Tipo</option>
                    <option value="CC">CC</option>
                    <option value="TI">TI</option>
                    <option value="PAS">PAS</option>
                  </select>
                  <input
                    type="text"
                    value={formData.document_number}
                    onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                    className="input-field col-span-2"
                    placeholder="Número de documento"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder=".com"
                />
email@ejemplo              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                  placeholder="300 123 4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-field"
                  placeholder="Dirección de residencia"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Sangre</label>
                  <select
                    value={formData.blood_type}
                    onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Selecciona</option>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alergias</label>
                  <input
                    type="text"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    className="input-field"
                    placeholder="Alergias conocidas"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'family' && (
            <div className="space-y-6">
              {/* Sección Familia */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FamilyRestroom className="w-5 h-5" />
                    Familia
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowNewFamily(!showNewFamily)}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Nueva Familia
                  </button>
                </div>

                {showNewFamily ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newFamilyName}
                      onChange={(e) => setNewFamilyName(e.target.value)}
                      className="input-field"
                      placeholder="Nombre de la familia (ej: Familia Pérez)"
                    />
                    <p className="text-xs text-gray-500">
                      Se creará una nueva familia con este nombre
                    </p>
                  </div>
                ) : (
                  <select
                    value={selectedFamilyId}
                    onChange={(e) => setSelectedFamilyId(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Selecciona una familia existente</option>
                    {families.filter(f => f.is_active).map((family) => (
                      <option key={family.id} value={family.id}>
                        {family.name || 'Familia sin nombre'}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Sección Acudientes */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    Padres / Acudientes
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowNewGuardian(!showNewGuardian)}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Nuevo Acudiente
                  </button>
                </div>

                {showNewGuardian && (
                  <div className="bg-gray-50 p-3 rounded-lg mb-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newGuardian.first_name}
                        onChange={(e) => setNewGuardian({ ...newGuardian, first_name: e.target.value })}
                        className="input-field"
                        placeholder="Nombre"
                      />
                      <input
                        type="text"
                        value={newGuardian.last_name}
                        onChange={(e) => setNewGuardian({ ...newGuardian, last_name: e.target.value })}
                        className="input-field"
                        placeholder="Apellido"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={newGuardian.relationship}
                        onChange={(e) => setNewGuardian({ ...newGuardian, relationship: e.target.value })}
                        className="input-field"
                      >
                        <option value="padre">Padre</option>
                        <option value="madre">Madre</option>
                        <option value="abuelo">Abuelo/a</option>
                        <option value="tio">Tío/a</option>
                        <option value="tutor">Tutor</option>
                        <option value="otro">Otro</option>
                      </select>
                      <input
                        type="tel"
                        value={newGuardian.phone_mobile}
                        onChange={(e) => setNewGuardian({ ...newGuardian, phone_mobile: e.target.value })}
                        className="input-field"
                        placeholder="Teléfono móvil"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newGuardian.has_whatsapp}
                        onChange={(e) => setNewGuardian({ ...newGuardian, has_whatsapp: e.target.checked })}
                        className="w-4 h-4 rounded text-green-600"
                      />
                      <span className="text-sm text-gray-700 flex items-center gap-1">
                        <MessageCircle className="w-4 h-4 text-green-500" />
                        Tiene WhatsApp
                      </span>
                    </label>
                  </div>
                )}

                {/* Lista de guardianes existentes */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {guardians.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No hay acudientes registrados
                    </p>
                  ) : (
                    guardians.map((guardian) => (
                      <label
                        key={guardian.id}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${
                          selectedGuardianIds.includes(guardian.id)
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedGuardianIds.includes(guardian.id)}
                          onChange={() => toggleGuardian(guardian.id)}
                          className="w-4 h-4 rounded text-blue-600"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {guardian.full_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {guardian.phone_mobile || 'Sin teléfono'}
                            {guardian.has_whatsapp && (
                              <span className="ml-2 text-green-600 flex items-center gap-1 inline">
                                <MessageCircle className="w-3 h-3" />
                              </span>
                            )}
                          </p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              <Plus className="w-5 h-5" />
              {editingStudent ? 'Actualizar' : 'Crear'} Estudiante
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
