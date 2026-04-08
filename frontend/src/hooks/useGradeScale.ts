import { useQuery } from '@tanstack/react-query';
import { gradeScaleAPI, GradeScale } from '../lib/supabaseApi';

// Escala por defecto mientras carga o si hay error
const DEFAULT_SCALE: GradeScale[] = [
  { score: 1, label: 'Deficiente', color: 'red' },
  { score: 2, label: 'Regular',    color: 'orange' },
  { score: 3, label: 'Bueno',      color: 'yellow' },
  { score: 4, label: 'Muy bueno',  color: 'blue' },
  { score: 5, label: 'Excelente',  color: 'green' },
];

// Mapeo de color (string) → clases Tailwind
export const COLOR_CLASSES: Record<string, { bg: string; text: string; border: string }> = {
  red:    { bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-300' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  blue:   { bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-300' },
  green:  { bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-300' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  gray:   { bg: 'bg-gray-100',   text: 'text-gray-700',   border: 'border-gray-300' },
};

// Mapa estático para uso fuera de hooks React (ej: exportar PDF)
export const DEFAULT_SCALE_MAP: Record<number, { label: string }> = Object.fromEntries(
  DEFAULT_SCALE.map(s => [s.score, { label: s.label }])
);

export function useGradeScale() {
  const { data = DEFAULT_SCALE } = useQuery({
    queryKey: ['grade-scale'],
    queryFn: gradeScaleAPI.getAll,
    staleTime: 5 * 60 * 1000, // cache 5 minutos
  });

  // Mapa score → { label, color, clases }
  const scaleMap = Object.fromEntries(
    data.map(s => [
      s.score,
      {
        label: s.label,
        color: s.color,
        ...(COLOR_CLASSES[s.color] ?? COLOR_CLASSES.gray),
      },
    ])
  );

  return { scale: data, scaleMap };
}
