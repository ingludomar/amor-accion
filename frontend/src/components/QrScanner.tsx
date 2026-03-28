import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, CheckCircle2, AlertTriangle } from 'lucide-react';

interface QrScannerProps {
  onScan: (studentCode: string) => void;
  onClose: () => void;
  lastResult?: { name: string; status: 'success' | 'already' | 'not_found' } | null;
}

export default function QrScanner({ onScan, onClose, lastResult }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState('');
  const cooldownRef = useRef(false);

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        if (cooldownRef.current) return;
        cooldownRef.current = true;
        setTimeout(() => { cooldownRef.current = false; }, 1500);

        // Extraer student_code de la URL o texto directo
        let code = decodedText;
        const match = decodedText.match(/\/verify\/(.+)$/);
        if (match) code = match[1];

        onScan(code);
      },
      () => { /* silenciar errores de frames sin QR */ },
    ).catch((err) => {
      setError(
        err?.toString().includes('NotAllowed')
          ? 'Permiso de cámara denegado. Habilita el acceso a la cámara en la configuración del navegador.'
          : 'No se pudo acceder a la cámara. Verifica que tu dispositivo tenga cámara disponible.',
      );
    });

    return () => {
      scanner.isScanning && scanner.stop().catch(() => {});
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-900">Escanear QR</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Camera view */}
        <div className="relative bg-black">
          <div id="qr-reader" className="w-full" />
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 p-6">
              <div className="text-center">
                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                <p className="text-white text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Resultado del último escaneo */}
        {lastResult && (
          <div className={`p-4 flex items-center gap-3 ${
            lastResult.status === 'success'   ? 'bg-green-50'  :
            lastResult.status === 'already'   ? 'bg-blue-50'   :
                                                'bg-red-50'
          }`}>
            {lastResult.status === 'success' ? (
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
            ) : lastResult.status === 'already' ? (
              <CheckCircle2 className="w-6 h-6 text-blue-500 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
            )}
            <div>
              <p className={`font-semibold text-sm ${
                lastResult.status === 'success'   ? 'text-green-800' :
                lastResult.status === 'already'   ? 'text-blue-800'  :
                                                    'text-red-800'
              }`}>
                {lastResult.status === 'success'   ? 'Presente' :
                 lastResult.status === 'already'   ? 'Ya registrado' :
                                                     'No encontrado'}
              </p>
              <p className={`text-xs ${
                lastResult.status === 'success'   ? 'text-green-600' :
                lastResult.status === 'already'   ? 'text-blue-600'  :
                                                    'text-red-600'
              }`}>
                {lastResult.name}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t text-center">
          <p className="text-xs text-gray-400">Apunta al QR del carnet del estudiante</p>
        </div>
      </div>
    </div>
  );
}
