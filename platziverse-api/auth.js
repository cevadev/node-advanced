"use strict";

const jwt = require("jsonwebtoken");

/**
 *
 * @param {*} payload -> data que vamos a codificar dentro del json web token. Eejmplo {username: 'barcvilla'}
 * @param {*} secret -> llave secreta con la que vamos a firmar el jwt. Ejemplo llave secreta: platzi
 * @param {*} callback -> funcion asincrona. Ejemplo: console.info
 */
function sign(payload, secret, callback) {
  jwt.sign(payload, secret, callback);
}

/**
 *
 * @param {*} token -> verificamos el token
 * @param {*} secret -> pasamos la llave secreta
 * @param {*} callback -< funcion callback
 */
function verify(token, secret, callback) {
  jwt.verify(token, secret, callback);
}

module.exports = {
  sign,
  verify,
};
