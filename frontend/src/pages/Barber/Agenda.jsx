import React, { useState, useEffect, useCallback } from 'react';
import { Calendar as CalIcon } from 'lucide-react';
import BarberSidebar from '../../components/BarberSidebar';
import api from '../../services/api';

const STATUS_LABELS = {
  pending:   { label: 'Pendente',   color: '#f59e0b' },
  confirmed: { label: 'Confirmado', color: '#22c55e' },
  completed: { label: 'Concluído',  color: '#818cf8' },
  cancelled: { label: 'Cancelado',  color: '#ef4444' },
  blocked:   { label: 'Bloqueado',  color: '#6b7280' },
};

const BarberAgenda = () => {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('barberToken');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAgenda = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/barber/me/agenda?date=${date}`, { headers });
      setAppointments(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [date]);

  useEffect(() => { fetchAgenda(); }, [fetchAgenda]);

  return (
    <BarberSidebar>
      <div className="animate-in fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-display font-bold">Minha Agenda</h1>
          <div className="relative">
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="input-field py-2 pl-10 pr-4 w-48" />
            <CalIcon className="absolute left-3 top-1/2 -translate-y-1/2" size={18}
              style={{ color: 'var(--color-barber-gray)' }} />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10" style={{ color: 'var(--color-barber-gray)' }}>Carregando...</div>
        ) : appointments.length === 0 ? (
          <div className="card text-center py-16">
            <CalIcon size={40} className="mx-auto mb-4" style={{ color: 'var(--color-barber-gray)' }} />
            <p style={{ color: 'var(--color-barber-gray)' }}>Nenhum agendamento para esta data.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map(a => {
              const st = STATUS_LABELS[a.status] || STATUS_LABELS.pending;
              return (
                <div key={a._id} className="card flex items-center gap-4"
                  style={{ borderLeft: `3px solid ${st.color}` }}>
                  <p className="text-2xl font-display font-bold w-16 shrink-0"
                    style={{ color: 'var(--color-barber-gold)' }}>{a.time}</p>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold">{a.client_id?.name || 'Cliente'}</p>
                    <p className="text-sm" style={{ color: 'var(--color-barber-gray)' }}>
                      {a.service?.name || 'Serviço'}
                    </p>
                    {a.client_id?.phone && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-barber-gray)' }}>{a.client_id.phone}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full"
                      style={{ backgroundColor: `${st.color}20`, color: st.color }}>
                      {st.label}
                    </span>
                    {a.price && (
                      <p className="text-sm font-bold mt-1" style={{ color: '#22c55e' }}>
                        R$ {a.price}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </BarberSidebar>
  );
};

export default BarberAgenda;
