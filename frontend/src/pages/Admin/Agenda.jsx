import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Check, X, Search, Undo2 } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../services/api';

const Agenda = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [agenda, setAgenda] = useState([]);
  const [loading, setLoading] = useState(false);
  const [barbers, setBarbers] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState('');

  useEffect(() => {
    api.get('/barbers/admin').then(r => setBarbers(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    fetchAgenda();
  }, [date, selectedBarber]);

  const fetchAgenda = async () => {
    setLoading(true);
    try {
      const url = selectedBarber
        ? `/appointments?date=${date}&barber_id=${selectedBarber}`
        : `/appointments?date=${date}`;
      const { data } = await api.get(url);
      setAgenda(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      fetchAgenda(); // refresh list
    } catch (error) {
      alert('Erro ao atualizar status do agendamento');
    }
  };

  const handleBlockTime = async (time) => {
    try {
      await api.post(`/appointments/block`, { date, time, barber_id: selectedBarber || undefined });
      fetchAgenda();
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao bloquear horário');
    }
  };

  return (
    <AdminSidebar>
      <div className="animate-in fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-display font-bold">Agenda Diária</h1>
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* Barber Filter */}
            {barbers.length > 0 && (
              <select
                value={selectedBarber}
                onChange={e => setSelectedBarber(e.target.value)}
                className="input-field py-2 pr-8 w-48"
              >
                <option value="">Todos os Barbeiros</option>
                {barbers.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            )}
            <div className="relative">
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field py-2 pl-10 pr-4 w-48 bg-barber-dark border-barber-light"
              />
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-barber-gray" size={18} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Horários</h2>
            <div className="flex space-x-3 text-sm">
              <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>Concluído</span>
              <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-barber-gold mr-2"></span>Pendente</span>
              <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>Cancelado</span>
              <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-barber-dark mr-2 border border-barber-gray"></span>Bloqueado</span>
              <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-barber-light mr-2"></span>Livre</span>
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-10 text-barber-gray">Carregando horários...</div>
            ) : (
              (() => {
                const defaultTimes = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
                return defaultTimes.map(time => {
                  // Prioritize active appointments for this slot. If none, fallback to a cancelled one.
                  const appt = agenda.find(a => a.time === time && a.status !== 'cancelled') 
                               || agenda.find(a => a.time === time);
                  if (appt) {
                    return (
                      <div 
                        key={appt._id} 
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          appt.status === 'completed' ? 'border-green-500/30 bg-green-500/5' :
                          appt.status === 'cancelled' ? 'border-red-500/30 bg-red-500/5' :
                          appt.status === 'blocked' ? 'border-barber-gray/50 bg-barber-dark/50 opacity-80' :
                          'border-barber-gold/30 bg-barber-gold/5'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="font-bold text-lg w-16 text-barber-gray flex items-center">
                            <Clock size={16} className="mr-1" /> {appt.time}
                          </div>
                          <div>
                            {appt.status === 'blocked' ? (
                              <p className="font-bold text-barber-gray text-lg italic">Horário Bloqueado</p>
                            ) : (
                              <>
                                <p className="font-bold text-white text-lg">{appt.client_id?.name || 'Cliente'}</p>
                                <p className="text-sm text-barber-gold font-medium">{appt.service?.name || 'Serviço'}</p>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          {appt.status === 'pending' && (
                            <>
                              <button onClick={() => handleStatusChange(appt._id, 'completed')} className="p-2 bg-green-500/20 text-green-500 rounded hover:bg-green-500 hover:text-white transition-colors" title="Marcar como Concluído">
                                <Check size={20} />
                              </button>
                              <button onClick={() => handleStatusChange(appt._id, 'cancelled')} className="p-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors" title="Cancelar Agendamento">
                                <X size={20} />
                              </button>
                            </>
                          )}
                          {(appt.status === 'completed' || appt.status === 'cancelled') && (
                            <button onClick={() => handleStatusChange(appt._id, 'pending')} className="p-2 bg-barber-gold/20 text-barber-gold rounded hover:bg-barber-gold hover:text-white transition-colors" title="Reverter para Pendente">
                              <Undo2 size={20} />
                            </button>
                          )}
                          {appt.status === 'blocked' && (
                            <button onClick={() => handleStatusChange(appt._id, 'cancelled')} className="px-3 py-2 bg-barber-gray/20 text-white rounded hover:bg-white hover:text-black font-medium transition-colors text-sm" title="Liberar Horário">
                              Reabrir Horário
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div 
                        key={time} 
                        className="flex items-center justify-between p-4 rounded-lg border border-dashed border-barber-light bg-barber-black/50"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="font-bold text-lg w-16 text-barber-gray flex items-center">
                            <Clock size={16} className="mr-1" /> {time}
                          </div>
                          <span className="text-barber-gray italic font-medium">Horário Livre</span>
                        </div>
                        <div className="flex space-x-2">
                          <button onClick={() => handleBlockTime(time)} className="px-4 py-2 bg-barber-dark border border-barber-light rounded text-sm hover:border-barber-gold transition-colors">
                            Bloquear Horário
                          </button>
                        </div>
                      </div>
                    );
                  }
                });
              })()
            )}
          </div>

        </div>
      </div>
    </AdminSidebar>
  );
};

export default Agenda;
