import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit2, Trash2, Eye, EyeOff, X, CheckCircle, Clock, DollarSign } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../services/api';

const defaultForm = { name: '', price: '', duration: 30 };

const Servicos = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null); // null = create, obj = edit
  const [form, setForm] = useState(defaultForm);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // id to delete

  const fetchServices = async () => {
    try {
      const { data } = await api.get('/services/admin');
      setServices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const openCreate = () => {
    setEditingService(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (svc) => {
    setEditingService(svc);
    setForm({ name: svc.name, price: svc.price, duration: svc.duration });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await api.put(`/services/${editingService._id}`, form);
      } else {
        await api.post('/services', form);
      }
      setShowModal(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      fetchServices();
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao salvar serviço');
    }
  };

  const handleToggle = async (svc) => {
    try {
      await api.put(`/services/${svc._id}`, { active: !svc.active });
      fetchServices();
    } catch (err) {
      alert('Erro ao alterar status do serviço');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/services/${id}`);
      setConfirmDelete(null);
      fetchServices();
    } catch (err) {
      alert('Erro ao excluir serviço');
    }
  };

  const formatCurrency = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <AdminSidebar>
      <div className="animate-in fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Gestão de Serviços</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-barber-gray)' }}>
              {services.filter(s => s.active).length} ativos · {services.length} no total
            </p>
          </div>
          <button onClick={openCreate} className="btn-primary">
            <PlusCircle size={18} /> Novo Serviço
          </button>
        </div>

        {/* Toast */}
        {saved && (
          <div className="flex items-center gap-3 p-4 rounded-xl mb-6 text-sm font-medium"
            style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
            <CheckCircle size={18} /> Serviço salvo com sucesso!
          </div>
        )}

        {/* Services Table */}
        <div className="card">
          {loading ? (
            <div className="text-center py-10" style={{ color: 'var(--color-barber-gray)' }}>Carregando...</div>
          ) : services.length === 0 ? (
            <div className="text-center py-10" style={{ color: 'var(--color-barber-gray)' }}>
              Nenhum serviço cadastrado ainda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide"
                    style={{ color: 'var(--color-barber-gray)', borderBottom: '1px solid var(--color-barber-light)' }}>
                    <th className="pb-3 font-semibold">Serviço</th>
                    <th className="pb-3 font-semibold text-center hidden sm:table-cell">Duração</th>
                    <th className="pb-3 font-semibold text-right">Preço</th>
                    <th className="pb-3 font-semibold text-center">Status</th>
                    <th className="pb-3 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map(svc => (
                    <tr key={svc._id}
                      style={{ borderBottom: '1px solid rgba(42,42,42,0.5)', opacity: svc.active ? 1 : 0.5 }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(42,42,42,0.4)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                      <td className="py-4 font-semibold">{svc.name}</td>
                      <td className="py-4 text-center hidden sm:table-cell" style={{ color: 'var(--color-barber-gray)' }}>
                        <span className="flex items-center justify-center gap-1">
                          <Clock size={13} /> {svc.duration} min
                        </span>
                      </td>
                      <td className="py-4 text-right font-bold" style={{ color: 'var(--color-barber-gold)' }}>
                        {formatCurrency(svc.price)}
                      </td>
                      <td className="py-4 text-center">
                        <span className="text-xs px-2 py-1 rounded-full font-semibold"
                          style={svc.active
                            ? { backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e' }
                            : { backgroundColor: 'rgba(107,114,128,0.15)', color: 'var(--color-barber-gray)' }}>
                          {svc.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleToggle(svc)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: 'var(--color-barber-gray)' }}
                            title={svc.active ? 'Desativar' : 'Ativar'}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-barber-light)'; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--color-barber-gray)'; }}>
                            {svc.active ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          <button onClick={() => openEdit(svc)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: 'var(--color-barber-gold)' }}
                            title="Editar"
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(212,175,55,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; }}>
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => setConfirmDelete(svc._id)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: '#ef4444' }}
                            title="Excluir"
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
            style={{ backgroundColor: 'var(--color-barber-dark)', border: '1px solid var(--color-barber-light)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold">{editingService ? 'Editar Serviço' : 'Novo Serviço'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg transition-colors"
                style={{ color: 'var(--color-barber-gray)' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-barber-light)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--color-barber-gray)'; }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-barber-gray)' }}>Nome do Serviço</label>
                <input className="input-field" placeholder="Ex: Corte + Barba" required
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-barber-gray)' }}>
                    <DollarSign size={13} className="inline mr-1" />Preço (R$)
                  </label>
                  <input className="input-field" type="number" min="0" step="0.50" placeholder="40.00" required
                    value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-barber-gray)' }}>
                    <Clock size={13} className="inline mr-1" />Duração (min)
                  </label>
                  <input className="input-field" type="number" min="5" step="5" placeholder="30" required
                    value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1">{editingService ? 'Salvar' : 'Criar Serviço'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center"
            style={{ backgroundColor: 'var(--color-barber-dark)', border: '1px solid var(--color-barber-light)' }}>
            <Trash2 size={40} className="mx-auto mb-4" style={{ color: '#ef4444' }} />
            <h3 className="text-lg font-bold mb-2">Excluir Serviço?</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--color-barber-gray)' }}>
              Esta ação não pode ser desfeita. Considere desativar ao invés de excluir.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2 px-4 rounded-lg font-semibold transition-colors"
                style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.15)'}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminSidebar>
  );
};

export default Servicos;
