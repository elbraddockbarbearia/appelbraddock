const express = require('express');
const router = express.Router();
const { ativarPlano, consultarPlano, desativarPlano } = require('../controllers/planController');
const protect = require('../middleware/authMiddleware');

// GET  /api/plano/:clientId         → Consultar plano do cliente (admin)
router.get('/:clientId', protect(['admin']), consultarPlano);

// POST /api/plano/:clientId/ativar  → Ativar/renovar plano (admin)
router.post('/:clientId/ativar', protect(['admin']), ativarPlano);

// PUT  /api/plano/:clientId/desativar → Desativar plano (admin)
router.put('/:clientId/desativar', protect(['admin']), desativarPlano);

// Client Requests (User)
const { requestPlano, requestCancelamento } = require('../controllers/planController');
router.post('/request', protect(['client']), requestPlano);
router.post('/request-cancel', protect(['client']), requestCancelamento);

module.exports = router;
