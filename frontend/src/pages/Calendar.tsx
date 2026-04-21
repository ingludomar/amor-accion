import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { calendarAPI, topicAPI, campusAPI, CalendarEvent, EventType } from '../lib/supabaseApi';
import { usePermission } from '../hooks/usePermission';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X,
  MapPin, Clock, Edit2, Trash2, BookOpen, Users, PartyPopper, Footprints, Coffee, Star,
} from 'lucide-react';

const EVENT_TYPES: Record<EventType, { label: string; icon: any; color: string; bg: string }> = {
  jornada:  { label: 'Jornada',      icon: PartyPopper, color: 'text-purple-700', bg: 'bg-purple-100' },
  paseo:    { label: 'Paseo',        icon: Footprints,  color: 'text-green-700',  bg: 'bg-green-100'  },
  reunion:  { label: 'Reunión',      icon: Coffee,      color: 'text-orange-700', bg: 'bg-orange-100' },
  festivo:  { label: 'Festivo',      icon: Star,        color: 'text-red-700',    bg: 'bg-red-100'    },
  otro:     { label: 'Otro',         icon: CalendarIcon, color: 'text-gray-700',   bg: 'bg-gray-100'   },
};

function pad2(n: number) { return n.toString().padStart(2, '0'); }
function toDateStr(d: Date) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }

export default function CalendarPage() {
  const perm = usePermission('calendar');
  const queryClient = useQueryClient();
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string>(toDateStr(today));
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Rango del mes visible (incluye días del mes anterior/siguiente mostrados en la cuadrícula)
  const firstDay = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const lastDay  = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  const startWeekday = firstDay.getDay(); // 0 = domingo
  const rangeStart = new Date(firstDay);
  rangeStart.setDate(rangeStart.getDate() - startWeekday);
  const rangeEnd = new Date(lastDay);
  rangeEnd.setDate(rangeEnd.getDate() + (6 - lastDay.getDay()));

  const { data: events = [] } = useQuery({
    queryKey: ['calendar-events', toDateStr(rangeStart), toDateStr(rangeEnd)],
    queryFn: () => calendarAPI.getByRange(toDateStr(rangeStart), toDateStr(rangeEnd)),
  });

  const { data: topicsResp } = useQuery({
    queryKey: ['topics-all'],
    queryFn: () => topicAPI.getAll(),
  });
  const topics = topicsResp?.data ?? [];

  const { data: campuses = [] } = useQuery({
    queryKey: ['campuses-active'],
    queryFn: async () => { const { data } = await campusAPI.getAll({ is_active: true }); return data; },
  });

  // Mapa: fecha → eventos
  const eventsByDate: Record<string, CalendarEvent[]> = {};
  events.forEach(e => {
    if (!eventsByDate[e.event_date]) eventsByDate[e.event_date] = [];
    eventsByDate[e.event_date].push(e);
  });

  // Mapa: fecha → temas planificados
  const topicsByDate: Record<string, any[]> = {};
  topics.forEach((t: any) => {
    if (!t.planned_date) return;
    if (!topicsByDate[t.planned_date]) topicsByDate[t.planned_date] = [];
    topicsByDate[t.planned_date].push(t);
  });

  const deleteEvent = useMutation({
    mutationFn: (id: string) => calendarAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['calendar-events'] }),
  });

  const openNew = () => {
    setEditingEvent(null);
    setFormOpen(true);
  };

  const openEdit = (ev: CalendarEvent) => {
    setEditingEvent(ev);
    setFormOpen(true);
  };

  const days: Date[] = [];
  const cur = new Date(rangeStart);
  while (cur <= rangeEnd) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }

  const selectedDayEvents = eventsByDate[selectedDate] || [];
  const selectedDayTopics = topicsByDate[selectedDate] || [];
  const monthName = cursor.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });

  return (
    <Layout>
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            Calendario
          </h1>
          {perm.canCreate && (
            <button onClick={openNew} className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> Nuevo evento
            </button>
          )}
        </div>

        {/* Navegación de mes */}
        <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="font-bold text-gray-900 capitalize">{monthName}</h2>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Cuadrícula del calendario */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-100">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((d, i) => {
              const dateStr = toDateStr(d);
              const isCurrentMonth = d.getMonth() === cursor.getMonth();
              const isToday = dateStr === toDateStr(today);
              const isSelected = dateStr === selectedDate;
              const dayEvents = eventsByDate[dateStr] || [];
              const dayTopics = topicsByDate[dateStr] || [];
              const hasItems = dayEvents.length + dayTopics.length > 0;

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`min-h-[70px] p-1.5 border-r border-b border-gray-50 text-left transition ${
                    !isCurrentMonth ? 'bg-gray-50 text-gray-300' : 'hover:bg-blue-50/40'
                  } ${isSelected ? 'bg-blue-50 ring-2 ring-blue-400 ring-inset' : ''}`}
                >
                  <div className={`text-xs font-semibold mb-1 ${
                    isToday ? 'w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center' :
                    !isCurrentMonth ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {d.getDate()}
                  </div>

                  {/* Puntos/etiquetas de eventos */}
                  {hasItems && (
                    <div className="space-y-0.5">
                      {dayTopics.slice(0, 2).map((t: any) => (
                        <div key={'t-' + t.id} className="text-[10px] px-1 py-0.5 bg-blue-100 text-blue-700 rounded truncate" title={t.title}>
                          <BookOpen className="w-2.5 h-2.5 inline mr-0.5" />
                          {t.title}
                        </div>
                      ))}
                      {dayEvents.slice(0, 2 - Math.min(2, dayTopics.length)).map(e => {
                        const cfg = EVENT_TYPES[e.event_type];
                        return (
                          <div key={'e-' + e.id} className={`text-[10px] px-1 py-0.5 rounded truncate ${cfg.bg} ${cfg.color}`} title={e.title}>
                            {e.title}
                          </div>
                        );
                      })}
                      {(dayEvents.length + dayTopics.length) > 2 && (
                        <div className="text-[10px] text-gray-400">+{dayEvents.length + dayTopics.length - 2} más</div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detalle del día seleccionado */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-3">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </h3>

          {selectedDayTopics.length === 0 && selectedDayEvents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Sin actividades programadas</p>
          ) : (
            <div className="space-y-2">
              {/* Temas / Clases */}
              {selectedDayTopics.map((t: any) => (
                <div key={t.id} className="flex items-start gap-3 p-3 rounded-xl border border-blue-100 bg-blue-50/50">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{t.title}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                      <Users className="w-3 h-3" /> {t.group?.name}
                      {t.is_done && <span className="text-green-600 font-medium">· Realizado</span>}
                    </p>
                  </div>
                </div>
              ))}

              {/* Eventos especiales */}
              {selectedDayEvents.map(e => {
                const cfg = EVENT_TYPES[e.event_type];
                const Icon = cfg.icon;
                return (
                  <div key={e.id} className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.bg} border-transparent`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/80`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-medium text-gray-900 text-sm">{e.title}</p>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      {e.description && <p className="text-xs text-gray-600">{e.description}</p>}
                      <div className="text-xs text-gray-500 flex items-center gap-3 mt-1 flex-wrap">
                        {e.event_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {e.event_time.slice(0, 5)}</span>}
                        {e.campus && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {e.campus.name}</span>}
                      </div>
                    </div>
                    {perm.canEdit && (
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => openEdit(e)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {perm.canDelete && (
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar "${e.title}"?`)) deleteEvent.mutate(e.id);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {formOpen && (
        <EventForm
          initialDate={selectedDate}
          event={editingEvent}
          campuses={campuses}
          onClose={() => { setFormOpen(false); setEditingEvent(null); }}
          onSaved={() => queryClient.invalidateQueries({ queryKey: ['calendar-events'] })}
        />
      )}
    </Layout>
  );
}

