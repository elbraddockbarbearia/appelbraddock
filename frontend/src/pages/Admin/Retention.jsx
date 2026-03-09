import React, { useState, useEffect } from 'react';
import { Users, Calendar, MessageCircle, Gift } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../services/api';

const Retention = () => {
  const [inactiveClients, setInactiveClients] = useState([]);
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inactiveRes, birthdaysRes] = await Promise.all([
          api.get('/clients/inactive'),
          api.get('/clients/birthdays')
        ]);
        
        setInactiveClients(inactiveRes.data || []);
        setBirthdays(birthdaysRes.data || []);
      } catch (error) {
        console.error('Error fetching retention data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/\D/g, ''); // Remove non-numeric chars
  };

  const sendWhatsApp = (phone, defaultMessage) => {
    const cleanPhone = formatPhone(phone);
    if (!cleanPhone) {
      alert('Cliente não possui telefone cadastrado válido.');
      return;
    }
    const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(url, '_blank');
  };

  const makeCall = (phone) => {
    const cleanPhone = formatPhone(phone);
    if (!cleanPhone) {
      alert('Cliente não possui telefone cadastrado válido.');
      return;
    }
    window.open(`tel:${cleanPhone}`, '_self');
  };

  const currentMonthName = new Date().toLocaleString('pt-BR', { month: 'long' });

  return (
    <AdminSidebar>
      <div className="animate-in fade-in space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Retenção de Clientes</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-barber-gray)' }}>
            Reative clientes e parabenize aniversariantes
          </p>
        </div>

        {loading ? (
           <div className="text-center py-20" style={{ color: 'var(--color-barber-gray)' }}>Carregando dados...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* INACTIVE CLIENTS */}
            <div className="card">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="text-barber-gold" size={24} />
                <h2 className="text-xl font-bold">Inativos (+30 dias)</h2>
              </div>
              
              {(!inactiveClients || inactiveClients.length === 0) ? (
                <p className="text-sm text-center py-4" style={{ color: 'var(--color-barber-gray)' }}>
                  Nenhum cliente inativo! Ótimo trabalho.
                </p>
              ) : (
                <div className="space-y-4">
                  {inactiveClients.map(client => {
                    const msg = `Olá ${client.name || 'amigo'}! Sentimos sua falta aqui no El Braddock Barber 💈. Faz um tempinho que você não corta com a gente. Que tal agendar seu próximo horário?`;
                    
                    return (
                      <div key={client._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--color-barber-light)' }}>
                        <div className="mb-3 sm:mb-0">
                          <p className="font-bold">{client.name}</p>
                          <p className="text-xs" style={{ color: 'var(--color-barber-gray)' }}>
                            Último corte: {client.last_appointment_date ? new Date(client.last_appointment_date).toLocaleDateString('pt-BR') : 'Nunca'}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-3 sm:mt-0">
                          <button 
                            onClick={() => sendWhatsApp(client.phone, msg)}
                            className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg px-3 flex items-center justify-center gap-1 py-2 transition-colors"
                          >
                            <MessageCircle size={14} /> WhatsApp
                          </button>
                          <button 
                            onClick={() => makeCall(client.phone)}
                            className="bg-transparent border border-barber-gray hover:text-white text-barber-gray text-xs font-bold rounded-lg px-3 flex items-center justify-center gap-1 py-1 transition-colors"
                          >
                            Ligar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* BIRTHDAYS */}
            <div className="card border" style={{ borderColor: 'var(--color-barber-gold)' }}>
              <div className="flex items-center gap-2 mb-6">
                <Gift className="text-barber-gold" size={24} />
                <h2 className="text-xl font-bold">Aniversariantes ({currentMonthName})</h2>
              </div>

              {(!birthdays || birthdays.length === 0) ? (
                <p className="text-sm text-center py-4" style={{ color: 'var(--color-barber-gray)' }}>
                  Nenhum aniversariante neste mês.
                </p>
              ) : (
                <div className="space-y-4">
                  {birthdays.map(client => {
                     const msg = `Fala ${client.name || 'amigo'}! Feliz Aniversário! 🎉 O El Braddock Barber 💈 deseja muita paz e saúde. Para comemorar, temos um presente especial para você. Venha dar aquele talento no visual!`;
                     
                     return (
                      <div key={client._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border" style={{ borderColor: 'var(--color-barber-light)', backgroundColor: 'rgba(203,160,82,0.05)' }}>
                        <div className="mb-3 sm:mb-0">
                          <p className="font-bold text-barber-gold">{client.name}</p>
                          <p className="text-xs" style={{ color: 'var(--color-barber-gray)' }}>
                            Faz aniversário dia: {client.day}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-3 sm:mt-0">
                          <button 
                            onClick={() => sendWhatsApp(client.phone, msg)}
                            className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg px-3 flex items-center justify-center gap-1 py-2 transition-colors"
                          >
                            <MessageCircle size={14} /> WhatsApp
                          </button>
                          <button 
                            onClick={() => makeCall(client.phone)}
                            className="bg-transparent border border-barber-gray hover:text-white text-barber-gray text-xs font-bold rounded-lg px-3 flex items-center justify-center gap-1 py-1 transition-colors"
                          >
                            Ligar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </AdminSidebar>
  );
};

export default Retention;
