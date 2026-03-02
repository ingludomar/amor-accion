import { useState } from 'react';
import Layout from '../components/Layout';
import ImageUpload from '../components/ImageUpload';
import { uploadLogo } from '../lib/storageApi';
import { Settings, Upload, CheckCircle } from 'lucide-react';

export default function Settings() {
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleLogoUpload = async (file: File) => {
    try {
      setUploadError(null);
      await uploadLogo(file);
      setUploadSuccess(true);
      
      // Recargar página después de 2 segundos para mostrar nuevo logo
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error uploading logo:', error);
      setUploadError('Error al subir el logo. Intenta de nuevo.');
      throw error;
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            Configuración
          </h1>
          <p className="text-gray-600 mt-2">
            Personaliza el sistema según tus necesidades
          </p>
        </div>

        {/* Logo Upload Section */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Logo de la Organización</h2>
              <p className="text-sm text-gray-500">
                Sube el logo de Amor Acción para mostrarlo en el sistema
              </p>
            </div>
          </div>

          {uploadSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800">
                Logo subido exitosamente. Recargando...
              </p>
            </div>
          )}

          {uploadError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-800">{uploadError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Subir Logo
              </label>
              <ImageUpload
                onUpload={handleLogoUpload}
                aspectRatio="square"
                maxSizeMB={2}
              />
              <p className="text-xs text-gray-500 mt-3">
                Formatos aceptados: PNG, JPG, SVG. Máximo 2MB.
                <br />
                Se recomienda una imagen cuadrada con fondo transparente.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Recomendaciones:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  Usa una imagen con fondo transparente (PNG) para mejor apariencia
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  Dimensiones recomendadas: 512x512 píxeles
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  El logo se mostrará en el header de todas las páginas
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  Puedes actualizar el logo cuando lo necesites
                </li>
              </ul>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> El logo se almacena de forma segura en Supabase Storage 
                  y estará disponible inmediatamente después de subirlo.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Storage Info */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
          <h3 className="font-semibold text-indigo-900 mb-2">
            Almacenamiento en Supabase
          </h3>
          <p className="text-sm text-indigo-700">
            Las imágenes se almacenan en Supabase Storage con las siguientes características:
          </p>
          <ul className="mt-3 space-y-1 text-sm text-indigo-600">
            <li>✓ 1GB de almacenamiento gratuito</li>
            <li>✓ URLs públicas para imágenes</li>
            <li>✓ Acceso seguro con políticas RLS</li>
            <li>✓ Optimización automática de imágenes</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
