/**
 * Script donde utilizamos el modulo de base de datos para interactuar con la BD
 */
"use strict";

const db = require("../");

async function run() {
  //nuestro modulos de BD require un objeto de configuracion
  const config = {
    database: process.env.DB_NAME || "platziverse",
    username: process.env.DB_USER || "platzi",
    password: process.env.DB_PASS || "platzi",
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
  };

  //obtenemos los servicios de Agent y Metric de la BD
  const { Agent, Metric } = await db(config).catch(handleFatalError);

  //1. creamos un agent en la BD
  const agent = await Agent.createOrUpdate({
    uuid: "xxx",
    name: "test",
    username: "test",
    hostname: "test",
    pid: 1,
    connected: true,
  }).catch(handleFatalError);

  console.info("Agent created");
  console.info(agent);

  //2. obtenemos todos los agentes
  const agents = await Agent.findAll().catch(handleFatalError);
  console.log("--agents--");
  console.info(agents);

  //3. creamos una metrica
  const metric = await Metric.create(agent.uuid, {
    type: "memory",
    value: "300",
  }).catch(handleFatalError);

  console.log("--Metric--");
  console.info(metric);

  //4. busqueda de metricas por el uuid del agente
  const metrics = await Metric.findByAgentUuid(agent.uuid).catch(
    handleFatalError
  );
  console.log("--Get Metric--");
  console.info(metrics);

  //5. obtenemos las metricas segun eltipo
  const metricsByType = await Metric.findByTypeAgentUuid(
    "memory",
    agent.uuid
  ).catch(handleFatalError);
  console.log("Get all Metrics");
  console.info(metricsByType);
}

function handleFatalError(err) {
  console.error(err.message);
  console.error(err.stack);
  process.exit(1);
}

run();
