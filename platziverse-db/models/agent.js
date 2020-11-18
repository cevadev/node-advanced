/**definimos nuestro modelo utilizando sequelize */
"use strict";

const Sequelize = require("sequelize");

const setupDatabase = require("../lib/db.js");

//exportamos una funcion
module.exports = function setupAgentModel(config) {
  const sequelize = setupDatabase(config);

  /**define() nos permite definir un modelo utilizando un objeto simple de js
   * retornamos un modelo llamado agent cada vez que se llame a la funcion setupAgentModel
   */
  return sequelize.define("agent", {
    //especificamos las propiedades del modelo agent
    uuid: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    hostname: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    pid: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    connected: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });
};