// ─── Formulario de evento ─────────────────────────────────────────
interface EventFormProps {
  initialDate: string;
  event: CalendarEvent | null;
  campuses: any[];
  onClose: () => void;
  onSaved: () => void;
}

function EventForm({ initialDate, event, campuses, onClose, onSaved }: EventFormProps) {
  const [form, setForm] = useState({
    title:       event?.title       || '',
    description: event?.description || '',
    event_date:  event?.event_date  || initialDate,
    event_time:  event?.event_time  || '',
    event_type:  event?.event_type  || 'jornada' as EventType,
    campus_id:   event?.campus_id   || '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title:       form.title.trim(),
        description: form.description.trim() || undefined,
        event_date:  form.event_date,
        event_time:  form.event_time || undefined,
        event_type:  form.event_type,
        campus_id:   form.campus_id || undefined,
      };
      if (event) {
        await calendarAPI.update(event.id, payload);
      } else {
        await calendarAPI.create(payload);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{event ? 'Editar evento' : 'Nuevo evento'}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Título *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="input-field"
              placeholder="Ej: Jornada de integración"
              required
            />
          </div>

          <div>
            <label className="label">Tipo</label>
            <div className="grid grid-cols-5 gap-1.5">
              {(Object.entries(EVENT_TYPES) as [EventType, any][]).map(([type, cfg]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, event_type: type }))}
                  className={`py-2 px-1 rounded-lg text-xs font-medium border-2 transition ${
                    form.event_type === type
                      ? `${cfg.bg} ${cfg.color} border-current`
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Fecha *</label>
              <input
                type="date"
                value={form.event_date}
                onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Hora <span className="text-gray-400 font-normal">(opcional)</span></label>
              <input
                type="time"
                value={form.event_time}
                onChange={e => setForm(f => ({ ...f, event_time: e.target.value }))}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="label">Sede <span className="text-gray-400 font-normal">(opcional)</span></label>
            <select
              value={form.campus_id}
              onChange={e => setForm(f => ({ ...f, campus_id: e.target.value }))}
              className="input-field"
            >
              <option value="">Todas las sedes</option>
              {campuses.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Descripción <span className="text-gray-400 font-normal">(opcional)</span></label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="input-field min-h-[70px]"
              placeholder="Detalles del evento..."
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Guardando...' : event ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
