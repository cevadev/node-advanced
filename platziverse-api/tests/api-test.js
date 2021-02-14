"use strict";

const test = require("ava");
//supertest nos permite realizar peticiones http con assertions
const request = require("supertest");

//importamos el modulo util de nodejs
const util = require("util");

//importamos el server
//const server = require("../server.js");

const sinon = require("sinon");
const proxyquire = require("proxyquire");

//fixtures
const agentFixtures = require("./fixtures/agent.js");

//importamos modulo para crear tokens
const auth = require("../auth.js");
const configDB = require("platziverseutils/configDB");

//funcion sign para crear el jwt
const sign = util.promisify(auth.sign);

//cada vez que ejecutamos una prueba creamos un sandbox de sinon
let sandbox = null;
//server donde realizaremos el stub
let server = null;
//stub del objeto de base de datos
let dbStub = null;
let token = null;
let AgentStub = {};
let MetricStub = {};

//Implementacion de sinon
//Hook beforeEach -> definimos un hook que se ejecutara antes de cada uno de los test
test.beforeEach(async () => {
  //1. creacion del sandbox
  sandbox = sinon.createSandbox();

  //2. definimos los stubs de Base de datos
  dbStub = sandbox.stub();
  //cuando llamamos a la funcion, va a retornar una promesa que resuelva para el Agent retorna el AgentStub
  //para las Metric retorna el MetricStub
  dbStub.returns(
    Promise.resolve({
      Agent: AgentStub,
      Metric: MetricStub,
    })
  );

  //3. definimos las funciones a las que llamaremos en el stub
  AgentStub.findConnected = sandbox.stub();
  //cada vez que llamamos a findConnected() retornamos una promera que al ser resuelta retorna los agents connected
  AgentStub.findConnected.returns(Promise.resolve(agentFixtures.connected));

  //4. creamos el token
  token = await sign({ admin: true, username: "platzi" }, configDB.auth.secret);

  //5. Obtenemos el modulos api, para sobrescribir el stub de la BD
  //decimos: en el modulo API cada vez que realicen un require de platziverse-db se debe retornar el dbStub que se acaba de crear
  const api = proxyquire("../api", {
    "platziverse-db": dbStub,
  });

  //6. Creamos una instancia del servidor con proxyquire, cada vez que se requiera el /api del server retornamos el api creado
  //en el paso 4, que es el que tiene el dbStub

  server = proxyquire("../server", {
    "./api": api,
  });

  //Con estos anidamos los dos llamados: En el archivo server.js cuando se haga require del archivo api.js se debe retornar
  //el objeto sobreescrito en el paso 4.

  //Cuando el modulo api.js hace require de platziverse-db lo que se debe retornar es el dbStub creado
});

test.afterEach(() => {
  //si existe el sandbox lo restauramos
  sandbox && sinon.restore();
});

//1. test: hacemos test a una funcion callback (cb), para trabajar con funciones async - await solo usamos test.serial
//supertest trabaja con callbacks, asi que vamos a definir en ava el .cb asi podemos indicar la finalizacion del test
test.serial.cb("/api/agents", (t) => {
  //definimos la prueba. Pasamos una instancia del serverque vamos a probar
  request(server)
    //indicamos la ruta a la que hacemos ges
    .get("/api/agents")
    //seteamos el header para utilizar el token
    .set("Authorization", `Bearer ${token}`)
    //esperamos una respuesta sttus code 200
    .expect(200)
    //el contenido de la respuesta sea de tipo json
    .expect("Content-Type", /json/)
    //cuando termina la peticion tenemos el error y la respuesta
    .end((err, res) => {
      t.falsy(err, "should not return an error");
      let body = JSON.stringify(res.body);
      //obtenemos los agents connected cuando se hace una peticion get a /api/agents
      let expected = JSON.stringify(agentFixtures.connected);
      t.deepEqual(body, expected, "response body should be the expected");
      t.end();
    });
});

test.serial.todo("/api/agents - not authorized");
test.serial.todo("/api/agent/:uuid");
test.serial.todo("/api/agent/:uuid - not found");

test.serial.todo("/api/metrics/:uuid");
test.serial.todo("/api/metrics/:uuid - not found");

test.serial.todo("/api/metrics/:uuid/:type");
test.serial.todo("/api/metrics/:uuid/:type - not found");
