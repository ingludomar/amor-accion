import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { reportAPI, groupAPI, studentAPI } from '../lib/supabaseApi';
import { BarChart3, Calendar, Users, User, TrendingUp, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type ReportType = 'general' | 'group' | 'student';

function pct(present: number, total: number) {
  if (!total) return 0;
  return Math.round((present / total) * 100);
}

// ── Helpers de exportación PDF ────────────────────────────────────

function pdfHeader(doc: jsPDF, title: string, dateFrom: string, dateTo: string) {
  doc.setFontSize(16);
  doc.setTextColor(30, 64, 175); // azul
  doc.text('Amor Acción — Sistema de Asistencia', 14, 18);
  doc.setFontSize(12);
  doc.setTextColor(55, 65, 81); // gris oscuro
  doc.text(title, 14, 28);
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128); // gris
  doc.text(
    `Período: ${new Date(dateFrom + 'T00:00:00').toLocaleDateString('es-CO')} — ${new Date(dateTo + 'T00:00:00').toLocaleDateString('es-CO')}`,
    14, 36
  );
  doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, 14, 42);
}

function exportGeneralPDF(sessions: any[], dateFrom: string, dateTo: string) {
  const doc = new jsPDF();
  pdfHeader(doc, 'Reporte General de Asistencia', dateFrom, dateTo);
  const rows = sessions.map(s => {
    const records = s.attendance_records || [];
    const p = records.filter((r: any) => r.status === 'presente').length;
    const a = records.filter((r: any) => r.status === 'ausente').length;
    const e = records.filter((r: any) => r.status === 'excusado').length;
    return [
      new Date(s.session_date + 'T00:00:00').toLocaleDateString('es-CO'),
      s.group?.name || '-',
      p, a, e,
      `${pct(p, records.length)}%`,
    ];
  });
  autoTable(doc, {
    startY: 50,
    head: [['Fecha', 'Grupo', 'Presentes', 'Ausentes', 'Excusados', '% Asistencia']],
    body: rows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 64, 175] },
  });
  doc.save(`reporte-general-${dateFrom}-${dateTo}.pdf`);
}

function exportGroupPDF(sessions: any[], groupName: string, dateFrom: string, dateTo: string, allGroupStudents: any[] = []) {
  const doc = new jsPDF();
  pdfHeader(doc, `Reporte por Grupo: ${groupName}`, dateFrom, dateTo);
  const studentMap: Record<string, { name: string; code: string; present: number; absent: number; excused: number }> = {};
  sessions.forEach(s => {
    (s.attendance_records || []).forEach((r: any) => {
      const id = r.student?.id;
      if (!id) return;
      if (!studentMap[id]) studentMap[id] = { name: r.student.full_name, code: r.student.student_code, present: 0, absent: 0, excused: 0 };
      if (r.status === 'presente') studentMap[id].present++;
      else if (r.status === 'ausente') studentMap[id].absent++;
      else studentMap[id].excused++;
    });
  });
  // Agregar estudiantes del grupo sin ningún registro
  allGroupStudents.forEach((s: any) => {
    if (!studentMap[s.id]) studentMap[s.id] = { name: s.full_name, code: s.student_code, present: 0, absent: 0, excused: 0 };
  });
  const rows = Object.values(studentMap)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(r => {
      const total = r.present + r.absent + r.excused;
      const sinRegistro = total === 0;
      return [r.name, r.code, r.present, r.absent, r.excused, sinRegistro ? 'Sin registro' : `${pct(r.present, total)}%`];
    });
  autoTable(doc, {
    startY: 50,
    head: [['Estudiante', 'Código', 'Presentes', 'Ausentes', 'Excusados', '% / Estado']],
    body: rows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 64, 175] },
    didParseCell: (data: any) => {
      if (data.column.index === 5 && data.section === 'body' && data.cell.raw === 'Sin registro') {
        data.cell.styles.textColor = [156, 163, 175];
        data.cell.styles.fontStyle = 'italic';
      }
    },
  });
  doc.save(`reporte-grupo-${groupName}-${dateFrom}-${dateTo}.pdf`);
}

