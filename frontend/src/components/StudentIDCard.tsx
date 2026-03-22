/**
 * Student ID Card — responsive preview + share/download
 */
import { useRef, useState } from 'react';
import { X, Download, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import type { Student, Campus } from '../lib/api';

interface StudentIDCardProps {
  student: Student;
  campus: Campus;
  onClose: () => void;
}

export default function StudentIDCard({ student, campus, onClose }: StudentIDCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  // Generate canvas from card
  const generateCanvas = async () => {
    if (!cardRef.current) throw new Error('No card ref');
    return html2canvas(cardRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
    });
  };

  const downloadAsImage = async () => {
    try {
      const canvas = await generateCanvas();
      const link = document.createElement('a');
      link.download = `carnet_${student.student_code}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      alert('Error al descargar el carnet');
    }
  };

  const shareOrDownload = async () => {
    setSharing(true);
    try {
      const canvas = await generateCanvas();

      // Try Web Share API (mobile browsers)
      if (navigator.canShare) {
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(b => (b ? resolve(b) : reject(new Error('blob'))), 'image/png');
        });
        const file = new File([blob], `carnet_${student.student_code}.png`, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Carnet de ${student.full_name}`,
            text: `Carnet estudiantil — ${campus.name}`,
            files: [file],
          });
          return;
        }
      }

      // Fallback: download
      const link = document.createElement('a');
      link.download = `carnet_${student.student_code}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e: any) {
      // User cancelled share — not an error
      if (e?.name !== 'AbortError') alert('Error al compartir');
    } finally {
      setSharing(false);
    }
  };

  const primaryGuardian = student.guardians?.find(g => g.is_primary) || student.guardians?.[0];
  const verifyUrl = `${window.location.origin}/verify/${student.student_code}`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/60">
      {/* Header */}
      <div className="flex items-center justify-between bg-white px-4 py-3 shadow">
        <div>
          <p className="font-semibold text-gray-900">{student.full_name}</p>
          <p className="text-xs text-gray-500">{student.student_code}</p>
        </div>
        <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800">
          <X size={22} />
        </button>
      </div>

      {/* Scrollable area */}
      <div className="flex-1 overflow-auto flex flex-col items-center py-4 px-2">

        {/* Card — fixed 856×540, scaled to fit screen width */}
        <div
          className="origin-top"
          style={{
            width: '856px',
            transform: `scale(${Math.min(1, (window.innerWidth - 16) / 856)})`,
            transformOrigin: 'top center',
            marginBottom: `calc(${Math.min(1, (window.innerWidth - 16) / 856)} * 540px - 540px)`,
          }}
        >
          <div
            ref={cardRef}
            className="relative bg-white shadow-2xl rounded-xl overflow-hidden"
            style={{ width: '856px', height: '540px', border: '2px solid #e5e7eb' }}
          >
            {/* Logo watermark */}
            {campus.logo_url && (
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <img src={campus.logo_url} alt="" className="w-96 h-96 object-contain" />
              </div>
            )}

            <div className="relative h-full p-8 flex flex-col">
              {/* Card header */}
              <div className="flex items-center justify-between mb-6">
                {campus.logo_url && (
                  <img src={campus.logo_url} alt={campus.name} className="h-16 object-contain" />
                )}
                <div className="text-right">
                  <h3 className="text-xl font-bold text-gray-900">{campus.name}</h3>
                  <p className="text-sm text-gray-600">{campus.city || ''}</p>
                </div>
              </div>

              <div className="border-t-2 border-gray-200 mb-6" />

              {/* Main content */}
              <div className="flex gap-6 flex-1">
                {/* Left — photo + QR */}
                <div className="flex flex-col items-center">
                  <div className="w-48 h-56 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300 mb-4">
                    {student.photo_url ? (
                      <img src={student.photo_url} alt={student.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">👤</div>
                    )}
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-300">
                    <QRCodeSVG value={verifyUrl} size={80} />
                  </div>
                </div>

                {/* Right — info */}
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
                          {student.birth_date
                            ? new Date(student.birth_date).toLocaleDateString('es-CO')
                            : '—'}
                        </p>
                      </div>
                    </div>
                    {primaryGuardian && (
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Contacto de Emergencia</p>
                        <p className="text-sm font-medium text-gray-900">{primaryGuardian.full_name}</p>
                        {primaryGuardian.phone_mobile && (
                          <p className="text-sm text-gray-600">{primaryGuardian.phone_mobile}</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-4">
                    <p>Válido para el año en curso</p>
                    <p>En caso de pérdida, reportar inmediatamente</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons — sticky bottom */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex gap-3">
        <button
          onClick={shareOrDownload}
          disabled={sharing}
          className="btn-primary flex-1"
        >
          <Share2 size={18} />
          {sharing ? 'Compartiendo…' : 'Compartir'}
        </button>
        <button
          onClick={downloadAsImage}
          className="btn-secondary flex-1"
        >
          <Download size={18} />
          Descargar
        </button>
      </div>
    </div>
  );
}
