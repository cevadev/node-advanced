/**
 * Archivo para probar nuestro objeto Agent
 */

"use strict";

const test = require("ava");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

const agentFixtures = require("./fixtures/agent.js");

let config = {
  logging() {},
};

/**
 * MetricStub va a representar al modelo
 */
let MetricStub = {
  belongsTo: sinon.spy(), //spy es un funcion especifica que nos permite hacer preguntas a la función
};

/**
 * clonamos el objeto single que proviene de agentFixtures, pasando todas sus propiedad un nuevo objeto {}
 */
let single = Object.assign({}, agentFixtures.single);

let id = 1;
let uuid = "yyy-yyy-yyy";
let AgentStub = null;
let db = null;
let sandbox = null;

let uuidArgs = {
  where: { uuid },
};

let newAgent = {
  uuid: "123-123-123",
  name: "test",
  username: "test",
  hostname: "test",
  pid: 0,
  connected: false,
};

/**
 * Antes de la ejecucion de cada test ejecuta la funcion para configurar la BD.
 */
test.beforeEach(async function () {
  //un sandbox es una ambiente especifico de sinon que solo funciona para este caso particular
  sandbox = sinon.createSandbox();
  //creamos un AgentStub cada vez que ejecutamos una prueba
  AgentStub = {
    hasMany: sandbox.spy(),
  };

  //Model update Stub
  AgentStub.update = sandbox.stub();
  AgentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single));

  //Model findById Stub
  AgentStub.findById = sandbox.stub();
  /**
   * le decimos a sinon-> la funcion findById cuando la llememos con el argumento id debe retornar una promesa
   * que cuando la resuelva debe retornar agent fixtures by id
   */
  AgentStub.findById
    .withArgs(id)
    .returns(Promise.resolve(agentFixtures.byId(id)));

  //Model findOne stub
  AgentStub.findOne = sandbox.stub();
  AgentStub.findOne
    .withArgs(uuidArgs)
    .returns(Promise.resolve(agentFixtures.byId(id)));

  //const setupDatabase = require('../index.js');
  const setupDatabase = proxyquire("../index.js", {
    //sobrescribimos los modelos y retornamos la funcion que al ejecutar devolverá el AgentStub y MetricStub
    "./models/agent": () => AgentStub,
    "./models/metric": () => MetricStub,
  });

  //definimos una variable global de BD. le pasamos un config
  db = await setupDatabase(config);
});

//re-creamos el sandbox cada vez que ejecutamos los tests
test.afterEach(() => {
  //si existe el sandbox, lo re-creamos
  sandbox && sandbox.restore();
});

/**
 * Verificamos que el objeto Agent retornado por la funcion de configuracion de BD exista
 */
test("make it pass", function (t) {
  t.truthy(db.Agent, "Agent service should exists");
});

//testeamos el setup de la BD
test.serial("Setup", (t) => {
  //garantizamos que la funcion del hasMany haya sido ejecutada
  t.true(AgentStub.hasMany.called, "AgentModel.hasMany was executed");
  t.true(
    AgentStub.hasMany.calledWith(MetricStub),
    "Argument should be the MetricModel"
  );
  t.true(MetricStub.belongsTo.called, "MetricModel.belongsTo was executed");
  t.true(
    MetricStub.belongsTo.calledWith(AgentStub),
    "Argument should be the AgentModel"
  );
});

test.serial("Agent#findById", async (t) => {
  //obtenemos un Agent
  let agent = await db.Agent.findById(id);

  t.true(AgentStub.findById.called, "findById should be called on model");
  t.true(AgentStub.findById.calledOnce, "findById should be called once");
  t.true(
    AgentStub.findById.calledWith(id),
    "findById should be called with specified id"
  );
  t.deepEqual(agent, agentFixtures.byId(id), "should be the same");
});

//Pasamos la informacion de un Agent, si no existe el Agent en la BD lo crea, si existe lo actualiza y retorna la instancia
test.serial("Agent#createOrUpdate - exists", async (t) => {
  let agent = await db.Agent.createOrUpdate(single);

  t.true(AgentStub.findOne.called, "findOne should be called on model");

  //t.true(AgentStub.findOne.calledOnce, "findOne should be called once");

  //garantizamos que sea completamente igual el agent que retorna la funcion con el agente que intentamos crear
  t.deepEqual(agent, single, "agent should be the same");
});
