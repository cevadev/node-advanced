const debug = require("debug")("platziverse:db:setup");

// Objeto de configuración de la Base de Datos
//parametro init -> true por defecto cuando se ejecuta npm run setup se elimina y vuelve a crear la BD
module.exports = function (init = true) {
  return {
    database: process.env.DB_NAME || "platziverse" /* Nombre de la DB  */,
    username: process.env.DB_USER || "platzi" /* Usuario          */,
    password: process.env.DB_PASS || "platzi" /* Contraseña       */,
    local: process.env.DB_HOST || "localhost" /* Dirección IP     */,
    dialect: "postgres" /* Nombre del gestor de DBs a usar en el proyecto */,
    logging: (s) => debug(s),
    setup: init /* Restauración de la Database */,
  };
};
