import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

const mockTimes = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

const Schedule = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [takenTimes, setTakenTimes] = useState([]);

  // Auth guard: redirect to login if not logged in
  const client = (() => { try { return JSON.parse(localStorage.getItem('client')); } catch { return null; } })();
  
  useEffect(() => {
    if (!client) {
      navigate('/login?next=/schedule', { replace: true });
    } else {
      api.get('/services').then(res => setServices(res.data)).catch(console.error);
      api.get('/barbers').then(res => setBarbers(res.data)).catch(console.error);
    }
  }, []);

  const [formData, setFormData] = useState({
    name: client?.name || '', phone: client?.phone || '', service: null, barber: null, date: '', time: ''
  });

  // Fetch taken times when date or barber changes
  useEffect(() => {
    if (formData.date) {
      const barberId = formData.barber?._id;
      const url = barberId
        ? `/appointments?date=${formData.date}&barber_id=${barberId}`
        : `/appointments?date=${formData.date}`;
      api.get(url)
        .then(res => {
          const taken = res.data
            .filter(appt => appt.status !== 'cancelled')
            .map(appt => appt.time);
          setTakenTimes(taken);
        })
        .catch(console.error);
    }
  }, [formData.date, formData.barber]);

  const handleServiceSelect = (service) => {
    setFormData({ ...formData, service });
    setStep(barbers.length > 0 ? 2 : 3); // skip barber step if none registered
  }

  const handleBarberSelect = (barber) => {
    setFormData({ ...formData, barber });
    setStep(3);
  }

  const handleDateSelect = (e) => {
    setFormData({ ...formData, date: e.target.value });
  }

  const handleTimeSelect = (time) => {
    setFormData({ ...formData, time });
    setStep(4);
  }

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const isCoveredByPlan = client?.plano?.ativo && client?.plano?.cortesRestantes > 0;
      await api.post('/appointments', {
        client_id: client._id,
        barber_id: formData.barber?._id || null,
        date: formData.date,
        time: formData.time,
        service_id: formData.service._id,
        price: isCoveredByPlan ? 0 : formData.service.price
      });
      setStep(5);
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao agendar horário.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pb-20 px-6 pt-10">
      
      {step < 5 && (
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/')} className="mb-6 flex items-center text-barber-gold hover:text-white transition">
          <ArrowLeft size={20} className="mr-2" /> Voltar
        </button>
      )}

      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-2xl font-bold mb-6">Escolha o Serviço</h2>
          <div className="space-y-4">
            {services.map(srv => (
              <div 
                key={srv._id} 
                onClick={() => handleServiceSelect(srv)}
                className="card flex justify-between items-center cursor-pointer hover:border-barber-gold transition-colors"
              >
                <div>
                  <h3 className="text-lg font-semibold">{srv.name}</h3>
                  <p className="text-sm text-barber-gray">{srv.duration} min</p>
                </div>
                <div className="text-barber-gold font-bold text-xl">
                  R$ {srv.price}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Choose Barber */}
      {step === 2 && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-2xl font-bold mb-2">Escolha o Barbeiro</h2>
          <p className="text-barber-gray text-sm mb-6">Ou selecione "Sem preferência" para qualquer disponível.</p>
          <div className="space-y-3">
            <div
              onClick={() => handleBarberSelect(null)}
              className={`card flex items-center gap-4 cursor-pointer border-2 transition-colors ${
                formData.barber === null ? 'border-barber-gold' : 'border-barber-light hover:border-barber-gold'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-barber-light flex items-center justify-center text-barber-gray text-xl">✂️</div>
              <div>
                <p className="font-bold">Sem preferência</p>
                <p className="text-sm text-barber-gray">Primeiro disponível</p>
              </div>
            </div>
            {barbers.map(b => (
              <div
                key={b._id}
                onClick={() => handleBarberSelect(b)}
                className={`card flex items-center gap-4 cursor-pointer border-2 transition-colors ${
                  formData.barber?._id === b._id ? 'border-barber-gold' : 'border-barber-light hover:border-barber-gold'
                }`}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-black text-lg shrink-0"
                  style={{ backgroundColor: '#d4af37' }}>
                  {b.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold">{b.name}</p>
                  {b.specialties?.length > 0 && (
                    <p className="text-sm text-barber-gray">{b.specialties.join(' · ')}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-2xl font-bold mb-6">Data e Horário</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-barber-gray mb-2">Selecione a Data</label>
            <input 
              type="date" 
              className="input-field" 
              value={formData.date}
              onChange={handleDateSelect}
            />
          </div>

          {formData.date && (
            <div>
              <label className="block text-sm font-medium text-barber-gray mb-4">Horários Disponíveis (em {formData.date})</label>
              <div className="grid grid-cols-3 gap-3">
                {mockTimes.filter(t => !takenTimes.includes(t)).map(time => (
                  <button 
                    key={time} 
                    onClick={() => handleTimeSelect(time)}
                    className="py-3 px-2 text-center rounded-lg border border-barber-light bg-barber-black hover:border-barber-gold hover:text-barber-gold transition-colors font-medium"
                  >
                    {time}
                  </button>
                ))}
                {mockTimes.filter(t => !takenTimes.includes(t)).length === 0 && (
                  <div className="col-span-3 text-center text-barber-gray py-4">Nenhum horário disponível nesta data.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-2xl font-bold mb-6">Seus Dados</h2>
          <div className="card space-y-4">
            <div>
              <label className="block text-sm font-medium text-barber-gray mb-1">Nome Completo</label>
              <input type="text" className="input-field" placeholder="Ex: João Silva" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-barber-gray mb-1">WhatsApp</label>
              <input type="tel" className="input-field" placeholder="(00) 00000-0000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            
            <div className="pt-4 border-t border-barber-light mt-4">
              <h4 className="text-sm font-medium text-barber-gray mb-2">Resumo</h4>
              <p className="font-semibold">{formData.service.name}</p>
              <p className="text-sm">{formData.date} às {formData.time}</p>
              <div className="mt-2 text-sm">
                {client?.plano?.ativo && client?.plano?.cortesRestantes > 0 ? (
                  <>
                    <p className="text-gray-400 line-through">R$ {formData.service.price.toFixed(2)}</p>
                    <p className="text-green-500 font-bold text-base mt-1">R$ 0,00 (Coberto pelo Plano)</p>
                  </>
                ) : (
                  <p className="text-barber-gold font-bold text-base">Total: R$ {formData.service.price.toFixed(2)}</p>
                )}
              </div>
            </div>

            <button onClick={handleConfirm} className="btn-primary w-full mt-6" disabled={!formData.name || !formData.phone || loading}>
              {loading ? 'Agendando...' : 'Confirmar Agendamento'}
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="animate-in fade-in zoom-in text-center flex flex-col items-center justify-center pt-20">
          <CheckCircle2 size={80} className="text-green-500 mb-6" />
          <h2 className="text-3xl font-bold mb-2">Agendado!</h2>
          <p className="text-barber-gray mb-8">Te esperamos na resenha, patrão.</p>
          
          <div className="card w-full text-left mb-8">
            <p className="font-semibold">{formData.service.name}</p>
            <p className="text-sm">{formData.date} às {formData.time}</p>
          </div>

          <button onClick={() => navigate('/')} className="btn-secondary w-full">Voltar ao Início</button>
        </div>
      )}

    </div>
  );
};

export default Schedule;
