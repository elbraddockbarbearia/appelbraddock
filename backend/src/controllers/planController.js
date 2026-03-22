const Client = require('../../data/models/Client');
const { createNotification } = require('./notificationController');

// ─── Ativar ou Renovar Plano ─────────────────────────────────────────────────
const ativarPlano = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { tipo = 'normal' } = req.body;

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: 'Cliente não encontrado.' });

    const dataPagamento = new Date();
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + 30);

    const cortesTotais = tipo === 'vip' ? 4 : 4; // ambos têm 4 cortes; VIP tem benefícios extras
    const cortesRestantes = cortesTotais;

    client.plano = {
      ativo: true,
      tipo,
      dataPagamento,
      dataVencimento,
      cortesRestantes,
      cortesTotais,
    };

    await client.save();

    await createNotification({
      recipient_type: 'admin',
      type: 'plan_activated',
      message: `✅ Plano ativado para ${client.name} — válido até ${dataVencimento.toLocaleDateString('pt-BR')}`,
      data: { clientId, tipo },
    });

    res.json({ message: 'Plano ativado com sucesso!', plano: client.plano });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Consultar Plano de um Cliente ───────────────────────────────────────────
const consultarPlano = async (req, res) => {
  try {
    const { clientId } = req.params;
    const client = await Client.findById(clientId).select('name phone plano');
    if (!client) return res.status(404).json({ message: 'Cliente não encontrado.' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Desativar Plano (bloqueio manual) ───────────────────────────────────────
const desativarPlano = async (req, res) => {
  try {
    const { clientId } = req.params;
    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: 'Cliente não encontrado.' });

    client.plano.ativo = false;
    client.plano.cortesRestantes = 0;
    await client.save();

    res.json({ message: 'Plano desativado.', plano: client.plano });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Solicitar Ativação (Cliente) ───────────────────────────────────────────
const requestPlano = async (req, res) => {
  try {
    const { tipo } = req.body;
    const client = await Client.findById(req.user.id);
    if (!client) return res.status(404).json({ message: 'Cliente não encontrado.' });

    await createNotification({
      recipient_type: 'admin',
      type: 'plan_request',
      message: `📢 ${client.name} tem interesse no Plano ${tipo.toUpperCase()}.`,
      data: { clientId: client._id, name: client.name, phone: client.phone, tipo }
    });

    res.json({ message: 'Solicitação enviada!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Solicitar Cancelamento (Cliente) ───────────────────────────────────────
const requestCancelamento = async (req, res) => {
  try {
    const client = await Client.findById(req.user.id);
    if (!client) return res.status(404).json({ message: 'Cliente não encontrado.' });

    await createNotification({
      recipient_type: 'admin',
      type: 'plan_cancel_request',
      message: `⚠️ ${client.name} solicitou o CANCELAMENTO do plano.`,
      data: { clientId: client._id, name: client.name, phone: client.phone }
    });

    res.json({ message: 'Solicitação de cancelamento enviada!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { ativarPlano, consultarPlano, desativarPlano, requestPlano, requestCancelamento };
