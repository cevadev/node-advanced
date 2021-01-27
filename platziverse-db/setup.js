"use strict";
//modulo que nos permite escribir log en consola
const debug = require("debug")("platziverse:db:setup");

//nos permite establecer algunas preguntas al usuario
const inquirer = require("inquirer");
//nos permite darle formato de color y otros estilos a nuestras preguntas al usuario
const chalk = require("chalk");

//importamos la funcion de BD creada
const db = require("./index.js");

//objeto de configuracion para sequelize
const properties = require("./config.js");

//Script de inicializacion de base de datos

/**
 * creamos un objeto prompt que nos permitirá hacer preguntas.las preguntas son promesas, cual el usuario termine de responder
 * esa promesa se va a resolver y asi obtenemos el valor.
 */
const prompt = inquirer.createPromptModule();

async function setup() {
  //recibimos la respuesta del usuario y esperamos a que la promesa se resuelva. Pasamos las preguntas como un arreglo
  const answer = await prompt([
    {
      type: "confirm",
      name: "setup", //la respuesta se guarda en una propiedad llamada setup
      message:
        "This will destroy your current data base. Are you sure to do that?",
    },
  ]);

  //si la respuesta es false, si es true continua con la ejecucion del codigo y se elimina y vuelve a crear la BD
  if (!answer.setup) {
    return console.info("Nothing will happen");
  }

  //definimos el objeto de configuracion que necesita sequelize
  const config = {
    //nombre de BD
    database: properties.databaseName,
    username: properties.username,
    password: properties.password,
    host: properties.host,
    port: properties.port,
    /**Siquelize puede conectarse a multiples tipos de BD deacuerdo al tipo de BD se ebe especificar el dialecto */
    dialect: properties.dialect,
    //cada mensaje que llega del login lo debe ejecutar como una function
    logging: function (message) {
      debug(message);
    },
    //setup: true -> indicamos a sequelize que sincronize la BD
    setup: true,
    operatorAliases: false,
  };

  await db(config).catch((error) => {
    console.error(`${chalk.red("[fatal error]")} ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  });
  console.info("Success..."), process.exit(0);
}

setup();
