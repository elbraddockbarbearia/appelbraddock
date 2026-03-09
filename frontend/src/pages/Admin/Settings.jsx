import React from 'react';
import { Save } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';

const Settings = () => {
  return (
    <AdminSidebar>
      <div className="animate-in fade-in max-w-4xl mx-auto">
        <h1 className="text-3xl font-display font-bold mb-8">Configurações do Sistema</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Services Config */}
          <div className="card space-y-4">
            <h2 className="text-xl font-bold mb-4 border-b border-barber-light pb-2">Serviços e Preços</h2>
            
            <div className="flex items-center justify-between bg-barber-black p-3 rounded-lg border border-barber-light">
              <div>
                <p className="font-semibold text-white">Corte</p>
                <p className="text-xs text-barber-gray">30 minutos</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-barber-gold font-bold">R$</span>
                <input type="number" defaultValue={40} className="w-16 input-field py-1 px-2 text-right" />
              </div>
            </div>

            <div className="flex items-center justify-between bg-barber-black p-3 rounded-lg border border-barber-light">
              <div>
                <p className="font-semibold text-white">Barba</p>
                <p className="text-xs text-barber-gray">30 minutos</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-barber-gold font-bold">R$</span>
                <input type="number" defaultValue={25} className="w-16 input-field py-1 px-2 text-right" />
              </div>
            </div>

            <div className="flex items-center justify-between bg-barber-black p-3 rounded-lg border border-barber-light">
              <div>
                <p className="font-semibold text-white">Corte + Barba</p>
                <p className="text-xs text-barber-gray">60 minutos</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-barber-gold font-bold">R$</span>
                <input type="number" defaultValue={60} className="w-16 input-field py-1 px-2 text-right" />
              </div>
            </div>

            <button className="text-barber-gold text-sm font-medium hover:underline w-full text-center mt-2">+ Adicionar Novo Serviço</button>
          </div>

          {/* Operating Hours */}
          <div className="card space-y-4">
            <h2 className="text-xl font-bold mb-4 border-b border-barber-light pb-2">Horário de Funcionamento</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-barber-gray mb-1">Dias da Semana</label>
                <input type="text" className="input-field" defaultValue="Seg - Sab" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-barber-gray mb-1">Abertura</label>
                  <input type="time" className="input-field" defaultValue="09:00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-barber-gray mb-1">Fechamento</label>
                  <input type="time" className="input-field" defaultValue="19:30" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-barber-gray mb-1">Intervalo entre Horários</label>
                <select className="input-field" defaultValue="30">
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="45">45 minutos</option>
                  <option value="60">60 minutos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loyalty Program */}
          <div className="card space-y-4 md:col-span-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-barber-gold/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>
            <h2 className="text-xl font-bold mb-4 border-b border-barber-light pb-2 flex items-center text-barber-gold"> Programa de Fidelidade</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-barber-gray mb-1">Cortes para Ganhar Recompensa</label>
                <input type="number" className="input-field" defaultValue={10} />
              </div>
              <div>
                <label className="block text-sm font-medium text-barber-gray mb-1">Recompensa</label>
                <input type="text" className="input-field border-barber-gold focus:ring-barber-gold" defaultValue="1 Corte Grátis" />
              </div>
            </div>
          </div>

        </div>

        <div className="mt-8 flex justify-end">
          <button className="btn-primary flex items-center space-x-2 px-8">
            <Save size={20} />
            <span>Salvar Alterações</span>
          </button>
        </div>

      </div>
    </AdminSidebar>
  );
};

export default Settings;
