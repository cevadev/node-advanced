/**
 * Creacion del objeto sequelize para la creacion de modelos
 */
"use strict";

const Sequelize = require("sequelize");

/**
 * Singleton: Un objeto singleton posee una sola instancia en toda la app. Cada vez que llamemos a una funcion
 * no va a crear multiples instancias sino que retornará una única instancia.
 */
let sequelize = null;

module.exports = function setupDatabase(config) {
  //si sequelize es null, inicializamos un nuevo objeto
  if (!sequelize) {
    sequelize = new Sequelize(config);
  }

  return sequelize;
};
