"use strict";

const debug = require("debug")("platziverse:web");
const chalk = require("chalk");
//modulo path para pasar la ruta del directorio que maneja los contenidos estaticos
const path = require("path");

const { pipe } = require("./utils");

const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const proxy = require("./proxy.js");
const asyncify = require("express-asyncify");

//importamos la clase Agent para utilizarlo en el proyecto
const PlatziverseAgent = require("platziverse-agent");

const app = asyncify(express());
const server = http.createServer(app);

//creamos la instancia de socketio y pasamos la instancia del servidor que creamos
//para integrar socketio y express
//socketio se encargara de montar una ruta dentro del servidor de express que va a contener el codigo de JS del cliente
//para meterlo en el html y se encargara de hacer la conexion con el servidor y obtener informacion de una lado a otro
const io = socketio(server);

//generamos un objeto agent de la clase platziverseAgent para recibir la informacion que transitiran otro agents
const agent = new PlatziverseAgent();

//utilizamos el middleware de express llamado static para montar un static server, pasamos la ruta del directorio de recursos static
//__dirname representa la ubicacion actual donde se corre el script, public representa la carpeta con los recursos
app.use(express.static(path.join(__dirname, "public")));

//montamos el proxy para que cada vez que se realice una peticion a las rutas, la ruta se encargara de hacer la peticion
//nuevamente al modulos platziverse-api, para hacer esos pedidos utilzamos un cliente http basado en promesas
app.use("/", proxy);

//puerto para la app web
const port = process.env.PORT || 8080;

// Socket.io / WebSockets
//escuchamos el evento connect. Cada vez que un cliente se conecte al servidor de web socket entonces el evento se va a ejecutar
//y nos va a entregar un socket
io.on("connect", (socket) => {
  debug(`Connected ${socket.id}`);
  //integracion del agent con socketio
  //los eventos del agente se enviar al socket
  pipe(agent, socket);
});

//******* Manejos de errores en la app */
// Express Error Handler
app.use((err, req, res, next) => {
  debug(`Error: ${err.message}`);

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

process.on("uncaughtException", handleFatalError);
process.on("unhandledRejection", handleFatalError);

//escuchamos nuestro servidor
server.listen(port, () => {
  console.log(
    `${chalk.green("[platziverse-web]")} server listening on port ${port}`
  );
  //una vez que el servidor esta encendido, conectamos el agent
  agent.connect();
});
