import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit2, Trash2, Eye, EyeOff, X, CheckCircle, Scissors, Percent, Link } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../services/api';

const defaultForm = { name: '', nickname: '', phone: '', specialties: '', commission_rate: 40, email: '', password: '' };

const initials = (name) => name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?';

const Barbeiros = () => {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBarber, setEditingBarber] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchBarbers = async () => {
    try {
      const { data } = await api.get('/barbers/admin');
      setBarbers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBarbers(); }, []);

  const openCreate = () => { setEditingBarber(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (b) => {
    setEditingBarber(b);
    setForm({ name: b.name, nickname: b.nickname || '', phone: b.phone || '', specialties: (b.specialties || []).join(', '), commission_rate: b.commission_rate || 0, email: b.email || '', password: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        nickname: form.nickname,
        phone: form.phone,
        specialties: form.specialties ? form.specialties.split(',').map(s => s.trim()).filter(Boolean) : [],
        commission_rate: parseFloat(form.commission_rate),
        email: form.email || undefined,
        password: form.password || undefined,
      };
      if (editingBarber) {
        await api.put(`/barbers/${editingBarber._id}`, payload);
      } else {
        await api.post('/barbers', payload);
      }
      setShowModal(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      fetchBarbers();
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao salvar barbeiro');
    }
  };

  const handleToggle = async (b) => {
    try {
      await api.put(`/barbers/${b._id}`, { active: !b.active });
      fetchBarbers();
    } catch { alert('Erro ao alterar status'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/barbers/${id}`);
      setConfirmDelete(null);
      fetchBarbers();
    } catch { alert('Erro ao excluir barbeiro'); }
  };

  const COLORS = ['#d4af37', '#818cf8', '#34d399', '#fb923c', '#f472b6', '#60a5fa'];
  const barberColor = (name) => COLORS[name?.charCodeAt(0) % COLORS.length] || COLORS[0];

  return (
    <AdminSidebar>
      <div className="animate-in fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Equipe de Barbeiros</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-barber-gray)' }}>
              {barbers.filter(b => b.active).length} ativos · {barbers.length} cadastrados
            </p>
          </div>
          <button onClick={openCreate} className="btn-primary">
            <PlusCircle size={18} /> Novo Barbeiro
          </button>
        </div>

        {saved && (
          <div className="flex items-center gap-3 p-4 rounded-xl mb-6 text-sm font-medium"
            style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
            <CheckCircle size={18} /> Barbeiro salvo com sucesso!
          </div>
        )}

        {/* Cards Grid */}
        {loading ? (
          <div className="text-center py-10" style={{ color: 'var(--color-barber-gray)' }}>Carregando...</div>
        ) : barbers.length === 0 ? (
          <div className="card text-center py-12">
            <Scissors size={40} className="mx-auto mb-4" style={{ color: 'var(--color-barber-gray)' }} />
            <p style={{ color: 'var(--color-barber-gray)' }}>Nenhum barbeiro cadastrado ainda.</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-barber-gray)' }}>Clique em "Novo Barbeiro" para começar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {barbers.map(b => {
              const color = barberColor(b.name);
              return (
                <div key={b._id} className="card relative" style={{ opacity: b.active ? 1 : 0.6 }}>
                  {/* Status Badge */}
                  <span className="absolute top-4 right-4 text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={b.active
                      ? { backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e' }
                      : { backgroundColor: 'rgba(107,114,128,0.15)', color: 'var(--color-barber-gray)' }}>
                    {b.active ? 'Ativo' : 'Inativo'}
                  </span>

                  {/* Avatar */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-black shrink-0"
                      style={{ backgroundColor: color }}>
                      {initials(b.name)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{b.name}</h3>
                      {b.nickname && <p className="text-sm" style={{ color: 'var(--color-barber-gold)' }}>"{b.nickname}"</p>}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-sm mb-4" style={{ color: 'var(--color-barber-gray)' }}>
                    {b.phone && <p>📱 {b.phone}</p>}
                    {b.specialties?.length > 0 && (
                      <p>✂️ {b.specialties.join(' · ')}</p>
                    )}
                    <p className="flex items-center gap-1">
                      <Percent size={13} /> Comissão: <span className="font-semibold text-white">{b.commission_rate}%</span>
                    </p>
                    {b.email && (
                      <p className="flex items-center gap-1 text-xs" style={{ color: '#22c55e' }}>
                        <Link size={11} /> Portal ativo
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3" style={{ borderTop: '1px solid var(--color-barber-light)' }}>
                    <button onClick={() => handleToggle(b)}
                      className="p-2 rounded-lg flex-1 flex items-center justify-center gap-1.5 text-xs font-medium transition-colors"
                      style={{ color: 'var(--color-barber-gray)', border: '1px solid var(--color-barber-light)' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-barber-light)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                      {b.active ? <EyeOff size={14} /> : <Eye size={14} />}
                      {b.active ? 'Desativar' : 'Ativar'}
                    </button>
                    <button onClick={() => openEdit(b)}
                      className="p-2 rounded-lg flex-1 flex items-center justify-center gap-1.5 text-xs font-medium transition-colors"
                      style={{ color: 'var(--color-barber-gold)', border: '1px solid rgba(212,175,55,0.3)' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(212,175,55,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                      <Edit2 size={14} /> Editar
                    </button>
                    <button onClick={() => setConfirmDelete(b._id)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
            style={{ backgroundColor: 'var(--color-barber-dark)', border: '1px solid var(--color-barber-light)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold">{editingBarber ? 'Editar Barbeiro' : 'Novo Barbeiro'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg"
                style={{ color: 'var(--color-barber-gray)' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-barber-light)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--color-barber-gray)'; }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-barber-gray)' }}>Nome Completo *</label>
                <input className="input-field" placeholder="Ex: João Silva" required
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-barber-gray)' }}>Apelido</label>
                  <input className="input-field" placeholder="Ex: João da Barbearia"
                    value={form.nickname} onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-barber-gray)' }}>WhatsApp</label>
                  <input className="input-field" placeholder="(00) 00000-0000"
                    value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-barber-gray)' }}>Especialidades (separadas por vírgula)</label>
                <input className="input-field" placeholder="Ex: Corte Degradê, Barba, Sobrancelha"
                  value={form.specialties} onChange={e => setForm(f => ({ ...f, specialties: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-barber-gray)' }}>
                  <Percent size={13} className="inline mr-1" />Taxa de Comissão (%)
                </label>
                <input type="number" min="0" max="100" step="1" className="input-field" placeholder="40"
                  value={form.commission_rate} onChange={e => setForm(f => ({ ...f, commission_rate: e.target.value }))} />
              </div>
              <div className="border-t pt-4 mt-2" style={{ borderColor: 'var(--color-barber-light)' }}>
                <p className="text-xs font-bold uppercase mb-3 tracking-wider" style={{ color: 'var(--color-barber-gold)' }}>Acesso ao Portal do Barbeiro</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-barber-gray)' }}>E-mail</label>
                    <input type="email" className="input-field" placeholder="barbeiro@email.com"
                      value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-barber-gray)' }}>
                      {editingBarber ? 'Nova Senha' : 'Senha'}
                    </label>
                    <input type="password" className="input-field" placeholder={editingBarber ? 'Deixe vazio pr manter' : '••••••••'}
                      value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1">{editingBarber ? 'Salvar' : 'Cadastrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center"
            style={{ backgroundColor: 'var(--color-barber-dark)', border: '1px solid var(--color-barber-light)' }}>
            <Trash2 size={40} className="mx-auto mb-4" style={{ color: '#ef4444' }} />
            <h3 className="text-lg font-bold mb-2">Excluir Barbeiro?</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--color-barber-gray)' }}>
              Esta ação não pode ser desfeita.
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

export default Barbeiros;
