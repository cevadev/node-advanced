"use strict";

const test = require("ava");
//supertest nos permite realizar peticiones http con assertions
const request = require("supertest");
//importamos el server
const server = require("../server.js");

//1. test: hacemos test a una funcion callback (cb), para trabajar con funciones async - await solo usamos test.serial
//supertest trabaja con callbacks, asi que vamos a definir en ava el .cb asi podemos indicar la finalizacion del test
test.serial.cb("/api/agents", (t) => {
  //definimos la prueba. Pasamos una instancia del serverque vamos a probar
  request(server)
    //indicamos la ruta a la que hacemos ges
    .get("/api/agents")
    //esperamos una respuesta sttus code 200
    .expect(200)
    //el contenido de la respuesta sea de tipo json
    .expect("Content-Type", /json/)
    //cuando termina la peticion tenemos el error y la respuesta
    .end((err, res) => {
      t.falsy(err, "should not return an error");
      let body = res.body;
      t.deepEqual(body, {}, "response body should be the expected");
      t.end();
    });
});
