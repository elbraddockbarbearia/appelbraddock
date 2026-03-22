import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, CheckCircle, XCircle, Clock, Users, RefreshCw, ShieldOff } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../services/api';

const STATUS = {
  ativo: { label: 'Ativo', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: CheckCircle },
  vencido: { label: 'Vencido', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: XCircle },
  sem_plano: { label: 'Sem plano', color: '#6b7280', bg: 'rgba(107,114,128,0.1)', icon: Clock },
};

function getStatusKey(plano) {
  if (!plano || !plano.dataPagamento) return 'sem_plano';
  if (plano.ativo) return 'ativo';
  return 'vencido';
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-BR');
}

export default function Mensalidade() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');
  const [activating, setActivating] = useState(null);
  const [modal, setModal] = useState(null); // { clientId, nome }

  const fetchClientes = useCallback(async () => {
    try {
      const { data } = await api.get('/clients');
      setClientes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClientes(); }, [fetchClientes]);

  const ativar = async (clientId, tipo) => {
    setActivating(clientId);
    try {
      await api.post(`/plano/${clientId}/ativar`, { tipo });
      await fetchClientes();
      setModal(null);
    } catch (e) {
      alert(e?.response?.data?.message || 'Erro ao ativar plano.');
    } finally {
      setActivating(null);
    }
  };

  const desativar = async (clientId) => {
    if (!window.confirm('Desativar plano deste cliente?')) return;
    setActivating(clientId);
    try {
      await api.put(`/plano/${clientId}/desativar`);
      await fetchClientes();
    } catch (e) {
      alert(e?.response?.data?.message || 'Erro ao desativar plano.');
    } finally {
      setActivating(null);
    }
  };

  const filtered = clientes.filter(c => {
    const key = getStatusKey(c.plano);
    if (filtro === 'todos') return true;
    return key === filtro;
  });

  const counts = {
    todos: clientes.length,
    ativo: clientes.filter(c => getStatusKey(c.plano) === 'ativo').length,
    vencido: clientes.filter(c => getStatusKey(c.plano) === 'vencido').length,
    sem_plano: clientes.filter(c => getStatusKey(c.plano) === 'sem_plano').length,
  };

  return (
    <AdminSidebar>
      <div className="animate-in fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              <CreditCard className="text-barber-gold" size={28} />
              Mensalidade
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-barber-gray)' }}>
              Gerencie os planos de corte dos clientes
            </p>
          </div>
          <button onClick={fetchClientes}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm font-medium"
            style={{ borderColor: 'var(--color-barber-light)', color: 'var(--color-barber-gray)' }}>
            <RefreshCw size={16} /> Atualizar
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { key: 'todos', label: 'Total', icon: Users, color: 'var(--color-barber-gold)' },
            { key: 'ativo', label: 'Ativos', icon: CheckCircle, color: '#22c55e' },
            { key: 'vencido', label: 'Vencidos', icon: XCircle, color: '#ef4444' },
            { key: 'sem_plano', label: 'Sem plano', icon: Clock, color: '#6b7280' },
          ].map(s => (
            <button key={s.key} onClick={() => setFiltro(s.key)}
              className={`card text-left transition-all ${filtro === s.key ? 'ring-2 ring-barber-gold' : ''}`}>
              <s.icon size={18} style={{ color: s.color }} className="mb-2" />
              <p className="text-2xl font-bold">{counts[s.key]}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-barber-gray)' }}>{s.label}</p>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="card overflow-x-auto">
          {loading ? (
            <p className="text-center py-10" style={{ color: 'var(--color-barber-gray)' }}>Carregando...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center py-10" style={{ color: 'var(--color-barber-gray)' }}>Nenhum cliente encontrado.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wider" style={{ borderColor: 'var(--color-barber-light)', color: 'var(--color-barber-gray)' }}>
                  <th className="pb-3 font-medium">Cliente</th>
                  <th className="pb-3 font-medium text-center">Status</th>
                  <th className="pb-3 font-medium text-center">Cortes</th>
                  <th className="pb-3 font-medium text-center">Vencimento</th>
                  <th className="pb-3 font-medium text-center">Tipo</th>
                  <th className="pb-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-barber-light)' }}>
                {filtered.map(c => {
                  const sk = getStatusKey(c.plano);
                  const s = STATUS[sk];
                  const isLoading = activating === c._id;
                  const isVencendo = c.plano?.ativo && c.plano?.dataVencimento &&
                    (new Date(c.plano.dataVencimento) - new Date()) / (1000 * 60 * 60 * 24) <= 3;

                  return (
                    <tr key={c._id} className="hover:bg-barber-light/20 transition-colors">
                      <td className="py-4">
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-xs" style={{ color: 'var(--color-barber-gray)' }}>{c.phone}</p>
                      </td>
                      <td className="py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full"
                          style={{ color: s.color, backgroundColor: s.bg }}>
                          <s.icon size={12} />
                          {isVencendo && sk === 'ativo' ? '⏰ Vencendo' : s.label}
                        </span>
                      </td>
                      <td className="py-4 text-center font-mono font-bold">
                        {sk === 'ativo'
                          ? <span style={{ color: c.plano.cortesRestantes === 0 ? '#ef4444' : '#22c55e' }}>
                              {c.plano.cortesRestantes}/{c.plano.cortesTotais}
                            </span>
                          : <span style={{ color: 'var(--color-barber-gray)' }}>—</span>}
                      </td>
                      <td className="py-4 text-center" style={{ color: isVencendo ? '#f97316' : 'inherit' }}>
                        {formatDate(c.plano?.dataVencimento)}
                      </td>
                      <td className="py-4 text-center">
                        {c.plano?.tipo === 'vip'
                          ? <span className="text-xs font-bold text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full">👑 VIP</span>
                          : c.plano?.dataPagamento
                          ? <span className="text-xs text-barber-gray">Normal</span>
                          : <span className="text-xs text-barber-gray">—</span>}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {sk !== 'ativo' ? (
                            <button onClick={() => setModal({ clientId: c._id, nome: c.name })}
                              disabled={isLoading}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80"
                              style={{ backgroundColor: 'var(--color-barber-gold)', color: '#000' }}>
                              {sk === 'vencido' ? '🔄 Renovar' : '✅ Ativar'}
                            </button>
                          ) : (
                            <>
                              <button onClick={() => setModal({ clientId: c._id, nome: c.name })}
                                disabled={isLoading}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80"
                                style={{ backgroundColor: 'var(--color-barber-gold)', color: '#000' }}>
                                🔄 Renovar
                              </button>
                              <button onClick={() => desativar(c._id)}
                                disabled={isLoading}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-400 bg-red-400/10 hover:bg-red-400/20 transition-all flex items-center gap-1">
                                <ShieldOff size={12} /> Desativar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal de ativação do plano */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setModal(null)}>
          <div className="rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            style={{ backgroundColor: 'var(--color-barber-dark)', border: '1px solid var(--color-barber-light)' }}
            onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-1">Ativar Plano</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--color-barber-gray)' }}>
              Cliente: <strong>{modal.nome}</strong>
            </p>
            <p className="text-sm mb-4" style={{ color: 'var(--color-barber-gray)' }}>
              Selecione o tipo de plano:
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => ativar(modal.clientId, 'normal')}
                disabled={activating === modal.clientId}
                className="w-full py-3 rounded-xl font-bold transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--color-barber-gold)', color: '#000' }}>
                💈 Plano Normal — 4 cortes / 30 dias
              </button>
              <button onClick={() => ativar(modal.clientId, 'vip')}
                disabled={activating === modal.clientId}
                className="w-full py-3 rounded-xl font-bold transition-all hover:opacity-90 text-white"
                style={{ background: 'linear-gradient(135deg, #6d28d9, #4f46e5)' }}>
                👑 Plano VIP — 4 cortes + Prioridade + Desconto Barba
              </button>
              <button onClick={() => setModal(null)}
                className="w-full py-2 text-sm rounded-xl transition-all hover:bg-barber-light"
                style={{ color: 'var(--color-barber-gray)' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminSidebar>
  );
}
