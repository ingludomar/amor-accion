import { useQuery } from '@tanstack/react-query';
import { genderStatsAPI } from '../lib/supabaseApi';
import { Users, Building2, GraduationCap } from 'lucide-react';

interface GenderStatsWidgetProps {
  title?: string;
  compact?: boolean;
}

export default function GenderStatsWidget({ title, compact = false }: GenderStatsWidgetProps) {
  const { data: byCampus = [] } = useQuery({
    queryKey: ['gender-stats-campus'],
    queryFn: genderStatsAPI.byCampus,
  });

  const { data: byGroup = [] } = useQuery({
    queryKey: ['gender-stats-group'],
    queryFn: genderStatsAPI.byGroup,
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      {title && (
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">{title}</h2>
        </div>
      )}

      <div className={compact ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-6'}>
        {/* Por Sede */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" /> Por Sede
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="text-left py-2 font-medium">Sede</th>
                <th className="text-center py-2 font-medium text-blue-600">Niños</th>
                <th className="text-center py-2 font-medium text-pink-600">Niñas</th>
                <th className="text-center py-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {byCampus.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-3 text-gray-400 text-xs">Sin datos</td></tr>
              ) : byCampus.map(s => (
                <tr key={s.label} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 font-medium text-gray-800">{s.label}</td>
                  <td className="text-center py-2 text-blue-700 font-semibold">{s.male}</td>
                  <td className="text-center py-2 text-pink-700 font-semibold">{s.female}</td>
                  <td className="text-center py-2 font-bold text-gray-900">{s.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Por Grupo */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" /> Por Grupo
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="text-left py-2 font-medium">Grupo</th>
                <th className="text-center py-2 font-medium text-blue-600">Niños</th>
                <th className="text-center py-2 font-medium text-pink-600">Niñas</th>
                <th className="text-center py-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {byGroup.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-3 text-gray-400 text-xs">Sin datos</td></tr>
              ) : byGroup.map(s => (
                <tr key={s.label} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 font-medium text-gray-800">{s.label}</td>
                  <td className="text-center py-2 text-blue-700 font-semibold">{s.male}</td>
                  <td className="text-center py-2 text-pink-700 font-semibold">{s.female}</td>
                  <td className="text-center py-2 font-bold text-gray-900">{s.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
