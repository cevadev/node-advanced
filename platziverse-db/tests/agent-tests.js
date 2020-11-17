'use strict'

const test = require('ava');

let config = {
  logging () {}
}

let db = null;

/**
 * Antes de la ejecucion de cada test ejecuta la funcion para configurar la BD.
 */
test.beforeEach(async function(){
    const setupDatabase = require('../index.js');
    //definimos una variable global de BD. le pasamos un config
    db = await setupDatabase(config);
});


/**
 * Verificamos que el objeto Agent retornado por la funcion de configuracion de BD exista
 */
test('make it pass', function(t){
    t.truthy(db.Agent, 'Agent service should exists');
})