function exportStudentPDF(records: any[], studentName: string, dateFrom: string, dateTo: string) {
  const doc = new jsPDF();
  pdfHeader(doc, `Reporte de Estudiante: ${studentName}`, dateFrom, dateTo);
  const rows = records.map((r: any) => [
    new Date((r.session?.session_date || '') + 'T00:00:00').toLocaleDateString('es-CO'),
    r.session?.group?.name || '-',
    r.status.charAt(0).toUpperCase() + r.status.slice(1),
  ]);
  autoTable(doc, {
    startY: 50,
    head: [['Fecha', 'Grupo', 'Estado']],
    body: rows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 64, 175] },
    bodyStyles: { cellPadding: 3 },
    didParseCell: (data: any) => {
      if (data.column.index === 2 && data.section === 'body') {
        const v = data.cell.raw as string;
        if (v === 'Presente') data.cell.styles.textColor = [22, 163, 74];
        else if (v === 'Ausente') data.cell.styles.textColor = [220, 38, 38];
        else data.cell.styles.textColor = [202, 138, 4];
      }
    },
  });
  doc.save(`reporte-estudiante-${studentName}-${dateFrom}-${dateTo}.pdf`);
}

export default function Reports() {
  const today = new Date().toISOString().split('T')[0];
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [reportType, setReportType] = useState<ReportType>('general');
  const [dateFrom, setDateFrom] = useState(monthAgo);
  const [dateTo, setDateTo] = useState(today);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => { const { data } = await groupAPI.getAll(); return data; },
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students-all'],
    queryFn: async () => { const { data } = await studentAPI.getAll({ is_active: true }); return data; },
  });

  // Estudiantes del grupo seleccionado (para detectar "sin registro")
  const { data: groupStudents = [] } = useQuery({
    queryKey: ['students-group', selectedGroup],
    queryFn: async () => { const { data } = await studentAPI.getAll({ group_id: selectedGroup, is_active: true }); return data ?? []; },
    enabled: !!selectedGroup,
  });

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['report', reportType, dateFrom, dateTo, selectedGroup, selectedStudent],
    queryFn: async () => {
      if (reportType === 'general') return reportAPI.general(dateFrom, dateTo);
      if (reportType === 'group' && selectedGroup) return reportAPI.byGroup(selectedGroup, dateFrom, dateTo);
      if (reportType === 'student' && selectedStudent) return reportAPI.byStudent(selectedStudent, dateFrom, dateTo);
      return { data: [] };
    },
    enabled: showReport,
  });

  const sessions = (reportData as any)?.data || [];

  const canGenerate =
    (reportType === 'general') ||
    (reportType === 'group' && selectedGroup) ||
    (reportType === 'student' && selectedStudent);

  function handleExportPDF() {
    if (!sessions.length) return;
    setExporting(true);
    try {
      if (reportType === 'general') {
        exportGeneralPDF(sessions, dateFrom, dateTo);
      } else if (reportType === 'group') {
        const groupName = (groups as any[]).find(g => g.id === selectedGroup)?.name || selectedGroup;
        exportGroupPDF(sessions, groupName, dateFrom, dateTo, groupStudents);
      } else if (reportType === 'student') {
        const studentName = (students as any[]).find(s => s.id === selectedStudent)?.full_name || selectedStudent;
        exportStudentPDF(sessions, studentName, dateFrom, dateTo);
      }
    } finally {
      setExporting(false);
    }
  }

  return (
    <Layout>
      <div className="space-y-5 max-w-3xl mx-auto">
        {/* Header */}
        <div className="page-header">
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-3">
            <BarChart3 className="w-7 h-7" />
            Reportes
          </h1>
          <p className="text-blue-100 text-sm">Consulta la asistencia por rango de fechas</p>
        </div>

        {/* Filtros */}
        <div className="card p-5 space-y-4">
          {/* Tipo de reporte */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Tipo de reporte</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'general', label: 'General', icon: TrendingUp },
                { value: 'group',   label: 'Por grupo', icon: Users },
                { value: 'student', label: 'Por alumno', icon: User },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => { setReportType(value as ReportType); setShowReport(false); }}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-sm font-medium transition ${
                    reportType === value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
              <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setShowReport(false); }} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
              <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setShowReport(false); }} className="input-field" />
            </div>
          </div>

          {/* Selector grupo */}
          {reportType === 'group' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
              <select value={selectedGroup} onChange={e => { setSelectedGroup(e.target.value); setShowReport(false); }} className="input-field">
                <option value="">Seleccionar grupo</option>
                {groups.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          )}

          {/* Selector alumno */}
          {reportType === 'student' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alumno</label>
              <select value={selectedStudent} onChange={e => { setSelectedStudent(e.target.value); setShowReport(false); }} className="input-field">
                <option value="">Seleccionar alumno</option>
                {students.map((s: any) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>
          )}

          <div className="flex gap-3">
            <button
              disabled={!canGenerate}
              onClick={() => setShowReport(true)}
              className="btn-primary flex-1"
            >
              <BarChart3 className="w-5 h-5" />
              Generar reporte
            </button>
            {showReport && sessions.length > 0 && (
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-green-500 text-green-700 font-semibold hover:bg-green-50 transition text-sm flex-shrink-0"
              >
                <FileDown className="w-4 h-4" />
                {exporting ? 'Exportando…' : 'PDF'}
              </button>
            )}
          </div>
        </div>

        {/* Resultados */}
        {showReport && (
          isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="card p-10 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No hay sesiones en el período seleccionado</p>
            </div>
          ) : reportType === 'general' ? (
            <GeneralReport sessions={sessions} />
          ) : reportType === 'group' ? (
            <GroupReport sessions={sessions} groupStudents={groupStudents} />
          ) : (
            <StudentReport records={sessions} />
          )
        )}
      </div>
    </Layout>
  );
}

