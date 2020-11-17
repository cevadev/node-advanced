'use strict'
const debug = require('debug')('platziverse:db:setup');
const db = require('./index.JS');
const properties = require('./config.js');

async function setup(){
    //definimos el objeto de configuracion que necesita sequelize
    const config = {
        database: properties.databaseName,
        username: properties.username,
        password: properties.password,
        host: properties.host,
        port: properties.port,
        /**Siquelize puede conectarse a multiples tipos de BD deacuerdo al tipo de BD se ebe especificar el dialecto */
        dialect: properties.dialect,
        //cada mensaje que llega del login lo debe ejecutar como una function
        logging: function(message){
            debug(message);
        },
        setup: true,
        operatorAliases: false,
    }

    await db(config)
        .catch((error)=>{
            console.error(error.message);
            console.error(error.stack);
            process.exit(1);
        });
    console.info('Success...'),
    process.exit(0);
}

setup();