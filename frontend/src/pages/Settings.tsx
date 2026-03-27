import { useState } from 'react';
import Layout from '../components/Layout';
import ImageUpload from '../components/ImageUpload';
import { uploadLogo } from '../lib/storageApi';
import { supabase } from '../lib/supabaseClient';
import { Settings as SettingsIcon, Upload, CheckCircle, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Settings() {
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Cambio de contraseña
  const [pwForm, setPwForm] = useState({ nueva: '', confirmar: '' });
  const [showNueva, setShowNueva] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  async function handleCambiarPassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);

    if (pwForm.nueva.length < 8) {
      return setPwError('La contraseña debe tener mínimo 8 caracteres.');
    }
    if (pwForm.nueva !== pwForm.confirmar) {
      return setPwError('Las contraseñas no coinciden.');
    }

    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwForm.nueva });
    setPwLoading(false);

    if (error) {
      setPwError(error.message || 'Error al cambiar la contraseña.');
    } else {
      setPwSuccess(true);
      setPwForm({ nueva: '', confirmar: '' });
    }
  }

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
            <SettingsIcon className="w-8 h-8 text-blue-600" />
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

        {/* Cambio de contraseña */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Lock className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Cambiar contraseña</h2>
              <p className="text-sm text-gray-500">Actualiza tu contraseña de acceso al sistema</p>
            </div>
          </div>

          {pwSuccess && (
            <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-green-800 text-sm">Contraseña actualizada exitosamente.</p>
            </div>
          )}

          {pwError && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{pwError}</p>
            </div>
          )}

          <form onSubmit={handleCambiarPassword} className="max-w-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nueva contraseña <span className="text-gray-400 font-normal">(mín. 8 caracteres)</span>
              </label>
              <div className="relative">
                <input
                  type={showNueva ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  value={pwForm.nueva}
                  onChange={e => setPwForm(p => ({ ...p, nueva: e.target.value }))}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowNueva(v => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400">
                  {showNueva ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmar ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  value={pwForm.confirmar}
                  onChange={e => setPwForm(p => ({ ...p, confirmar: e.target.value }))}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowConfirmar(v => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400">
                  {showConfirmar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={pwLoading}
              className="btn-primary w-full">
              {pwLoading ? 'Actualizando…' : 'Cambiar contraseña'}
            </button>
          </form>
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
