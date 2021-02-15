"use strict";

/**
 * Cliente que nos permite conectarnos a un servidor remoto
 */

//obtenemos el hostname del modulo os de node
const os = require("os");

//requerimo debug e inicializamos
const debug = require("debug")("platziverse:agent");

//requerimos el cliente mqtt
const mqtt = require("mqtt");

const defaults = require("defaults");

const { parsePayload } = require("./utils.js");

//modulo que genera un unico uuid
const uuid = require("uuid");

//importamos util de nodejs para transformar una funcion callback normal a una promise
const util = require("util");

//defnicion de nuestro objeto options
const options = {
  name: "untitled",
  username: "platzi",
  //intervalo de comunicacion sera de 5 seg
  interval: 5000,
  //host de comnicacion o donde se encuentra el server mqtt es el localhost
  mqtt: {
    host: "mqtt://localhost",
  },
};

//obtenemos la clase EventEmitter del paquete events de nodejs
const EventEmitter = require("events");

/* const options = {
  name: "untitled",
  username: "platzi",
  interval: 5000,
  mqtt: {
    host: "mqtt://localhost",
  },
}; */

/**
 *
 */
class PlatziverseAgent extends EventEmitter {
  //obtenemos el objeto options en el constructor
  constructor(opts) {
    //llamamos al constructor de la clase EventEmitter
    super();

    //mantenemos un referencia al objeto options
    this._options = defaults(opts, options); //pasamos al objeto opts las options seteadas
    //manteneos una referencia internal si el timer inicializo o no
    this._started = false;
    //mantenemos una referencia interna al timer
    this._timer = null;
    //mantenemos un referencia al cliente
    this._client = null;
    //mantenemos un referencia al agent
    this._agentId = null;
    //mapa donde almacenamos el nombre de la metrica y la funcion donde vamos a obtener el valor
    this._metrics = new Map();
  }
  /**
   * Nuestras metricas van a ser dinamicas por lo que tenemos que especificar como se van a hacer las metricas
   * por medio de funciones
   * @param {} type tipo de la metrica
   * @param {*} fn funcion que especifica como realizar dicha metrica
   */
  addMetric(type, fn) {
    this._metrics.set(type, fn);
  }

  removeMetric(type) {
    this._metrics.delete(type);
  }

  connect() {
    //nos concetamos solo si el timer no ha sido arrancado
    if (!this._started) {
      //manejamos un referencia al objeto opts
      const opts = this._options;

      //nos conetamos al cliente por medio de mqtt
      this._client = mqtt.connect(opts.mqtt.host); //pasamos el host del objeto options
      //indicamos que inicializo
      this._started = true;

      //nos suscribimos a los 3 tipos de mensajes que queremos escuchar. asi el cliente nos va a notificar cuando recibimos
      //mensajes del server mqtt
      this._client.subscribe("agent/message");
      this._client.subscribe("agent/connected");
      this._client.subscribe("agent/disconnected");

      //establecemos el evento connect, cuando la conexion es exitosa vamos a ejecutar una funcion anonima
      this._client.on("connect", () => {
        //luego de una conexion eitosa, generamos un nuevo uuid para el agent
        this._agentId = uuid.v4();

        //emitimos el evento de connected y pasamos el id generado del agent
        this.emit("connected", this._agentId);
        //creamos el timer y guardamos la referencia
        //cada vez que se cumple el tiempo en opts.interval emitimos un evento
        //inicializamos el timer solo cuando estamos conectados al servidor mqtt
        //funcion async para poder utilizar el await despues
        this._timer = setInterval(async () => {
          //cada vez que realice una iteracion del timer o setinterval vamos a obtener esos valores de metricas y del agente
          //transmitimos la informacion solo si tenemos metricas
          if (this._metrics.size > 0) {
            //creamos el mensaje a transmitir
            let message = {
              agent: {
                uuid: this._agentId,
                username: opts.username,
                name: opts.name,
                hostname: os.hostname() || "localhost",
                pid: process.pid,
              },
              metrics: [],
              timestamp: new Date().getTime(),
            };

            //iteramos las metricas y funciones dentro de nuestro map _metrics
            //let [ metric, fn ] -> aplicamos destructuring para obtener la metric y fn
            for (let [metric, fn] of this._metrics) {
              //si la funcion tiene 1 argumento, entoces es callback
              if (fn.length === 1) {
                //transformamos la funcion callback a una promise
                fn = util.promisify(fn);
              }

              //una funcion async o una promesa la podemos resolver sin problemas
              message.metrics.push({
                type: metric,
                value: await Promise.resolve(fn()),
              });
            }

            debug("Sending", message);
            //convertimos el mensaje a string y lo publicamos
            this._client.publish("agent/message", JSON.stringify(message));
            this.emit("message", message);
          }
        }, opts.interval);
      });

      //establecemos el evento message, es decir, cuando el cliente reciba un mensaje, el mensaje va a contener:
      //topic-> pudiendo ser agent/message, agent/connected, agent/disconnected
      //payload ->
      this._client.on("message", (topic, payload) => {
        //implementacion de la recepcion del mensaje
        //aplicamos un formato JSON al payload que viene como un string
        payload = parsePayload(payload);

        //re-transmitimos (broadcast) el mensaje dependiendo de:
        let broadcast = false;
        switch (topic) {
          case "agent/connected":
          case "agent/disconnected":
          case "agent/message":
            //hacemos retransmision si el payload es true, si payload contiene agent ysiel uuid del agent es distinto a mi uuid
            broadcast =
              payload && payload.agent && payload.agent.uuid !== this._agentId;
            break;
        }

        //si hacemos broadcast
        if (broadcast) {
          //emitimos el evento que nos llegó, con el payload recibido
          this.emit(topic, payload);
        }
      });

      //en caso de error en el client mqtt nos desconectamos
      this._client.on("error", () => this.disconnect());
    }
  }

  disconnect() {
    if (this._started) {
      clearInterval(this._timer);
      this._started = false;
      this.emit("disconnected", this._agentId);
      //nos desconectamos del cliente
      this._client.end();
    }
  }
}

module.exports = PlatziverseAgent;
