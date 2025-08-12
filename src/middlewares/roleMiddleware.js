
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
      if (!req.user || !req.user.roles) {
        return res.status(403).json({ message: 'Accès refusé : rôle manquant' });
      }
  
      const userRoles = req.user.roles;
      const hasRole = allowedRoles.some(role => userRoles.includes(role));
  
      if (!hasRole) {
        return res.status(403).json({ message: 'Accès refusé : rôle insuffisant' });
      }
  
      next();
    };
  };
  
  module.exports = requireRole;
  