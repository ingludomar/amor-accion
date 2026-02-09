import { useRef } from 'react';
import { X, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { Student, Campus } from '../lib/api';

interface StudentIDCardProps {
  student: Student;
  campus: Campus;
  onClose: () => void;
}

export default function StudentIDCard({ student, campus, onClose }: StudentIDCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadAsImage = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `carnet_${student.student_code}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error al generar imagen:', error);
      alert('Error al descargar el carnet como imagen');
    }
  };

  const downloadAsPDF = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // Tamaño de carnet CR80: 85.6mm x 53.98mm
      const imgWidth = 85.6;
      const imgHeight = 53.98;

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [imgWidth, imgHeight],
      });

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`carnet_${student.student_code}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al descargar el carnet como PDF');
    }
  };

  // Obtener acudiente principal para contacto de emergencia
  const primaryGuardian = student.guardians?.find(g => g.is_primary) || student.guardians?.[0];

  // URL para verificación del carnet
  const verifyUrl = `${window.location.origin}/verify/${student.student_code}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Carnet Estudiantil</h2>
            <p className="text-sm text-gray-500 mt-1">{student.student_code} - {student.full_name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Carnet Preview */}
          <div className="flex justify-center mb-6">
            <div
              ref={cardRef}
              className="relative bg-white shadow-2xl rounded-xl overflow-hidden"
              style={{
                width: '856px',
                height: '540px',
                border: '2px solid #e5e7eb',
              }}
            >
              {/* Logo de fondo (marca de agua) */}
              {campus.logo_url && (
                <div className="absolute inset-0 flex items-center justify-center opacity-5">
                  <img
                    src={campus.logo_url}
                    alt="Logo"
                    className="w-96 h-96 object-contain"
                  />
                </div>
              )}

              {/* Contenido del carnet */}
              <div className="relative h-full p-8 flex flex-col">
                {/* Header del carnet */}
                <div className="flex items-center justify-between mb-6">
                  {campus.logo_url && (
                    <img
                      src={campus.logo_url}
                      alt={campus.name}
                      className="h-16 object-contain"
                    />
                  )}
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-gray-900">{campus.name}</h3>
                    <p className="text-sm text-gray-600">{campus.city || ''}</p>
                  </div>
                </div>

                {/* Línea separadora */}
                <div className="border-t-2 border-gray-200 mb-6"></div>

                {/* Contenido principal */}
                <div className="flex gap-6 flex-1">
                  {/* Columna izquierda - Foto */}
                  <div className="flex flex-col items-center">
                    <div className="w-48 h-56 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300 mb-4">
                      {student.photo_url ? (
                        <img
                          src={student.photo_url}
                          alt={student.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-4xl">👤</span>
                        </div>
                      )}
                    </div>

                    {/* QR Code */}
                    <div className="bg-white p-2 rounded border border-gray-300">
                      <QRCodeSVG value={verifyUrl} size={80} />
                    </div>
                  </div>

                  {/* Columna derecha - Información */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Código</p>
                        <p className="text-2xl font-bold text-gray-900">{student.student_code}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Nombre Completo</p>
                        <p className="text-lg font-semibold text-gray-900">{student.full_name}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Tipo de Sangre</p>
                          <p className="text-base font-medium text-red-600">{student.blood_type || 'N/A'}</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Fecha de Nacimiento</p>
                          <p className="text-base font-medium text-gray-900">
                            {new Date(student.birth_date).toLocaleDateString('es-CO')}
                          </p>
                        </div>
                      </div>

                      {/* Contacto de emergencia */}
                      {primaryGuardian && (
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Contacto de Emergencia</p>
                          <p className="text-sm font-medium text-gray-900">{primaryGuardian.full_name}</p>
                          {primaryGuardian.phone && (
                            <p className="text-sm text-gray-600">{primaryGuardian.phone}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer info */}
                    <div className="text-xs text-gray-400 mt-4">
                      <p>Válido para el año escolar en curso</p>
                      <p>En caso de pérdida, reportar inmediatamente</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de descarga */}
          <div className="flex justify-center gap-4">
            <button
              onClick={downloadAsImage}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Download size={20} />
              Descargar como Imagen
            </button>
            <button
              onClick={downloadAsPDF}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Download size={20} />
              Descargar como PDF
            </button>
          </div>

          {/* Nota informativa */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Nota:</strong> El código QR permite verificar la autenticidad del carnet escaneándolo con cualquier
              dispositivo móvil. El carnet tiene dimensiones estándar CR80 (85.6mm x 53.98mm) para impresión.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
