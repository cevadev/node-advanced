"use strict";

const debug = require("debug")("platziverse:api");
//importamos modulo http para crea un servidor web
const http = require("http");
const chalk = require("chalk");
//modulo de express que crea un request handler o funcion que se ejecuta cada vez que llega una peticion al server
const express = require("express");
const asyncify = require("express-asyncify");

//importamos la rutas definidas en el api
const api = require("./api.js");

//1.creamos nuestra app de express, hacemos un wrap con asyncify para que express soporte funciones async
const app = asyncify(express());
//2.creamos una instancia del servidor http. Pasamos app como el request handler
const server = http.createServer(app);
//3. definimos el puerto de escucha
const port = process.env.PORT || 3000;

//4. definimos un middleware de express. al final nuestras rutas seran: /api/agents, /api/agent/:uuid etc
app.use("/api", api);

//5. definimos el middleware para el manejo de errores. Este middleware recibe primero el error los objeto request y response
//el objeto next siempre lo tendra el middleware que maneja errores
app.use((err, req, res, next) => {
  debug(`Error: ${err.message}`);
  //preguntamos si el objeto err tiene en su mensaje algo que diga not found
  if (err.message.match(/not found/)) {
    return res.status(404).send({ error: err.message });
  }

  res.status(500).send({ error: err.message });
});

function handleFatalError(err) {
  console.error(`${chalk.red("[fatal error]")} ${err.message}`);
  console.error(err.stack);
  process.exit(1);
}

//si el server.js no es requerido entonces lanzamos el server, de lo contrario hacemos un module.exports del server.js
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
//de lo contrario exportamos el server
module.exports = server;
