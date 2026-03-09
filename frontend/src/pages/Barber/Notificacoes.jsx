import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import BarberSidebar from '../../components/BarberSidebar';
import api from '../../services/api';

const typeLabel = {
  new_appointment: '📅 Novo Agendamento',
  appointment_cancelled: '❌ Cancelamento',
  appointment_confirmed: '✅ Confirmado',
  new_client: '👤 Novo Cliente',
};

const BarberNotificacoes = () => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('barberToken');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/barber/me/notifications', { headers });
      setNotifications(data.notifications);
      setUnread(data.unreadCount);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAllRead = async () => {
    try {
      await api.patch('/barber/me/notifications/read-all', {}, { headers });
      fetchNotifications();
    } catch (err) { console.error(err); }
  };

  return (
    <BarberSidebar unreadCount={unread}>
      <div className="animate-in fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Notificações</h1>
            {unread > 0 && <p className="text-sm mt-1" style={{ color: 'var(--color-barber-gray)' }}>{unread} não lida(s)</p>}
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} className="btn-secondary flex items-center gap-2">
              <CheckCheck size={16} /> Marcar todas
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-10" style={{ color: 'var(--color-barber-gray)' }}>Carregando...</div>
        ) : notifications.length === 0 ? (
          <div className="card text-center py-16">
            <Bell size={40} className="mx-auto mb-4" style={{ color: 'var(--color-barber-gray)' }} />
            <p style={{ color: 'var(--color-barber-gray)' }}>Nenhuma notificação ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => (
              <div key={n._id} className="card flex items-start gap-4"
                style={!n.read ? { borderLeft: '3px solid var(--color-barber-gold)' } : {}}>
                <div className="shrink-0 text-2xl">{typeLabel[n.type]?.split(' ')[0] || '🔔'}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${!n.read ? 'text-white' : ''}`}
                    style={n.read ? { color: 'var(--color-barber-gray)' } : {}}>
                    {n.message}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-barber-gray)' }}>
                    {new Date(n.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ backgroundColor: 'var(--color-barber-gold)' }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </BarberSidebar>
  );
};

export default BarberNotificacoes;
