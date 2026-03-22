import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Users, Users2,
  DollarSign, Settings, LogOut, Menu, X, Scissors, TrendingUp, Bell, CreditCard
} from 'lucide-react';
import api from '../services/api';

const menuItems = [
  { name: 'Dashboard',    icon: LayoutDashboard, path: '/admin' },
  { name: 'Agenda',       icon: CalendarDays,    path: '/admin/agenda' },
  { name: 'Barbeiros',    icon: Users2,          path: '/admin/barbeiros' },
  { name: 'Ranking',      icon: Users,           path: '/admin/ranking' },
  { name: 'Mensalidade',  icon: CreditCard,      path: '/admin/mensalidade' },
  { name: 'Serviços',     icon: Scissors,        path: '/admin/servicos' },
  { name: 'Comissão',     icon: TrendingUp,      path: '/admin/comissao' },
  { name: 'Caixa',        icon: DollarSign,      path: '/admin/cashier' },
  { name: 'Retenção',     icon: Users,           path: '/admin/retencao' },
  { name: 'Ajustes',      icon: Settings,        path: '/admin/settings' },
];

const NavItem = ({ item, onClick }) => (
  <NavLink
    key={item.name}
    to={item.path}
    end={item.path === '/admin'}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 p-3 rounded-lg transition-all duration-200 font-medium ${
        isActive
          ? 'bg-barber-gold text-black shadow-[0_0_15px_rgba(203,160,82,0.3)]'
          : 'text-barber-gray hover:text-white hover:bg-barber-light'
      }`
    }
  >
    <item.icon size={20} />
    {item.name}
  </NavLink>
);

// Notification Bell component
const NotificationBell = () => {
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const token = localStorage.getItem('adminToken');

  const fetch = async () => {
    try {
      const { data } = await api.get('/notifications?type=admin&limit=10', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(data.notifications || []);
      setUnread(data.unreadCount || 0);
    } catch {}
  };

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAll = async () => {
    try {
      await api.patch('/notifications/read-all', { type: 'admin' }, { headers: { Authorization: `Bearer ${token}` } });
      fetch();
    } catch {}
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-lg hover:bg-barber-light transition-colors"
        style={{ color: 'var(--color-barber-gray)' }}>
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-black"
            style={{ backgroundColor: 'var(--color-barber-gold)' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-2xl z-50 overflow-hidden"
          style={{ backgroundColor: 'var(--color-barber-dark)', border: '1px solid var(--color-barber-light)' }}>
          <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: 'var(--color-barber-light)' }}>
            <span className="text-sm font-semibold">Notificações</span>
            {unread > 0 && (
              <button onClick={markAll} className="text-xs" style={{ color: 'var(--color-barber-gold)' }}>
                Marcar todas
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto divide-y" style={{ borderColor: 'var(--color-barber-light)' }}>
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-center" style={{ color: 'var(--color-barber-gray)' }}>Nenhuma notificação</p>
            ) : notifications.map(n => (
              <div key={n._id} className="p-3 flex items-start gap-2 text-sm"
                style={{ backgroundColor: !n.read ? 'rgba(212,175,55,0.04)' : '' }}>
                {!n.read && <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: 'var(--color-barber-gold)' }} />}
                <div style={{ color: n.read ? 'var(--color-barber-gray)' : 'white' }}>{n.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SidebarContent = ({ handleLogout, setMobileOpen }) => (
  <>
    {/* Brand + Bell */}
    <div className="mb-8">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Scissors className="text-barber-gold" size={22} />
          <h2 className="text-xl font-display font-bold text-barber-gold tracking-widest">EL BRADDOCK</h2>
        </div>
        <NotificationBell />
      </div>
      <p className="text-barber-gray text-xs tracking-widest text-center">PAINEL ADMIN</p>
    </div>

    {/* Navigation */}
    <nav className="flex-grow space-y-1">
      {menuItems.map(item => (
        <NavItem
          key={item.name}
          item={item}
          onClick={() => setMobileOpen(false)}
        />
      ))}
    </nav>

    {/* Logout */}
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 p-3 w-full text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg mt-4 transition-all duration-200 font-medium"
    >
      <LogOut size={20} />
      Sair
    </button>
  </>
);

const AdminSidebar = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen text-white font-sans" style={{ backgroundColor: 'var(--color-barber-black)' }}>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-barber-light p-6 shrink-0" style={{ backgroundColor: 'var(--color-barber-dark)' }}>
        <SidebarContent handleLogout={handleLogout} setMobileOpen={setMobileOpen} />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 flex flex-col p-6 border-r border-barber-light transition-transform duration-300 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: 'var(--color-barber-dark)' }}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="self-end mb-4 p-2 rounded-lg text-barber-gray hover:text-white hover:bg-barber-light transition-colors"
        >
          <X size={20} />
        </button>
        <SidebarContent handleLogout={handleLogout} setMobileOpen={setMobileOpen} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-barber-light" style={{ backgroundColor: 'var(--color-barber-dark)' }}>
          <div className="flex items-center gap-2">
            <Scissors className="text-barber-gold" size={18} />
            <span className="font-display font-bold text-barber-gold tracking-widest text-sm">EL BRADDOCK</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-barber-light transition-colors"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminSidebar;
