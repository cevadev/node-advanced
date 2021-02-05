"use strict";

//obtenemos la clase EventEmitter del paquete events de nodejs
const EventEmitter = require("events");

/**
 *
 */
class PlatziverseAgent extends EventEmitter {
  constructor() {
    //llamamos al constructor de la clase EventEmitter
    super();
  }
}

module.exports = PlatziverseAgent;
