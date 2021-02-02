"use strict";

const debug = require("debug")("platziverse:mqtt");
const mosca = require("mosca");
const redis = require("redis");
const chalk = require("chalk");

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
  //puerto del servidor mqtt
  port: 6379,
  //informacion del backend
  backend,
};

//instanciamos el servidor de mosca
const server = new mosca.Server(settings);

//el objeto server es un eventemitter, esto significa que podemos agregar listeners cuando el servidor lance ciertos eventos
//lanzamos el evento cuando el servidor este listo 'ready'
server.on("ready", () => {
  console.info(`${chalk.green("[platziverse-mqtt]")} server is running`);
});
