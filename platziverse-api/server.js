"use strict";

const debug = require("debug")("platziverse:api");
//importamos modulo http para crea un servidor web
const http = require("http");
const chalk = require("chalk");
//modulo de express que crea un request handler o funcion que se ejecuta cada vez que llega una peticion al server
const express = require("express");

//1.creamos nuestra app de express
const app = express();
//2.creamos una instancia del servidor http. Pasamos app como el request handler
const server = http.createServer(app);
//3. definimos el puerto de escucha
const port = process.env.PORT || 3000;

//4.definicion de rutas

function handleFatalError(err) {
  console.error(`${chalk.red("[fatal error]")} ${err.message}`);
  console.error(err.stack);
  process.exit(1);
}

if (!module.parent) {
  process.on("uncaughtException", handleFatalError);
  process.on("unhandledRejection", handleFatalError);

  //escuchamos el servidor en el puerto
  server.listen(port, () => {
    console.log(
      `${chalk.green("[platziverse-api]")} server listening on port ${port}`
    );
  });
}

module.exports = server;
