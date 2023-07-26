const boom = require('@hapi/boom');

const { config } = require('./../config/config');

function checkApiKey(req, res, next) {
  const { apiKey } = req.headers["api"];
  if(!apiKey || apiKey !== config.apiKey) {
    next(boom.unauthorized('Invalid API Key'));
  }
  next();
}

function checkAdminRole(req, res, next) {
  const { user } = req;
  if(!user || (user && user.role !== 'admin')) {
    next(boom.unauthorized('Invalid user role'));
  }
  next();
}

function checkRoles(roles) {
  return (req, res, next) => {
    const user = req.user;
    if(!user || (user && !roles.includes(user.role))) {
      next(boom.unauthorized('Invalid user role'));
    }
    next();
  };
}

module.exports = { checkApiKey, checkAdminRole, checkRoles };
