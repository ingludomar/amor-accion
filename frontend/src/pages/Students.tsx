import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import StudentIDCard from '../components/StudentIDCard';
import {
  studentAPI, campusAPI, guardianAPI, groupAPI, gradeAPI, appSettingsAPI, absenceAPI,
  Student, Guardian, CreateStudentRequest,
} from '../lib/supabaseApi';
import { useGradeScale, DEFAULT_SCALE_MAP } from '../hooks/useGradeScale';
import { supabase } from '../lib/supabaseClient';
import {
  Plus, Search, X, Camera, UserPlus, Phone, MessageCircle,
  ChevronRight, GraduationCap, Pencil, Trash2, CreditCard, Users, Star, Bell, AlertTriangle, FileText,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Exportar boletín PDF ────────────────────────────────────────
async function exportBoletinPDF(
  student: Student & { group?: { name: string } },
  grades: any[],
  scaleMap: Record<number, { label: string }>,
  campusName: string,
) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.setTextColor(30, 64, 175);
  doc.text('Amor Acción', 14, 20);
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text('Boletín de Calificaciones', 14, 28);

  // Info del estudiante
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const year = new Date().getFullYear();
  doc.text(`Año: ${year}`, 196, 20, { align: 'right' });
  doc.text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, 196, 26, { align: 'right' });

  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.5);
  doc.line(14, 33, 196, 33);

  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text(`Estudiante: ${student.full_name}`, 14, 42);
  doc.text(`Código: ${student.student_code}`, 14, 49);
  doc.text(`Grupo: ${student.group?.name || '—'}`, 14, 56);
  doc.text(`Sede: ${campusName}`, 120, 42);

  // Tabla de calificaciones
  if (grades.length > 0) {
    const rows = grades.map(g => [
      g.topic?.group?.name || '—',
      g.topic?.title || '—',
      String(g.score),
      scaleMap[g.score]?.label || String(g.score),
      g.notes || '',
    ]);

    autoTable(doc, {
      startY: 64,
      head: [['Grupo', 'Tema', 'Nota', 'Concepto', 'Observaciones']],
      body: rows,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        2: { halign: 'center', fontStyle: 'bold' },
        3: { halign: 'center' },
      },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 2) {
          const score = parseInt(data.cell.raw);
          if (score >= 4) {
            data.cell.styles.textColor = [22, 101, 52]; // verde
          } else if (score === 3) {
            data.cell.styles.textColor = [133, 100, 4]; // amarillo
          } else {
            data.cell.styles.textColor = [185, 28, 28]; // rojo
          }
        }
      },
    });

    // Promedio
    const avg = grades.reduce((sum: number, g: any) => sum + g.score, 0) / grades.length;
    const finalY = (doc as any).lastAutoTable?.finalY || 100;
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(`Promedio general: ${avg.toFixed(1)}`, 14, finalY + 10);
    doc.text(`Total de temas evaluados: ${grades.length}`, 14, finalY + 17);
  } else {
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('No hay calificaciones registradas.', 14, 68);
  }

  // Pie de página
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Amor Acción — Sistema de Asistencia', 14, pageH - 10);

  doc.save(`boletin-${student.student_code}-${year}.pdf`);
}

