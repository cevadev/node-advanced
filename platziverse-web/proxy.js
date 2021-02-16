"use strict";

const express = require("express");
const asyncify = require("express-asyncify");
const request = require("request-promise-native");

//obtenemos los parametros de configuracion
const { endpoint, apiToken } = require("./config.js");

const api = asyncify(express.Router());

//definicion de las rutas
//cuando se realice una peticion a: http://localhost:8080/api/agents se hace un peticion al API y obtenmos los datos y lo retornamos
//al cliente que utiliza esta ruta
api.get("/agents", async (req, res, next) => {
  //construimos la peticion http con el objeto options que pasamos al request
  const options = {
    method: "GET",
    url: `${endpoint}/api/agents`,
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
    //convertimos los datos de retorno en json
    json: true,
  };

  let result;
  try {
    result = await request(options);
  } catch (e) {
    return next(new Error(e.error.error));
  }
  //enviamos el resultado a quien nos hizo la peticion, en lugar de conectarnos directamente a la BD nos conectamos a una api
  //que nos entega la informacion, a este concepto llamamos de backend por frontend tenemos una app frontend que va a
  //realizar una peticion http a un backend existente
  res.send(result);
});

api.get("/agent/:uuid", async (req, res, next) => {});

api.get("/metrics/:uuid", async (req, res, next) => {});

api.get("/metrics/:uuid/:type", async (req, res, next) => {});

module.exports = api;
