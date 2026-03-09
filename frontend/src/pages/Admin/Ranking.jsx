import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Star } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../services/api';
import { getTier } from '../../utils/loyalty';

const Ranking = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/clients')
      .then(({ data }) => {
        const sorted = [...data].sort((a, b) => (b.total_cuts || 0) - (a.total_cuts || 0));
        setClients(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const top3 = clients.slice(0, 3);
  const rest  = clients.slice(3);

  const podiumColors = [
    { border: 'border-barber-gold',   text: 'text-barber-gold',   shadow: 'shadow-[0_0_20px_rgba(203,160,82,0.4)]',  h: 'h-32', label: '1º' },
    { border: 'border-gray-400',      text: 'text-gray-400',      shadow: 'shadow-[0_0_15px_rgba(156,163,175,0.2)]', h: 'h-24', label: '2º' },
    { border: 'border-orange-500',    text: 'text-orange-500',    shadow: 'shadow-[0_0_15px_rgba(249,115,22,0.2)]',  h: 'h-16', label: '3º' },
  ];
  // order for visual podium: 2nd, 1st, 3rd
  const podiumOrder = [1, 0, 2];

  return (
    <AdminSidebar>
      <div className="animate-in fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Ranking de Clientes</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-barber-gray)' }}>Baseado em cortes realizados</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20" style={{ color: 'var(--color-barber-gray)' }}>Carregando...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Podium */}
            <div className="lg:col-span-1 flex flex-col items-center justify-end pt-10">
              <div className="flex items-end justify-center space-x-2 w-full h-48 border-b-2 border-barber-light">
                {podiumOrder.map((pos) => {
                  const c = top3[pos];
                  if (!c) return <div key={pos} className="w-1/3" />;
                  const style = podiumColors[pos];
                  const tier = getTier(c.total_cuts || 0);
                  return (
                    <div key={pos} className="flex flex-col items-center w-1/3">
                      {pos === 0 && <Crown className="text-barber-gold mb-1" size={28} />}
                      <span className={`text-sm font-medium truncate w-full text-center px-1 mb-1 ${pos === 0 ? 'font-bold text-barber-gold' : 'text-barber-gray'}`}>
                        {c.name}
                      </span>
                      <span className="text-xs mb-1" style={{ color: tier.color }}>{tier.label}</span>
                      <div className={`w-full bg-barber-dark border-t-2 border-l-2 border-r-2 ${style.border} ${style.h} flex items-center justify-center flex-col ${style.shadow}`}>
                        <span className={`${style.text} font-bold text-xl`}>{style.label}</span>
                        <span className="text-xs text-barber-gray mt-1">{c.total_cuts || 0} cortes</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Full list */}
            <div className="lg:col-span-2">
              <div className="card">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Trophy size={20} className="text-barber-gold mr-2" /> Tabela Completa
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-barber-light text-barber-gray text-sm">
                        <th className="pb-3 font-medium w-12 text-center">Pos</th>
                        <th className="pb-3 font-medium">Cliente</th>
                        <th className="pb-3 font-medium text-center">Nível</th>
                        <th className="pb-3 font-medium text-center">Cortes</th>
                        <th className="pb-3 font-medium text-right">Pontos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-barber-light/50">
                      {clients.map((c, index) => {
                        const tier = getTier(c.total_cuts || 0);
                        return (
                          <tr key={c._id} className="hover:bg-barber-light/30 transition-colors">
                            <td className="py-3 text-center font-bold text-barber-gray">
                              {index === 0 ? <span className="text-barber-gold">1º</span> :
                               index === 1 ? <span className="text-gray-400">2º</span> :
                               index === 2 ? <span className="text-orange-500">3º</span> :
                               `${index + 1}º`}
                            </td>
                            <td className="py-3 font-medium">{c.name}</td>
                            <td className="py-3 text-center">
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: tier.bg, color: tier.color, border: `1px solid ${tier.border}` }}>
                                {tier.label}
                              </span>
                            </td>
                            <td className="py-3 text-center text-barber-gray">{c.total_cuts || 0}</td>
                            <td className="py-3 text-right">
                              <span className="inline-flex items-center text-barber-gold font-bold">
                                {c.points || 0} <Star size={14} className="ml-1 fill-barber-gold" />
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tier Legend */}
              <div className="card mt-4">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-barber-gray)' }}>Níveis de Fidelidade</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: '⭐ Novo', cuts: '0 cortes', color: '#6b7280' },
                    { label: '🥉 Bronze', cuts: '1–9 cortes', color: '#cd7f32' },
                    { label: '🥈 Prata', cuts: '10–24 cortes', color: '#9ca3af' },
                    { label: '🥇 Ouro', cuts: '25–49 cortes', color: '#d4af37' },
                    { label: '💎 Diamante', cuts: '50+ cortes', color: '#a5f3fc' },
                  ].map(t => (
                    <div key={t.label} className="flex items-center gap-2 text-sm">
                      <span className="font-bold" style={{ color: t.color }}>{t.label}</span>
                      <span style={{ color: 'var(--color-barber-gray)' }}>{t.cuts}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminSidebar>
  );
};

export default Ranking;
