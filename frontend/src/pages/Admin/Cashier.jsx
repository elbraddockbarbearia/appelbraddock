import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusCircle, ArrowUpRight, ArrowDownRight, DollarSign, X, CheckCircle,
  BarChart2, TrendingUp, CreditCard, Banknote, Smartphone, Tag
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../services/api';

const METHODS = [
  { value: 'dinheiro', label: 'Dinheiro', icon: Banknote },
  { value: 'pix',      label: 'PIX',      icon: Smartphone },
  { value: 'cartao',   label: 'Cartão',   icon: CreditCard },
  { value: 'outro',    label: 'Outro',    icon: Tag },
];
const defaultForm = { type: 'entrada', description: '', amount: '', payment_method: 'pix', card_fee: '' };

const Cashier = () => {
  const today = new Date().toISOString().split('T')[0];
  const [filterDate, setFilterDate]     = useState(today);
  const [transactions, setTransactions] = useState([]);
  const [report, setReport]             = useState(null);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [form, setForm]                 = useState(defaultForm);
  const [saved, setSaved]               = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [txRes, repRes] = await Promise.all([
        api.get(`/cashier?startDate=${filterDate}&endDate=${filterDate}`),
        api.get(`/cashier/report/daily?date=${filterDate}`),
      ]);
      setTransactions(txRes.data);
      setReport(repRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/cashier', {
        ...form,
        amount:   parseFloat(form.amount),
        card_fee: form.payment_method === 'cartao' ? parseFloat(form.card_fee || 0) : 0,
      });
      setShowModal(false);
      setForm(defaultForm);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao registrar movimentação');
    }
  };

  const fmt = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const methodLabel = (v) => METHODS.find(m => m.value === v)?.label || v;

  return (
    <AdminSidebar>
      <div className="animate-in fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Controle de Caixa</h1>
            <input type="date" value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="input-field py-1.5 pl-3 pr-3 mt-2 w-44 text-sm" />
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <PlusCircle size={18} /> Nova Movimentação
          </button>
        </div>

        {saved && (
          <div className="flex items-center gap-3 p-4 rounded-xl mb-6 text-sm font-medium"
            style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
            <CheckCircle size={18} /> Movimentação registrada!
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card" style={{ borderLeftWidth: '3px', borderLeftColor: '#22c55e', borderLeftStyle: 'solid' }}>
            <div className="flex items-center gap-2 text-xs font-medium mb-2" style={{ color: 'var(--color-barber-gray)' }}>
              <ArrowUpRight size={14} style={{ color: '#22c55e' }} /> Entradas
            </div>
            <p className="text-2xl font-display font-bold" style={{ color: '#22c55e' }}>{fmt(report?.totalIncome)}</p>
          </div>
          <div className="card" style={{ borderLeftWidth: '3px', borderLeftColor: '#ef4444', borderLeftStyle: 'solid' }}>
            <div className="flex items-center gap-2 text-xs font-medium mb-2" style={{ color: 'var(--color-barber-gray)' }}>
              <ArrowDownRight size={14} style={{ color: '#ef4444' }} /> Saídas
            </div>
            <p className="text-2xl font-display font-bold" style={{ color: '#ef4444' }}>{fmt(report?.totalExpense)}</p>
          </div>
          <div className="card" style={{ borderLeftWidth: '3px', borderLeftColor: 'var(--color-barber-gold)', borderLeftStyle: 'solid' }}>
            <div className="flex items-center gap-2 text-xs font-medium mb-2" style={{ color: 'var(--color-barber-gold)' }}>
              <DollarSign size={14} /> Saldo Líquido
            </div>
            <p className="text-2xl font-display font-bold" style={{ color: 'var(--color-barber-gold)' }}>{fmt(report?.revenue)}</p>
          </div>
          <div className="card" style={{ borderLeftWidth: '3px', borderLeftColor: '#818cf8', borderLeftStyle: 'solid' }}>
            <div className="flex items-center gap-2 text-xs font-medium mb-2" style={{ color: 'var(--color-barber-gray)' }}>
              <TrendingUp size={14} style={{ color: '#818cf8' }} /> Ticket Médio
            </div>
            <p className="text-2xl font-display font-bold" style={{ color: '#818cf8' }}>{fmt(report?.ticketMedio)}</p>
          </div>
        </div>

        {/* Insights Row */}
        {report && (report.topService || Object.keys(report.byMethod || {}).length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {report.topService && (
              <div className="card">
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-barber-gray)' }}>
                  <BarChart2 size={13} className="inline mr-1" />Serviço Mais Vendido
                </p>
                <p className="text-xl font-bold" style={{ color: 'var(--color-barber-gold)' }}>{report.topService}</p>
                <p className="text-sm" style={{ color: 'var(--color-barber-gray)' }}>{report.totalSales} atendimento(s) hoje</p>
              </div>
            )}
            {Object.keys(report.byMethod || {}).length > 0 && (
              <div className="card">
                <p className="text-xs font-medium mb-3" style={{ color: 'var(--color-barber-gray)' }}>
                  Entradas por Forma de Pagamento
                </p>
                <div className="space-y-2">
                  {Object.entries(report.byMethod).map(([method, val]) => (
                    <div key={method} className="flex items-center justify-between text-sm">
                      <span style={{ color: 'var(--color-barber-gray)' }}>{methodLabel(method)}</span>
                      <span className="font-semibold" style={{ color: '#22c55e' }}>{fmt(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transactions Table */}
        <div className="card">
          <h2 className="text-lg font-bold mb-5">Histórico do Dia</h2>
          {loading ? (
            <div className="text-center py-10" style={{ color: 'var(--color-barber-gray)' }}>Carregando...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10" style={{ color: 'var(--color-barber-gray)' }}>Nenhuma movimentação nesta data.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide"
                    style={{ color: 'var(--color-barber-gray)', borderBottom: '1px solid var(--color-barber-light)' }}>
                    <th className="pb-3 font-semibold">Hora</th>
                    <th className="pb-3 font-semibold">Descrição</th>
                    <th className="pb-3 font-semibold hidden sm:table-cell">Método</th>
                    <th className="pb-3 font-semibold text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx._id}
                      style={{ borderBottom: '1px solid rgba(42,42,42,0.5)' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(42,42,42,0.4)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                      <td className="py-4 text-xs" style={{ color: 'var(--color-barber-gray)' }}>
                        {new Date(tx.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-4 font-medium pr-4">{tx.description}</td>
                      <td className="py-4 hidden sm:table-cell text-xs" style={{ color: 'var(--color-barber-gray)' }}>
                        {methodLabel(tx.payment_method)}
                        {tx.payment_method === 'cartao' && tx.card_fee > 0 && (
                          <span style={{ color: '#ef4444' }}> (-{tx.card_fee}%)</span>
                        )}
                      </td>
                      <td className="py-4 font-bold text-right"
                        style={{ color: tx.type === 'entrada' ? '#22c55e' : '#ef4444' }}>
                        {tx.type === 'entrada' ? '+ ' : '– '}{fmt(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
            style={{ backgroundColor: 'var(--color-barber-dark)', border: '1px solid var(--color-barber-light)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold">Nova Movimentação</h2>
              <button onClick={() => { setShowModal(false); setForm(defaultForm); }}
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'var(--color-barber-gray)' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-barber-light)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--color-barber-gray)'; }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-barber-gray)' }}>Tipo</label>
                <div className="flex gap-2">
                  {['entrada', 'saida'].map(t => (
                    <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                      className="flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200"
                      style={form.type === t
                        ? t === 'entrada'
                          ? { backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.4)' }
                          : { backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)' }
                        : { backgroundColor: 'var(--color-barber-black)', color: 'var(--color-barber-gray)', border: '1px solid var(--color-barber-light)' }
                      }>
                      {t === 'entrada' ? '↑ Entrada' : '↓ Saída'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-barber-gray)' }}>Descrição</label>
                <input className="input-field" placeholder="Ex: Corte (João Silva)" required
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-barber-gray)' }}>Valor (R$)</label>
                <input type="number" min="0.01" step="0.01" className="input-field" placeholder="0,00" required
                  value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-barber-gray)' }}>Forma de Pagamento</label>
                <div className="grid grid-cols-4 gap-2">
                  {METHODS.map(m => (
                    <button key={m.value} type="button" onClick={() => setForm(f => ({ ...f, payment_method: m.value }))}
                      className="flex flex-col items-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all"
                      style={form.payment_method === m.value
                        ? { backgroundColor: 'rgba(212,175,55,0.15)', color: 'var(--color-barber-gold)', border: '1px solid rgba(212,175,55,0.4)' }
                        : { backgroundColor: 'var(--color-barber-black)', color: 'var(--color-barber-gray)', border: '1px solid var(--color-barber-light)' }
                      }>
                      <m.icon size={18} />
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Fee (only when cartao) */}
              {form.payment_method === 'cartao' && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-barber-gray)' }}>
                    Taxa da Maquininha (%)
                  </label>
                  <input type="number" min="0" max="10" step="0.1" className="input-field" placeholder="Ex: 2.99"
                    value={form.card_fee} onChange={e => setForm(f => ({ ...f, card_fee: e.target.value }))} />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setForm(defaultForm); }} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminSidebar>
  );
};

export default Cashier;
