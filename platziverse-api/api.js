"use strict";

const debug = require("debug")("platziverse:api:routes");
const express = require("express");
const asyncify = require("express-asyncify");

//instanciamos la clase Router de express, aplicamos asyncify que nos permite soportar async/await en las rutas
const api = asyncify(express.Router());

//referenciamos el modulo de base de datos
const db = require("platziversedb");

//obtenemos el objeto de configuracion
const config = require("platziverseutils/configDB");

let services, Agent, Metric;

//manejo de errores
const { AgentNotFoundError } = require("./errors.js");

//creamos la instancia de la bd una sola vez, cuando se realiza una peticion y la bd no existe, entonces creamos la instancia de BD
//llamamos a un middleware de interseccion es decir, el middleware se ejecutara cada vez que se realiza una peticion
api.use("*", async (req, res, next) => {
  //si no se han obtenido los servicios
  if (!services) {
    debug("Connecting to database");
    try {
      services = await db(config.db);
    } catch (e) {
      //si ocurre un error, pasamos el error al manesajdor de errores de express
      return next(e);
    }
    //obtenemos del services Agent y Metric
    Agent = services.Agent;
    Metric = services.Metric;
  }
  //llamamos a next() para que el middleware contiene la ejecucion del request y llegue a las demas rutas
  next();
});

//definimos las rutas para el servidor de express
//1.ruta get ('/agents') -< nos retorna los agents conectados al servidor
api.get("/agents", (req, res) => {
  debug("A request has come to /agents");
  //retornamos un objeto con send(), para nuestro ejemplo es vacio
  res.send({});
});

//2. ruta get ('/agent/:uuid')-> al pasar el parametro uuid obtenemos el agent correspondiente a ese uuid
api.get("/agent/:uuid", (req, res, next) => {
  const { uuid } = req.params;

  //manejamos posibles errores
  if (uuid !== "yyy") {
    //ejecutamos la funcion next() de esta ruta y pasamos el objeto de error
    return next(new AgentNotFoundError(uuid));
  }

  res.send({ uuid });
});

//3.ruta get ('/metrics/:uuid')-> obtenemos las metrics del agente segun el parametro uuid que se pase
api.get("/metrics/:uuid", (req, res) => {
  const { uuid } = req.params;
  res.send({ uuid });
});

//4. ruta get ('/metrics/:uuid/:type')-> obtenemos todas las metricas segun el type del agent segun uuid
api.get("/metrics/:uuid/:type", (req, res) => {
  const { uuid, type } = req.params;
  res.send({ uuid, type });
});

module.exports = api;
