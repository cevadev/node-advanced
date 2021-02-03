/**
 * SERVIDOR MQTT
 */

"use strict";

const debug = require("debug")("platziverse:mqtt");
const mosca = require("mosca");
const redis = require("redis");
const chalk = require("chalk");
//referenciamos nuestra conexion a la bd
const db = require("platziversedb");

//config para el objeto de base de datos
const config = require("platziversedb/utils/configdb.js")(false);

const { parsePayload } = require("./utils.js");
const agent = require("platziversedb/models/agent");

//Instanciamos la funcion de BD y obtener los servicios de agent y metric
//definimos los servicios agent y metric
let Agent, Metric;

//inicializamos el servidor con mosca
//informacion del objeto del backend
const backend = {
  type: "redis",
  //pasamos la instancia de redis
  redis,
  //propiedad para que redis retorne los buffers
  return_buffers: true,
};

//archivo config
const settings = {
  //puerto del servidor por defecto mqtt
  port: 1883,
  //informacion del backend
  backend,
};

//Persistencia de los mensajes en la BD
//establecemos una referencia de todos los agente que tenemos conectados
const clients = new Map();

//instanciamos el servidor de mosca
const server = new mosca.Server(settings);

//evento 'clientConnected' informa cuando un cliente de mqtt se conecta al servidor
server.on("clientConnected", (client) => {
  //mqtt genera automaticamente el id
  debug(`Client connected: ${client.id}`);
  //cada vez que un cliente se conecte, lo agregamos en el mapa a traves del id, y la informacion del agente
  clients.set(client.id, null);
});

//evento cuando un cliente se desconecta
server.on("clientDisconnected", (client) => {
  debug(`Client disconnected: ${client.id}`);
});

//evento cuando se publica un mensaje: recibimos un paquete y el cliente que envio el paquete
//la funcion del evento published es async porque usamos el await para llamar a la funcion createOrUpdate del Agent
server.on("published", async (packet, client) => {
  //topic: es el tipo de mensaje, en nuestro caso sera Agent Connected, Agent Disconnected o Agent message
  debug(`Received: ${packet.topic}`);

  //hacemos un switch cuando nos llegue un mensaje
  switch (packet.topic) {
    case "agent/connected":
    case "agent/disconnected":
      debug(`Payload: ${packet.payload}`);
      break;
    case "agent/message":
      //imprimimos el payload que nos llego
      debug(`Payload: ${packet.payload}`);
      //obtenemos el mensaje enjson que nos envia el agente de monitoreo procesarlo y almacenarlo en la BD
      //convertimos a JSON el payload que nos llega del packet
      const payload = parsePayload(packet.payload);
      //verificamos que nos haya llegado el payload
      if (payload) {
        //le definimos propiedades al agent. el agente está conectado porque estamos recibiendo un mensaje del agente
        payload.agent.connected = true;

        //preparamos el agente para almacenarlo en la base de datos
        let agent;
        try {
          agent = await Agent.createOrUpdate(payload.agent);
        } catch (error) {
          //con return salimos de la funcion, si llega un agente con mala información lo ignoramos y seguimos esperando
          //a un mensaje correcto
          return handleError(error);
        }
      }
      debug(`Agent ${agent.uuid} saved`);

      //notificamos que el agent esta conectado. verificamos si el map clients no tienen un agente con el id del client
      //del que recibimos el mensaje, si no lo tiene el map lo agregamos al mismo
      if (!clients.get(client.id)) {
        // Vamos hacer un broadcast o notificar a todos los clientes que esten conectados en este evento o
        //broker que un agente se conectó
        clients.set(client.id, agent);

        clients.set(client.id, agent);
        server.publish({
          topic: "agent/connected",
          payload: JSON.stringify({
            agent: {
              uuid: agent.uuid,
              name: agent.name,
              username: agent.username,
              hostname: agent.hostname,
              pid: agent.pid,
              connected: agent.connected,
            },
          }),
        });
      }

      //IMPLEMENTACION PARA ALMACENAR LAS METRICS VA AQUI///

      break;
  }
});

//el objeto server es un eventemitter, esto significa que podemos agregar listeners cuando el servidor lance ciertos eventos
//lanzamos el evento cuando el servidor este listo 'ready'
//La funcion de configuracion de la BD resuelve una promesa usamos async una vez que el server mqtt inicializa es decir esta ready
//cada vez que hacemos la conexion, mqtt se va a conectar a la BD
server.on("ready", async () => {
  //instanciamos la BD
  const services = db(config).catch(handleFatalError);

  //seteamos el objeto Agent y Metric
  Agent = services.Agent;
  Metric = services.Metric;

  console.info(`${chalk.green("[platziverse-mqtt]")} server is running`);
});

//manejo de errores en el servidor
server.on("error", handleFatalError);

function handleFatalError(err) {
  console.error(`${chalk.red("[fatal error]")} ${err.message}`);
  console.error(err.stack);
  process.exit(1);
}

//interceptamos cualquier excepcion que no fue manejada
process.on("uncaughtException", handleFatalError);
//controlamos el reject de alguna promesa
process.on("unhandledRejection", handleFatalError);

function handleError(err) {
  console.error(`${chalk.red("[error]")} ${err.message}`); // Imprimimos el mensaje de error
  console.error(err.stack); // Imprimimos el tipo de error que esta ocurriendo
  // process.exit(1) // Matamos el proceso retornando un código 1, que es un código de error
}
