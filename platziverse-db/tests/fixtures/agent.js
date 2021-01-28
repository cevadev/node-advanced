"use strict";
//creamos el objeto Agent
const agent = {
  id: 1,
  uuid: "yyy-yyy-yyy",
  name: "fixture",
  username: "platzi",
  hostname: "test-host",
  pid: 0,
  connected: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

//creamos un arreglo de agents,para lista todos los agentes conectados
const agents = [
  //el agent que acabamos de crear
  agent,
  extend(agent, {
    id: 2,
    uuid: "yyy-yyy-yyw",
    connected: false,
    username: "test",
  }),
  extend(agent, { id: 3, uuid: "yyy-yyy-yyx" }),
  extend(agent, { id: 4, uuid: "yyy-yyy-yyz", username: "test" }),
];

//funcion que nos permite extender un objeto, clonarlo y aplicarle ciertos valores.
function extend(obj, values) {
  //al objeto vacion le aplicamos todas las propiedades del objeto que queremos clonar
  const clone = Object.assign({}, obj);
  //retornamos el objeto clonado con los valores pasados
  return Object.assign(clone, values);
}

module.exports = {
  //exporta un agent
  single: agent,
  //definimos las funciones
  //exporta todos los agents
  all: agents,
  //exporta solo agents connected
  connected: agents.filter((a) => a.connected),
  //exporta todos los agents del usuario platzi
  platzi: agents.filter((a) => a.username === "platzi"),
  //exporta un agent por uuid. con shift() retornamos solo el primer elemento del array
  byUuid: (id) => agents.filter((a) => a.uuid === id).shift(),
  //exporta un agent por id
  byId: (id) => agents.filter((a) => a.id === id).shift(),
};
