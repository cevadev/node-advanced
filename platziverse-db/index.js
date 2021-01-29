//MODULO PRINCIPAL

"use strict";

//nos permite crear un objeto de configuracion de BD por defecto
const defaults = require("defaults");

//funcion para la configuracion de la BD
const setupDatabase = require("./lib/db.js");

const setupAgentModel = require("./models/agent.js");

const setupMetricModel = require("./models/metric.js");

const setupMetric = require("./lib/metric.js");

const setupAgent = require("./lib/agent.js");

//exportamos una funcion async y que al ser llamada retornará unna promesa que al ser resuelva retorna los objetos Metric y Agent
//el que llame esta funcion async debe hacer el control de errores
module.exports = async function (config) {
  /**
   * Redefinimos el objeto de configuracion con cierto valores por defecto (defaults). Si no le pasamos un objeto de configuracion
   * automaticamente tomara nuestro objeto config con sus valores por defecto donde no se contectara a postgres
   * sino que utilizara una bd en memoria sqlite
   */
  config = defaults(config, {
    dialect: "sqlite",
    pool: {
      max: 10,
      min: 0,
      idle: 10000,
    },
    query: {
      //cada uno de los queries deben devolver objetos json
      raw: true,
    },
  });

  //obtenemos la instancia de sequelize, agent y metric models y creamos el singleton
  const sequelize = setupDatabase(config);
  //funcion para la configuracion del modelo Agent
  const AgentModel = setupAgentModel(config);
  //funcion para la configuración del modelo Metric
  const MetricModel = setupMetricModel(config);

  //empezamos a definir las relaciones entre las entidades Agent y Metric
  AgentModel.hasMany(MetricModel);
  MetricModel.belongsTo(AgentModel);

  /**
   * validamos que la BD esta bien configurada
   * authenticate() -> esta funcion que retorna una promesa se conecta a la bd hace un query basico y verifica si hay conexion
   * al retornar una promesa podriamos utilizar el .then() pero vamos usar el await y asi la promesa será ejecutada
   * y la funcion se queda en pausa hasta que la promesa sea resuelta, si hay un error la funcion deja de ejecutarse
   * y ya no se ejecuta el codigo siguiente
   */
  await sequelize.authenticate();

  if (config.setup) {
    //sincronizamos las bd (crear la base de datos en el servidor si la bd existe se elimina y se vuelve a crear)
    await sequelize.sync({ force: true });
  }

  /**
   * configuracion de la base de datos. sync() hace que todas las definiciones de los modelos que existen en la app si no
   * existen en la bd y tablas respectivas estas son creadas automaticamente
   */
  //sequelize.sync()

  const Agent = setupAgent(AgentModel);
  const Metric = setupMetric(MetricModel, AgentModel);

  /**
   * cuando se llame a nuestra funcion, retornamos los objetos. Al momento de crearla Bd y sus tablas Sequelize automaticamente
   * creará el id para la entidad agent y metric para la realacion entre las dos tablas
   */
  return {
    //al ser iguales variable y propiedad podriamos simplemente escribir Agent, Metric y seria igual
    Agent,
    Metric,
  };
};
