"use strict";

/**
 * Con la funcion pipe logramos que cada uno de los eventos del agente de monitoreo sea redistribuido al socketio
 * sin tener que agregar listener a cada uno de los eventos. Tenemos un pipe entre el agente y el socketio
 * @param {*} source -> emitter fuente
 * @param {*} target -> emitter target
 */
function pipe(source, target) {
  //verificamos si la fuente o el target no tienen el metodo emit
  if (!source.emit || !target.emit) {
    throw TypeError(`Please pass EventEmitter's as argument`);
  }
  //obtenemos un referencia de la funcion emit
  //1. la fuente emit original la copiamos a ._emit dentro de la fuente
  //2. obtenemos la funcion _emit como funcion global dentro del scpe de la funcion pipe que creamos
  const emit = (source._emit = source.emit);

  //a la funte reescribimos la funcion emit
  source.emit = function () {
    //aplicamos los argumentos que se le pasan a la funcion emit a la fuente
    emit.apply(source, arguments);
    //aplicamos los argumento al target
    target.emit.apply(target, arguments);
    return source;
  };
}

module.exports = {
  pipe,
};
