import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (file: File) => Promise<void>;
  currentImage?: string;
  onClear?: () => void;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  maxSizeMB?: number;
}

export default function ImageUpload({
  onUpload,
  currentImage,
  onClear,
  aspectRatio = 'square',
  maxSizeMB = 2,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
  };

  const handleFileSelect = async (file: File) => {
    // Validar tamaño
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`El archivo debe ser menor a ${maxSizeMB}MB`);
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Subir
    setIsUploading(true);
    try {
      await onUpload(file);
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClear = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClear?.();
  };

  return (
    <div className="w-full">
      {preview ? (
        <div className={`relative ${aspectRatioClasses[aspectRatio]} rounded-2xl overflow-hidden bg-gray-100 group`}>
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition"
              disabled={isUploading}
            >
              <Upload className="w-5 h-5" />
            </button>
            <button
              onClick={handleClear}
              className="p-3 bg-red-500 rounded-full text-white hover:bg-red-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`
            ${aspectRatioClasses[aspectRatio]}
            rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer
            flex flex-col items-center justify-center gap-3
            ${isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
            }
          `}
        >
          <div className="p-4 bg-white rounded-full shadow-sm">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              {isDragging ? 'Suelta la imagen aquí' : 'Arrastra una imagen o haz clic'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Máximo {maxSizeMB}MB
            </p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
      />
    </div>
  );
}
