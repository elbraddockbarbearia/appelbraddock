import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, CheckCircle, Crown, Info, MessageSquare, XCircle } from 'lucide-react';
import api from '../../services/api';

const Subscription = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [requestLoading, setRequestLoading] = useState(false);
    const [clientData, setClientData] = useState(() => {
        try {
            const stored = localStorage.getItem('client');
            return stored ? JSON.parse(stored) : null;
        } catch(e) { return null; }
    });

    const fetchFreshData = async () => {
        try {
            const { data } = await api.get('/auth/me');
            setClientData(data);
            localStorage.setItem('client', JSON.stringify(data));
        } catch(e) { console.error(e); }
    };

    useEffect(() => {
        if (clientData) fetchFreshData();
    }, []);

    if (!clientData) return <Navigate to="/login" replace />;

    const handleRequest = async (planType) => {
        setRequestLoading(true);
        try {
            // We can send a notification to the admin
            await api.post('/plano/request', { tipo: planType });
            alert('Solicitação enviada! Em breve entraremos em contato para confirmar sua ativação. 🚀');
        } catch (error) {
            alert(error.response?.data?.message || 'Erro ao enviar solicitação. Tente novamente ou fale no WhatsApp.');
        } finally {
            setRequestLoading(false);
        }
    };

    const handleCancelRequest = async () => {
        if (!window.confirm('Tem certeza que deseja solicitar o cancelamento do seu plano?')) return;
        setRequestLoading(true);
        try {
            await api.post('/plano/request-cancel');
            alert('Solicitação de cancelamento enviada. Falaremos com você em breve.');
        } catch (error) {
            alert(error.response?.data?.message || 'Erro ao enviar solicitação.');
        } finally {
            setRequestLoading(false);
        }
    };

    const PlanCard = ({ title, price, cuts, benefits, type, icon: Icon, color, popular }) => {
        const isCurrent = clientData.plano?.ativo && clientData.plano?.tipo === type;
        
        return (
            <div className={`card relative overflow-hidden transition-all duration-300 ${popular ? 'border-2 border-barber-gold' : 'border border-barber-light'}`}>
                {popular && (
                    <div className="absolute top-0 right-0 bg-barber-gold text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                        Recomendado
                    </div>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
                        <Icon size={24} style={{ color }} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold font-display">{title}</h3>
                        <p className="text-xs text-barber-gray uppercase tracking-widest">{cuts}</p>
                    </div>
                </div>

                <div className="mb-6">
                    <span className="text-3xl font-black font-display text-white">R$ {price}</span>
                    <span className="text-barber-gray text-sm ml-1">/mês</span>
                </div>

                <ul className="space-y-3 mb-8">
                    {benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                            <span className="text-gray-300">{b}</span>
                        </li>
                    ))}
                </ul>

                {isCurrent ? (
                    <div className="flex flex-col gap-2">
                        <button disabled className="w-full py-3 rounded-xl bg-green-500/10 text-green-500 font-bold flex items-center justify-center gap-2 border border-green-500/20">
                            <CheckCircle size={18} /> Seu Plano Atual
                        </button>
                        <button 
                            onClick={handleCancelRequest}
                            disabled={requestLoading}
                            className="text-xs text-center text-red-400/60 hover:text-red-400 transition-colors py-2"
                        >
                            Solicitar cancelamento
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={() => handleRequest(type)}
                        disabled={requestLoading}
                        className={`w-full py-4 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] ${popular ? 'bg-barber-gold text-black shadow-lg shadow-barber-gold/20' : 'bg-white text-black'}`}
                    >
                        {requestLoading ? 'Enviando...' : 'Assinar Agora'}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen pb-12 px-6 pt-10 bg-barber-black max-w-sm mx-auto">
            <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-barber-gold hover:text-white transition-colors">
                <ArrowLeft size={20} /> Voltar
            </button>

            <header className="mb-10 text-center">
                <h1 className="text-4xl font-display font-black mb-3">Assinaturas</h1>
                <p className="text-barber-gray text-sm balance">Economize e garanta seu visual em dia com nossos planos mensais.</p>
            </header>

            {clientData.plano?.ativo && (
                <div className="card mb-10 border border-green-500/30 bg-green-500/5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-bold text-green-500 uppercase">Plano Ativo</span>
                    </div>
                    <p className="text-sm">Você tem <strong>{clientData.plano.cortesRestantes} cortes</strong> disponíveis até <strong>{new Date(clientData.plano.dataVencimento).toLocaleDateString('pt-BR')}</strong>.</p>
                </div>
            )}

            <div className="space-y-6">
                <PlanCard 
                    type="normal"
                    title="Plano Braddock"
                    price="120,00"
                    cuts="4 cortes por mês"
                    color="#cba052"
                    icon={CreditCard}
                    benefits={[
                        "4 cortes de cabelo no mês",
                        "Validade de 30 dias",
                        "Agendamento via App",
                        "Não acumula para o mês seguinte"
                    ]}
                />

                <PlanCard 
                    type="vip"
                    title="Plano VIP"
                    price="180,00"
                    cuts="4 cortes + barba"
                    color="#6d28d9"
                    popular={true}
                    icon={Crown}
                    benefits={[
                        "4 cortes de cabelo no mês",
                        "Acabamento de barba incluso",
                        "Prioridade no agendamento",
                        "Bebida de cortesia (Café ou Água)",
                        "10% de desconto em produtos"
                    ]}
                />
            </div>

            <div className="mt-12 text-center card bg-barber-dark/50 border-barber-light">
                <Info size={24} className="text-barber-gold mx-auto mb-3" />
                <h4 className="font-bold mb-2">Dúvidas?</h4>
                <p className="text-xs text-barber-gray mb-6">Fale conosco para saber mais sobre formas de pagamento e ativação presencial.</p>
                <a 
                    href={`https://wa.me/55${clientData.phone}?text=Olá! Tenho interesse nos planos de assinatura.`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                    <MessageSquare size={18} /> Chamar no WhatsApp
                </a>
            </div>
        </div>
    );
};

export default Subscription;
