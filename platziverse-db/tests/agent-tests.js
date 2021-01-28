/**
 * Archivo para probar nuestro objeto Agent
 */

"use strict";

const test = require("ava");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//importamos nuestro mock de agents
const agentFixtures = require("./fixtures/agent.js");

let config = {
  logging() {},
};

/**
 * MetricStub va a representar al modelo Metric
 */
let MetricStub = {
  //definimos belongTo porque en el modulo de BD (index.js) llamamos en el modelo de metricas a la funcion belongs to
  belongsTo: sinon.spy(), //spy es un funcion especifica que nos permite hacer preguntas a la función como
  //cuantes veces fue llamada, con qe argumentos fue llamada etc
};

/**
 * clonamos el objeto single que proviene de agentFixtures, pasando todas sus propiedad un nuevo objeto llamado single
 * asi tenemos una nueva instancia del agent (single)
 */
let single = Object.assign({}, agentFixtures.single);

let id = 1;
let uuid = "yyy-yyy-yyy";
let AgentStub = null;
let db = null;

//sandbox es un ambiente especifico de sinon que solo funciona para un caso particular y cuando se vuelve a ejecutar
//una prueba se reinicia el sandbox para que inicie desde el principio asi garantizamos que si una funcion fue llamada
//una vez cuando terminamos de correr el test reseteamos el estado de los stubs y si corremos un test diferente
//vuelve a aparecer desde cero
let sandbox = null;

let connectedArgs = {
  where: { connected: true },
};

let usernameArgs = {
  where: { username: "platzi", connected: true },
};

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
  //un sandbox es una ambiente especifico de sinon que solo funciona para este caso particular, es decir, no hace conexion real
  //a una BD en nuestro caso postgresql
  sandbox = sinon.createSandbox();
  //creamos un AgentStub cada vez que ejecutamos una prueba
  AgentStub = {
    hasMany: sandbox.spy(),
  };

  //Model create Stub
  AgentStub.create = sandbox.stub();
  AgentStub.create.withArgs(newAgent).returns(
    Promise.resolve({
      toJSON() {
        return newAgent;
      },
    })
  );

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

  // Model findAll Stub
  AgentStub.findAll = sandbox.stub();
  AgentStub.findAll.withArgs().returns(Promise.resolve(agentFixtures.all));
  AgentStub.findAll
    .withArgs(connectedArgs)
    .returns(Promise.resolve(agentFixtures.connected));
  AgentStub.findAll
    .withArgs(usernameArgs)
    .returns(Promise.resolve(agentFixtures.platzi));

  //cuando necesitemos el objeto index.js lo sobreescribimos con el objeto que acabamos de definir
  const setupDatabase = proxyquire("../index.js", {
    //sobrescribimos los modelos agent y metric y retornamos la funcion que al ejecutar devolverá el AgentStub y MetricStub
    //en el modulo de BD en lugar de pasarnos los modelos agent.js y metric.js nos retorna los stubs Agent y Metric stub
    "./models/agent": () => AgentStub,
    "./models/metric": () => MetricStub,
  });

  //definimos una variable global de BD. le pasamos un config
  db = await setupDatabase(config);
});

//re-creamos el sandbox cada vez que ejecutamos los tests
test.afterEach(() => {
  //si existe el sandbox, lo re-creamos para volve al estado inicial
  sandbox && sandbox.restore();
});

/**
 * Verificamos que el objeto Agent retornado por la funcion de configuracion de BD exista
 */
test("make it pass", function (t) {
  //truthy significa que existe un valor, ese valor resuelve a verdadero, no necesariamente un valor true.
  t.truthy(db.Agent, "Agent service should exists");
});

//testeamos el setup de la BD
test.serial("Setup", (t) => {
  //garantizamos que la funcion del hasMany haya sido ejecutada
  //la propiedad ejecuta o called la retornará el spy
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

test.serial("Agent#findByUuid", async (t) => {
  let agent = await db.Agent.findByUuid(uuid);

  t.true(AgentStub.findOne.called, "findOne should be called on model");
  t.true(AgentStub.findOne.calledOnce, "findOne should be called once");
  t.true(
    AgentStub.findOne.calledWith(uuidArgs),
    "findOne should be called with uuid args"
  );

  t.deepEqual(agent, agentFixtures.byUuid(uuid), "agent should be the same");
});

test.serial("Agent#findConnected", async (t) => {
  let agents = await db.Agent.findConnected();

  t.true(AgentStub.findAll.called, "findAll should be called on model");
  t.true(AgentStub.findAll.calledOnce, "findAll should be called once");
  t.true(
    AgentStub.findAll.calledWith(connectedArgs),
    "findAll should be called with connected args"
  );

  t.is(
    agents.length,
    agentFixtures.connected.length,
    "agents should be the same amount"
  );
  t.deepEqual(agents, agentFixtures.connected, "agents should be the same");
});

test.serial("Agent#findByUsername", async (t) => {
  let agents = await db.Agent.findByUsername("platzi");

  t.true(AgentStub.findAll.called, "findAll should be called on model");
  t.true(AgentStub.findAll.calledOnce, "findAll should be called once");
  t.true(
    AgentStub.findAll.calledWith(usernameArgs),
    "findAll should be called with username args"
  );

  t.is(
    agents.length,
    agentFixtures.platzi.length,
    "agents should be the same amount"
  );
  t.deepEqual(agents, agentFixtures.platzi, "agents should be the same");
});

//Pasamos la informacion de un Agent, si no existe el Agent en la BD lo crea, si existe lo actualiza y retorna la instancia
test.serial("Agent#createOrUpdate - exists", async (t) => {
  let agent = await db.Agent.createOrUpdate(single);

  t.true(AgentStub.findOne.called, "findOne should be called on model");

  //t.true(AgentStub.findOne.calledOnce, "findOne should be called once");

  //garantizamos que sea completamente igual el agent que retorna la funcion con el agente que intentamos crear
  t.deepEqual(agent, single, "agent should be the same");
});

test.serial("Agent#createOrUpdate - new", async (t) => {
  let agent = await db.Agent.createOrUpdate(newAgent);

  t.true(AgentStub.findOne.called, "findOne should be called on model");
  t.true(AgentStub.findOne.calledOnce, "findOne should be called once");
  t.true(
    AgentStub.findOne.calledWith({
      where: { uuid: newAgent.uuid },
    }),
    "findOne should be called with uuid args"
  );
  t.true(AgentStub.create.called, "create should be called on model");
  t.true(AgentStub.create.calledOnce, "create should be called once");
  t.true(
    AgentStub.create.calledWith(newAgent),
    "create should be called with specified args"
  );

  t.deepEqual(agent, newAgent, "agent should be the same");
});