// ─── Alerta de inasistencia ──────────────────────────────────────
function AbsenceAlert({ studentId, groupId }: { studentId: string; groupId?: string }) {
  const { data: threshold = 3 } = useQuery({
    queryKey: ['app-settings', 'absence_threshold'],
    queryFn: async () => {
      const val = await appSettingsAPI.get('absence_threshold');
      return val ? parseInt(val) : 3;
    },
  });

  const { data: analysis } = useQuery({
    queryKey: ['student-absence-analysis', studentId],
    queryFn: () => absenceAPI.analyze(studentId, groupId!),
    enabled: !!groupId,
  });

  if (!analysis) return null;

  const isAtRisk = analysis.consecutive >= threshold;
  const isCritical = analysis.consecutive >= 4;

  return (
    <div className="mt-2 space-y-1.5">
      {/* Alerta de consecutivas */}
      {isAtRisk && (
        <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 ${
          isCritical ? 'bg-red-100 border-red-300' : 'bg-red-50 border-red-200'
        }`}>
          <Bell className={`w-4 h-4 flex-shrink-0 ${isCritical ? 'text-red-600 animate-pulse' : 'text-red-500'}`} />
          <p className="text-xs text-red-700">
            <span className="font-bold">{analysis.consecutive} ausencias seguidas</span>
            {isCritical && <span className="text-red-600 font-bold"> — En riesgo de perder cupo</span>}
          </p>
        </div>
      )}

      {/* Resumen anual siempre visible si tiene ausencias */}
      {analysis.yearTotal > 0 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            <span className="font-bold">{analysis.yearTotal}</span> ausencias de{' '}
            <span className="font-bold">{analysis.yearSessions}</span> sesiones en {new Date().getFullYear()}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Componente de calificaciones del estudiante ─────────────────
function StudentGrades({ studentId }: { studentId: string }) {
  const { scaleMap } = useGradeScale();
  const { data: grades = [], isLoading } = useQuery({
    queryKey: ['grades-student', studentId],
    queryFn: () => gradeAPI.getByStudent(studentId),
  });

  return (
    <div className="card p-5">
      <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-amber-400" />
        Calificaciones
      </h4>
      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : grades.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Sin calificaciones registradas</p>
      ) : (
        <div className="space-y-2">
          {grades.map((g: any) => {
            const s = scaleMap[g.score] ?? { label: String(g.score), bg: 'bg-gray-100', text: 'text-gray-700' };
            return (
              <div key={g.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${s.bg} ${s.text}`}>
                  {g.score}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{g.topic?.title}</p>
                  <p className="text-xs text-gray-400">{g.topic?.group?.name}</p>
                  {g.notes && <p className="text-xs text-gray-500 italic">{g.notes}</p>}
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${s.bg} ${s.text}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Utilidades ──────────────────────────────────────────────────
function calcAge(birthDate?: string): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate + 'T00:00:00');
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// ─── Constantes ──────────────────────────────────────────────────
const RELATIONSHIP_TYPES = [
  { value: 'padre',      label: 'Padre' },
  { value: 'madre',      label: 'Madre' },
  { value: 'abuelo',     label: 'Abuelo/a' },
  { value: 'tio',        label: 'Tío/a' },
  { value: 'particular', label: 'Particular' },
];
const DOCUMENT_TYPES = ['TI', 'RC', 'CC', 'CE', 'PAS'];
const GENDERS        = [{ value: 'male', label: 'Masculino' }, { value: 'female', label: 'Femenino' }];
const BLOOD_TYPES    = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const GROUP_COLORS: Record<string, string> = {
  'Jardín':       'bg-blue-100 text-blue-700',
  'Infancia':     'bg-green-100 text-green-700',
  'Pre-Juventud': 'bg-purple-100 text-purple-700',
};

// ─── Tipos locales ────────────────────────────────────────────────
type View = 'list' | 'detail' | 'form' | 'guardian-form' | 'id-card';

interface GuardianForm {
  first_name: string; last_name: string;
  relationship_type: string; is_primary: boolean;
  phone_mobile: string; whatsapp_phone: string; has_whatsapp: boolean;
  document_type: string; document_number: string; occupation: string;
}

const emptyGuardianForm = (): GuardianForm => ({
  first_name: '', last_name: '', relationship_type: 'padre', is_primary: false,
  phone_mobile: '', whatsapp_phone: '', has_whatsapp: false,
  document_type: '', document_number: '', occupation: '',
});

const emptyStudentForm = (): Partial<CreateStudentRequest> => ({
  first_name: '', last_name: '', document_type: '', document_number: '',
  birth_date: '', gender: '', blood_type: '', allergies: '',
  group_id: '', campus_id: '', photo_url: '', is_active: true,
});

// ─── Componente principal ─────────────────────────────────────────
export default function Students() {
  const queryClient = useQueryClient();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [view, setView]                   = useState<View>('list');
  const [search, setSearch]               = useState('');
  const [filterGroup, setFilterGroup]     = useState('');
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [studentForm, setStudentForm]     = useState<Partial<CreateStudentRequest>>(emptyStudentForm());
  const [isEditing, setIsEditing]         = useState(false);
  const [guardianForm, setGuardianForm]   = useState<GuardianForm>(emptyGuardianForm());
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // ─── Queries ──────────────────────────────────────────────────
  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students', filterGroup, search],
    queryFn: async () => {
      const { data } = await studentAPI.getAll({
        group_id: filterGroup || undefined,
        is_active: true,
        search: search || undefined,
      });
      return data;
    },
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => { const { data } = await groupAPI.getAll(); return data; },
  });

  const { data: campuses = [] } = useQuery({
    queryKey: ['campuses'],
    queryFn: async () => { const { data } = await campusAPI.getAll(); return data; },
  });

  // Recarga el estudiante activo para reflejar cambios en acudientes
  const refreshActive = async (id: string) => {
    const { data } = await studentAPI.getById(id);
    setActiveStudent(data);
  };

  // ─── Mutations ────────────────────────────────────────────────
  const createStudent = useMutation({
    mutationFn: (d: any) => studentAPI.create(d),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setActiveStudent(res.data);
      setView('detail');
    },
    onError: (e: any) => alert('Error: ' + e.message),
  });

  const updateStudent = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => studentAPI.update(id, data),
    onSuccess: async (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      await refreshActive(vars.id);
      setView('detail');
    },
    onError: (e: any) => alert('Error: ' + e.message),
  });

  const deleteStudent = useMutation({
    mutationFn: studentAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setView('list');
    },
    onError: (e: any) => alert('Error: ' + e.message),
  });

  const addGuardian = useMutation({
    mutationFn: async (form: GuardianForm) => {
      // 1. Crear o encontrar acudiente
      const { data: g } = await guardianAPI.create({
        first_name: form.first_name,
        last_name: form.last_name,
        document_type: form.document_type || undefined,
        document_number: form.document_number || undefined,
        phone_mobile: form.phone_mobile || undefined,
        whatsapp_phone: form.whatsapp_phone || undefined,
        has_whatsapp: form.has_whatsapp,
        occupation: form.occupation || undefined,
      });
      // 2. Vincular con el estudiante
      await studentAPI.addGuardian(
        activeStudent!.id, g.id,
        form.relationship_type,
        form.is_primary,
      );
      return g;
    },
    onSuccess: async () => {
      await refreshActive(activeStudent!.id);
      setView('detail');
    },
    onError: (e: any) => alert('Error: ' + e.message),
  });

  const removeGuardian = useMutation({
    mutationFn: ({ guardianId }: { guardianId: string }) =>
      studentAPI.removeGuardian(activeStudent!.id, guardianId),
    onSuccess: async () => { await refreshActive(activeStudent!.id); },
    onError: (e: any) => alert('Error: ' + e.message),
  });

  // ─── Subida de foto ───────────────────────────────────────────
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const ext  = file.name.split('.').pop();
      const path = `students/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('student-photos').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('student-photos').getPublicUrl(path);
      setStudentForm(f => ({ ...f, photo_url: urlData.publicUrl }));
    } catch (err: any) {
      alert('Error al subir foto: ' + err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ─── Handlers de navegación ───────────────────────────────────
  const openCreate = () => {
    setIsEditing(false);
    const defaultCampus = campuses[0]?.id || '';
    setStudentForm({ ...emptyStudentForm(), campus_id: defaultCampus });
    setView('form');
  };

  const openEdit = (student: Student) => {
    setIsEditing(true);
    setStudentForm({
      first_name: student.first_name, last_name: student.last_name,
      document_type: student.document_type || '', document_number: student.document_number || '',
      birth_date: student.birth_date || '', gender: student.gender || '',
      blood_type: student.blood_type || '', allergies: student.allergies || '',
      group_id: student.group_id || '', campus_id: student.campus_id,
      photo_url: student.photo_url || '', is_active: student.is_active,
    });
    setView('form');
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && activeStudent) {
      updateStudent.mutate({ id: activeStudent.id, data: studentForm });
    } else {
      createStudent.mutate(studentForm);
    }
  };

  const handleGuardianSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addGuardian.mutate(guardianForm);
  };

  const campus = campuses[0]; // Siape

  // ─── Render ───────────────────────────────────────────────────
  return (
    <Layout>
      {/* ── VISTA: LISTA ── */}
      {view === 'list' && (
        <div className="space-y-4">
          <div className="page-header">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <GraduationCap className="w-7 h-7" /> Estudiantes
                </h1>
                <p className="text-blue-100 text-sm mt-1">{students.length} registrados</p>
              </div>
              <button onClick={openCreate} className="btn-primary py-3 px-4 text-sm">
                <Plus className="w-5 h-5" /> Nuevo
              </button>
            </div>
          </div>

          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="search" placeholder="Buscar por nombre o código..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Filtro de grupo */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[{ id: '', name: 'Todos' }, ...groups].map((g: any) => (
              <button
                key={g.id}
                onClick={() => setFilterGroup(g.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition ${
                  filterGroup === g.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>

          {/* Lista */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : students.length === 0 ? (
            <div className="card p-12 text-center">
              <GraduationCap className="w-14 h-14 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 mb-4">No hay estudiantes</p>
              <button onClick={openCreate} className="btn-primary">
                <Plus className="w-5 h-5" /> Agregar estudiante
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {students.map((s: Student) => (
                <button
                  key={s.id}
                  onClick={() => { setActiveStudent(s); setView('detail'); }}
                  className="card w-full p-4 flex items-center gap-4 hover:shadow-md transition text-left"
                >
                  {/* Foto */}
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 flex-shrink-0 flex items-center justify-center">
                    {s.photo_url ? (
                      <img src={s.photo_url} alt={s.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-xl font-bold">{s.first_name?.[0]}{s.last_name?.[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{s.full_name}</p>
                    <p className="text-xs text-gray-400">{s.student_code}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {s.group && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${GROUP_COLORS[s.group.name] || 'bg-gray-100 text-gray-600'}`}>
                          {s.group.name}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {s.guardians?.length || 0} acudiente(s)
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── VISTA: DETALLE ── */}
      {view === 'detail' && activeStudent && (
        <div className="space-y-4 max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => setView('list')} className="p-2 hover:bg-gray-100 rounded-xl">
              <ChevronRight className="w-5 h-5 text-gray-500 rotate-180" />
            </button>
            <h2 className="text-lg font-bold text-gray-900">Perfil del Estudiante</h2>
          </div>

          {/* Tarjeta principal */}
          <div className="card p-5">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 flex-shrink-0 flex items-center justify-center">
                {activeStudent.photo_url ? (
                  <img src={activeStudent.photo_url} alt={activeStudent.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-2xl font-bold">
                    {activeStudent.first_name?.[0]}{activeStudent.last_name?.[0]}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{activeStudent.full_name}</h3>
                <p className="text-sm text-gray-400">{activeStudent.student_code}</p>
                {activeStudent.group && (
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${GROUP_COLORS[activeStudent.group.name] || 'bg-gray-100 text-gray-600'}`}>
                    {activeStudent.group.name}
                  </span>
                )}
                <AbsenceAlert studentId={activeStudent.id} groupId={activeStudent.group_id} />
              </div>
            </div>

            {/* Datos */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {activeStudent.campus_id && (
                <InfoItem label="Sede" value={campuses.find((c: any) => c.id === activeStudent.campus_id)?.name || '—'} />
              )}
              {activeStudent.document_type && activeStudent.document_number && (
                <InfoItem label="Documento" value={`${activeStudent.document_type} ${activeStudent.document_number}`} />
              )}
              {activeStudent.birth_date && (
                <InfoItem
                  label="Nacimiento"
                  value={`${new Date(activeStudent.birth_date + 'T00:00:00').toLocaleDateString('es-CO')} · ${calcAge(activeStudent.birth_date)} años`}
                />
              )}
              {activeStudent.gender && (
                <InfoItem label="Género" value={activeStudent.gender === 'male' ? 'Masculino' : 'Femenino'} />
              )}
              {activeStudent.blood_type && (
                <InfoItem label="Sangre" value={activeStudent.blood_type} highlight />
              )}
              {activeStudent.allergies && (
                <div className="col-span-2">
                  <InfoItem label="Alergias" value={activeStudent.allergies} />
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="mt-4 flex gap-2 flex-wrap">
              <button
                onClick={() => openEdit(activeStudent)}
                className="btn-secondary flex-1 text-sm py-2"
              >
                <Pencil className="w-4 h-4" /> Editar
              </button>
              <button
                onClick={() => setView('id-card')}
                className="btn-secondary flex-1 text-sm py-2"
              >
                <CreditCard className="w-4 h-4" /> Carnet
              </button>
              <button
                onClick={async () => {
                  const grades = await gradeAPI.getByStudent(activeStudent.id);
                  const campus = campuses.find((c: any) => c.id === activeStudent.campus_id);
                  exportBoletinPDF(activeStudent as any, grades, DEFAULT_SCALE_MAP, campus?.name || '—');
                }}
                className="btn-secondary flex-1 text-sm py-2 text-green-700 hover:bg-green-50"
              >
                <FileText className="w-4 h-4" /> Boletín
              </button>
              <button
                onClick={() => {
                  if (confirm(`¿Eliminar a ${activeStudent.full_name}?`))
                    deleteStudent.mutate(activeStudent.id);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Acudientes */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Acudientes
              </h4>
              <button
                onClick={() => { setGuardianForm(emptyGuardianForm()); setView('guardian-form'); }}
                className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:underline"
              >
                <UserPlus className="w-4 h-4" /> Agregar
              </button>
            </div>

            {!activeStudent.guardians?.length ? (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm mb-3">Sin acudientes registrados</p>
                <button
                  onClick={() => { setGuardianForm(emptyGuardianForm()); setView('guardian-form'); }}
                  className="btn-primary text-sm py-2 px-4"
                >
                  <UserPlus className="w-4 h-4" /> Agregar acudiente
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeStudent.guardians.map((g: any) => (
                  <div key={g.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold text-gray-900 text-sm">{g.full_name}</p>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">
                            {RELATIONSHIP_TYPES.find(r => r.value === g.relationship_type)?.label || g.relationship_type}
                          </span>
                          {g.is_primary && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Principal</span>
                          )}
                        </div>
                        <div className="space-y-1">
                          {g.phone_mobile && (
                            <a href={`tel:${g.phone_mobile}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600">
                              <Phone className="w-3.5 h-3.5" /> {g.phone_mobile}
                            </a>
                          )}
                          {g.has_whatsapp && (
                            <a
                              href={`https://wa.me/${(g.whatsapp_phone || g.phone_mobile).replace(/\D/g, '')}`}
                              target="_blank" rel="noreferrer"
                              className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              {g.whatsapp_phone || g.phone_mobile}
                            </a>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(`¿Desvincular a ${g.full_name}?`))
                            removeGuardian.mutate({ guardianId: g.id });
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Calificaciones */}
          <StudentGrades studentId={activeStudent.id} />
        </div>
      )}

      {/* ── VISTA: FORMULARIO ESTUDIANTE ── */}
      {view === 'form' && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => setView(isEditing ? 'detail' : 'list')} className="p-2 hover:bg-gray-100 rounded-xl">
              <ChevronRight className="w-5 h-5 text-gray-500 rotate-180" />
            </button>
            <h2 className="text-lg font-bold text-gray-900">
              {isEditing ? 'Editar Estudiante' : 'Nuevo Estudiante'}
            </h2>
          </div>

          <form onSubmit={handleStudentSubmit} className="space-y-4">
            {/* Foto */}
            <div className="card p-5 flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                {studentForm.photo_url ? (
                  <img src={studentForm.photo_url} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-white opacity-70" />
                )}
              </div>
              <input ref={photoInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="hidden" />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="btn-secondary text-sm py-2 px-4"
              >
                <Camera className="w-4 h-4" />
                {uploadingPhoto ? 'Subiendo...' : 'Tomar / Subir foto'}
              </button>
            </div>

            {/* Datos básicos */}
            <div className="card p-5 space-y-4">
              <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Datos personales</h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Nombre *</label>
                  <input required type="text" value={studentForm.first_name} onChange={e => setStudentForm(f => ({ ...f, first_name: e.target.value }))} className="input-field" placeholder="Nombre" />
                </div>
                <div>
                  <label className="label">Apellido *</label>
                  <input required type="text" value={studentForm.last_name} onChange={e => setStudentForm(f => ({ ...f, last_name: e.target.value }))} className="input-field" placeholder="Apellido" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Documento</label>
                  <select value={studentForm.document_type} onChange={e => setStudentForm(f => ({ ...f, document_type: e.target.value }))} className="input-field">
                    <option value="">Tipo</option>
                    {DOCUMENT_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">Número</label>
                  <input type="text" value={studentForm.document_number} onChange={e => setStudentForm(f => ({ ...f, document_number: e.target.value }))} className="input-field" placeholder="Número de documento" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Fecha de nacimiento</label>
                  <input type="date" value={studentForm.birth_date} onChange={e => setStudentForm(f => ({ ...f, birth_date: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="label">Género</label>
                  <select value={studentForm.gender} onChange={e => setStudentForm(f => ({ ...f, gender: e.target.value }))} className="input-field">
                    <option value="">Seleccionar</option>
                    {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Tipo de sangre</label>
                  <select value={studentForm.blood_type} onChange={e => setStudentForm(f => ({ ...f, blood_type: e.target.value }))} className="input-field">
                    <option value="">Seleccionar</option>
                    {BLOOD_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Grupo *</label>
                  <select required value={studentForm.group_id} onChange={e => setStudentForm(f => ({ ...f, group_id: e.target.value }))} className="input-field">
                    <option value="">Seleccionar</option>
                    {groups.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Sede *</label>
                <select required value={studentForm.campus_id} onChange={e => setStudentForm(f => ({ ...f, campus_id: e.target.value }))} className="input-field">
                  <option value="">Seleccionar sede</option>
                  {campuses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Alergias / condiciones médicas</label>
                <textarea value={studentForm.allergies} onChange={e => setStudentForm(f => ({ ...f, allergies: e.target.value }))} className="input-field" rows={2} placeholder="Ninguna" />
              </div>
            </div>

            <div className="flex gap-3 pb-6">
              <button type="button" onClick={() => setView(isEditing ? 'detail' : 'list')} className="btn-secondary flex-1">Cancelar</button>
              <button type="submit" disabled={createStudent.isPending || updateStudent.isPending} className="btn-primary flex-1">
                {createStudent.isPending || updateStudent.isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear estudiante'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── VISTA: FORMULARIO ACUDIENTE ── */}
      {view === 'guardian-form' && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => setView('detail')} className="p-2 hover:bg-gray-100 rounded-xl">
              <ChevronRight className="w-5 h-5 text-gray-500 rotate-180" />
            </button>
            <h2 className="text-lg font-bold text-gray-900">Agregar Acudiente</h2>
          </div>

          <form onSubmit={handleGuardianSubmit} className="card p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Nombre *</label>
                <input required type="text" value={guardianForm.first_name} onChange={e => setGuardianForm(f => ({ ...f, first_name: e.target.value }))} className="input-field" placeholder="Nombre" />
              </div>
              <div>
                <label className="label">Apellido *</label>
                <input required type="text" value={guardianForm.last_name} onChange={e => setGuardianForm(f => ({ ...f, last_name: e.target.value }))} className="input-field" placeholder="Apellido" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Parentesco *</label>
                <select required value={guardianForm.relationship_type} onChange={e => setGuardianForm(f => ({ ...f, relationship_type: e.target.value }))} className="input-field">
                  {RELATIONSHIP_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Documento</label>
                <div className="flex gap-2">
                  <select value={guardianForm.document_type} onChange={e => setGuardianForm(f => ({ ...f, document_type: e.target.value }))} className="input-field w-20 flex-shrink-0">
                    <option value="">-</option>
                    {DOCUMENT_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <input type="text" value={guardianForm.document_number} onChange={e => setGuardianForm(f => ({ ...f, document_number: e.target.value }))} className="input-field flex-1" placeholder="Número" />
                </div>
              </div>
            </div>

            {/* Teléfonos */}
            <div className="border-t pt-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Phone className="w-4 h-4" /> Contacto
              </h3>
              <div>
                <label className="label">Celular (llamadas) *</label>
                <input required type="tel" value={guardianForm.phone_mobile} onChange={e => setGuardianForm(f => ({ ...f, phone_mobile: e.target.value }))} className="input-field" placeholder="300 123 4567" />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox" checked={guardianForm.has_whatsapp}
                  onChange={e => setGuardianForm(f => ({ ...f, has_whatsapp: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 flex items-center gap-1">
                  <MessageCircle className="w-4 h-4 text-green-600" /> ¿Tiene WhatsApp?
                </span>
              </label>

              {guardianForm.has_whatsapp && (
                <div>
                  <label className="label">WhatsApp (si es diferente al celular)</label>
                  <input type="tel" value={guardianForm.whatsapp_phone} onChange={e => setGuardianForm(f => ({ ...f, whatsapp_phone: e.target.value }))} className="input-field" placeholder="300 123 4567" />
                </div>
              )}
            </div>

            <div>
              <label className="label">Ocupación</label>
              <input type="text" value={guardianForm.occupation} onChange={e => setGuardianForm(f => ({ ...f, occupation: e.target.value }))} className="input-field" placeholder="Ocupación (opcional)" />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox" checked={guardianForm.is_primary}
                onChange={e => setGuardianForm(f => ({ ...f, is_primary: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm text-gray-700">Acudiente principal (aparece en el carnet)</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setView('detail')} className="btn-secondary flex-1">Cancelar</button>
              <button type="submit" disabled={addGuardian.isPending} className="btn-primary flex-1">
                {addGuardian.isPending ? 'Guardando...' : 'Agregar acudiente'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── VISTA: CARNET ── */}
      {view === 'id-card' && activeStudent && campus && (
        <StudentIDCard
          student={activeStudent}
          campus={campus}
          onClose={() => setView('detail')}
        />
      )}
    </Layout>
  );
}

// ─── Sub-componente helper ────────────────────────────────────────
function InfoItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-medium ${highlight ? 'text-red-600' : 'text-gray-800'}`}>{value}</p>
    </div>
  );
}
