/**
 * Recibimos un flujo de datos y lo convertimos en un objeto JS
 */

function parsePayload(payload) {
  if (payload instanceof Buffer) {
    //convertimos el payload a string
    payload = payload.toString("utf8");

    //si tenemos un error, retornamos un objeto vacio
    try {
      //JSON.parse() -> convertirmos un strng a un objeto JSON de JS
      payload = JSON.parse(payload);
    } catch (error) {
      payload = null;
    }

    return payload;
  }
}

//retornamos la informacion como al queremos
module.exports = {
  parsePayload,
};
