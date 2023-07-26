const boom = require('@hapi/boom');

const { models } = require ('./../libs/sequelize');

const bcrypt = require('bcrypt');

class UserService {
  constructor() {}

  async create(data) {
    const hash = await bcrypt.hash(data.password, 10);
    const user = await models.User.create({
      ...data,
      password: hash
    });
    delete user.dataValues.password;
    return user;
  }

  async find() {
    const users = await models.User.findAll({
      include: ['team']
    });
    return users;
  }

  async findOne(id) {
    const user = await models.User.findByPk(id, {
      include: ['team']
    });
    if (!user) {
      throw boom.notFound(`No se encontro al usuario con id ${id}`);
    }
    return user;
  }

  async update(id, changes) {
    const user = await models.User.findByPk(id);
    if (!user) {
      throw boom.notFound(`No se encontro al usuario con id ${id}`);
    }
    const rta = await user.update(changes);
    return rta;
  }

  async delete(id) {
    const user = await models.User.findByPk(id);
    if (!user) {
      throw boom.notFound(`No se encontro al usuario con id ${id}`);
    }
    await user.destroy();
    return { message: `Usuario con id ${id} eliminado`};
  }
}

module.exports = UserService;
