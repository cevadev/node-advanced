/**
 * Creacion del objeto sequelize para la creacion de modelos
 */
'use strict'

const Sequelize =  require('sequelize');

/**
 * Singleton: Un objeto singleton posee una sola instancia en toda la app. Cada vez que llamemos a una funcion
 * no va a crear multiples instancias.
 */
let sequelize = null;

module.exports = function setupDatabase(config){
    //si sequelize es null
    if(!sequelize){
        sequelize = new Sequelize(config);
    }

    return sequelize;
}