function GeneralReport({ sessions }: { sessions: any[] }) {
  const totalSessions = sessions.length;
  const allRecords = sessions.flatMap(s => s.attendance_records || []);
  const totalPresent = allRecords.filter(r => r.status === 'presente').length;
  const totalRecords = allRecords.length;
  const totalSR = sessions.reduce((acc, s) => acc + (s.sin_registro ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Sesiones"   value={totalSessions}                      color="blue" />
        <StatCard label="Registros"  value={totalRecords}                       color="gray" />
        <StatCard label="Asistencia" value={`${pct(totalPresent, totalRecords)}%`} color="green" />
        <StatCard label="Sin reg."   value={totalSR}                            color={totalSR > 0 ? 'orange' : 'gray'} />
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Grupo</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-green-600 uppercase">P</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-red-600 uppercase">A</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-yellow-600 uppercase">E</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">SR</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sessions.map(s => {
              const records = s.attendance_records || [];
              const p = records.filter((r: any) => r.status === 'presente').length;
              const a = records.filter((r: any) => r.status === 'ausente').length;
              const e = records.filter((r: any) => r.status === 'excusado').length;
              const sr = s.sin_registro ?? 0;
              return (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">
                    {new Date(s.session_date + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.group?.name || '-'}</td>
                  <td className="px-4 py-3 text-center text-green-700 font-medium">{p}</td>
                  <td className="px-4 py-3 text-center text-red-700 font-medium">{a}</td>
                  <td className="px-4 py-3 text-center text-yellow-700 font-medium">{e}</td>
                  <td className="px-4 py-3 text-center text-gray-400 font-medium">{sr > 0 ? sr : '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold">{records.length ? `${pct(p, records.length)}%` : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 px-1">P = Presente · A = Ausente · E = Excusado · SR = Sin registro</p>
    </div>
  );
}

function GroupReport({ sessions, groupStudents }: { sessions: any[]; groupStudents: any[] }) {
  const studentMap: Record<string, { name: string; code: string; present: number; absent: number; excused: number }> = {};
  sessions.forEach(s => {
    (s.attendance_records || []).forEach((r: any) => {
      const id = r.student?.id;
      if (!id) return;
      if (!studentMap[id]) studentMap[id] = { name: r.student.full_name, code: r.student.student_code, present: 0, absent: 0, excused: 0 };
      if (r.status === 'presente') studentMap[id].present++;
      else if (r.status === 'ausente') studentMap[id].absent++;
      else if (r.status === 'excusado') studentMap[id].excused++;
    });
  });
  // Agregar estudiantes del grupo sin ningún registro
  groupStudents.forEach((s: any) => {
    if (!studentMap[s.id]) studentMap[s.id] = { name: s.full_name, code: s.student_code, present: 0, absent: 0, excused: 0 };
  });
  const rows = Object.values(studentMap).sort((a, b) => a.name.localeCompare(b.name));
  const sinRegistro = rows.filter(r => r.present + r.absent + r.excused === 0).length;

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">{sessions.length} sesiones · {rows.length} estudiantes</p>
        {sinRegistro > 0 && (
          <span className="text-xs text-gray-400 italic">{sinRegistro} sin registro</span>
        )}
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estudiante</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-green-600 uppercase">P</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-red-600 uppercase">A</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-yellow-600 uppercase">E</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">%</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((r, i) => {
            const total = r.present + r.absent + r.excused;
            const sinReg = total === 0;
            const p = pct(r.present, total);
            return (
              <tr key={i} className={`hover:bg-gray-50 ${sinReg ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-400">{r.code}</p>
                </td>
                <td className="px-4 py-3 text-center text-green-700 font-medium">{sinReg ? '—' : r.present}</td>
                <td className="px-4 py-3 text-center text-red-700 font-medium">{sinReg ? '—' : r.absent}</td>
                <td className="px-4 py-3 text-center text-yellow-700 font-medium">{sinReg ? '—' : r.excused}</td>
                <td className="px-4 py-3 text-right">
                  {sinReg ? (
                    <span className="text-xs text-gray-400 italic">Sin registro</span>
                  ) : (
                    <span className={`font-bold ${p >= 75 ? 'text-green-600' : p >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {p}%
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-xs text-gray-400 px-4 py-2 border-t">P = Presente · A = Ausente · E = Excusado</p>
    </div>
  );
}

function StudentReport({ records }: { records: any[] }) {
  const present = records.filter(r => r.status === 'presente').length;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Sesiones" value={records.length} color="blue" />
        <StatCard label="Presentes" value={present} color="green" />
        <StatCard label="Asistencia" value={`${pct(present, records.length)}%`} color={pct(present, records.length) >= 75 ? 'green' : 'red'} />
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Grupo</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map((r: any) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-800">
                  {new Date((r.session?.session_date || '') + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 text-gray-600">{r.session?.group?.name || '-'}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    r.status === 'presente' ? 'bg-green-100 text-green-800' :
                    r.status === 'ausente'  ? 'bg-red-100 text-red-800' :
                                              'bg-yellow-100 text-yellow-800'
                  }`}>
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 px-1 mt-1">
        Las sesiones en las que el estudiante no fue registrado no aparecen en este listado.
      </p>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    blue:   'bg-blue-50 text-blue-700',
    green:  'bg-green-50 text-green-700',
    gray:   'bg-gray-50 text-gray-700',
    red:    'bg-red-50 text-red-700',
    orange: 'bg-orange-50 text-orange-700',
  };
  return (
    <div className={`rounded-xl p-4 text-center ${colors[color] || colors.gray}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium mt-1 opacity-75">{label}</p>
    </div>
  );
}
