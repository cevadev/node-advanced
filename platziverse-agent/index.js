"use strict";

//obtenemos la clase EventEmitter del paquete events de nodejs
const EventEmitter = require("events");

const options = {
  name: "untitled",
  username: "platzi",
  interval: 5000,
  mqtt: {
    host: "mqtt://localhost",
  },
};

/**
 *
 */
class PlatziverseAgent extends EventEmitter {
  //obtenemos el objeto options en el constructor
  constructor(opts) {
    //llamamos al constructor de la clase EventEmitter
    super();

    //mantenemos un referencia al objeto options
    this._options = opts;
    //manteneos una referencia internal si el timer inicializo o no
    this._started = false;
    //mantenemos una referencia interna al timer
    this._timer = null;
  }

  connect() {
    //nos concetamos solo si el timer no ha sido arrancado
    if (!this._started) {
      //indicamos que inicializo
      this._started = true;
      //emitimos el evento de connected
      this.emit("connected");
      //manejamos un referencia al objeto opts
      const opts = this._options;
      //creamos el timer y guardamos la referencia
      //cada vez que se cumple el tiempo en opts.interval emitimos un evento
      this._timer = setInterval(() => {
        this.emit("agent/message", "this is a message");
      }, opts.interval);
    }
  }

  disconnect() {
    if (this._started) {
      clearInterval(this._timer);
      this._started = false;
      this.emit("disconnected", this._agentId);
      //this._client.end();
    }
  }
}

module.exports = PlatziverseAgent;
