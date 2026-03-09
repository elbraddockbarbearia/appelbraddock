import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, TrendingUp, Bell, LogOut, Menu, X, Scissors } from 'lucide-react';

const menuItems = [
  { name: 'Início',    icon: LayoutDashboard, path: '/barber' },
  { name: 'Minha Agenda', icon: CalendarDays, path: '/barber/agenda' },
  { name: 'Comissão',  icon: TrendingUp,      path: '/barber/comissao' },
  { name: 'Notificações', icon: Bell,         path: '/barber/notificacoes' },
];

const NavItem = ({ item, onClick }) => (
  <NavLink to={item.path} end={item.path === '/barber'} onClick={onClick}
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

const BarberSidebar = ({ children, unreadCount = 0 }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const barber = (() => { try { return JSON.parse(localStorage.getItem('barber')); } catch { return null; } })();

  const handleLogout = () => {
    localStorage.removeItem('barberToken');
    localStorage.removeItem('barber');
    navigate('/barber/login');
  };

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Scissors className="text-barber-gold" size={22} />
          <h2 className="text-xl font-display font-bold text-barber-gold tracking-widest">EL BRADDOCK</h2>
        </div>
        <p className="text-barber-gray text-xs tracking-widest">PORTAL BARBEIRO</p>
      </div>

      {/* Barber Profile */}
      {barber && (
        <div className="mb-6 text-center p-3 rounded-xl" style={{ backgroundColor: 'rgba(212,175,55,0.08)' }}>
          <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-black text-lg"
            style={{ backgroundColor: 'var(--color-barber-gold)' }}>
            {barber.name?.charAt(0).toUpperCase()}
          </div>
          <p className="font-semibold text-sm">{barber.name}</p>
          {barber.nickname && <p className="text-xs" style={{ color: 'var(--color-barber-gold)' }}>"{barber.nickname}"</p>}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-grow space-y-1">
        {menuItems.map(item => (
          <div key={item.name} className="relative">
            <NavItem item={item} onClick={() => setMobileOpen(false)} />
            {item.name === 'Notificações' && unreadCount > 0 && (
              <span className="absolute right-3 top-3 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-black"
                style={{ backgroundColor: 'var(--color-barber-gold)' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <button onClick={handleLogout}
        className="flex items-center gap-3 p-3 w-full text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg mt-4 transition-all duration-200 font-medium">
        <LogOut size={20} /> Sair
      </button>
    </>
  );

  return (
    <div className="flex min-h-screen text-white font-sans" style={{ backgroundColor: 'var(--color-barber-black)' }}>
      {/* Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-barber-light p-6 shrink-0" style={{ backgroundColor: 'var(--color-barber-dark)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside className={`fixed top-0 left-0 h-full w-72 z-50 flex flex-col p-6 border-r border-barber-light transition-transform duration-300 md:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ backgroundColor: 'var(--color-barber-dark)' }}>
        <button onClick={() => setMobileOpen(false)} className="self-end mb-4 p-2 rounded-lg text-barber-gray hover:text-white hover:bg-barber-light">
          <X size={20} />
        </button>
        <SidebarContent />
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-barber-light" style={{ backgroundColor: 'var(--color-barber-dark)' }}>
          <div className="flex items-center gap-2">
            <Scissors className="text-barber-gold" size={18} />
            <span className="font-display font-bold text-barber-gold tracking-widest text-sm">EL BRADDOCK</span>
          </div>
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-barber-light">
            <Menu size={22} />
          </button>
        </div>
        <div className="flex-1 p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default BarberSidebar;
