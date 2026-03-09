const jwt = require('jsonwebtoken');

const protect = (roles = []) => (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Não autenticado. Token ausente.' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.user = decoded;                        // { id, role, barber_id? }
    req.barber_id = decoded.barber_id || null; // convenience for barber routes

    if (roles.length && !roles.includes(decoded.role)) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};

module.exports = protect;
