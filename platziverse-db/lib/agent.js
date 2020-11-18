"use strict";

/**
 *
 * @param {*} AgentModel recibe el modelo de Agent
 */
module.exports = function setupAgent(AgentModel) {
  async function createOrUpdate(agent) {
    //utilizamos el campo uuid de agent para hacer la consulta, definimos un objeto que contendrá la definicion de la consulta
    const cond = {
      where: {
        uuid: agent.uuid,
      },
    };

    //obetenemos la primera ocurrencia de un agente con uuid indicado
    const existingAgent = await AgentModel.findOne(cond);
    //si existe el agente
    if (existingAgent) {
      //actualizamos el agente pasando el agente a acutualizar y la condicion
      const updated = await AgentModel.update(agent, cond);
      //si lo actualizo (retorna el # de filas afectadas) retornamos la instancia del agent sino retorna agente existente
      return updated ? AgentModel.findOne(cond) : existingAgent;
    }

    //si no existe el agente, entonces lo creamos
    const result = await AgentModel.create(agent);
    //retornamos la info del agent en json
    return result.toJSON();
  }

  function findById(id) {
    return AgentModel.findById(id);
  }

  /* function findByUuid(uuid) {
    return AgentModel.findOne({
      where: {
        uuid,
      },
    });
  }

  function findAll() {
    return AgentModel.findAll();
  }

  function findConnected() {
    return AgentModel.findAll({
      where: {
        connected: true,
      },
    });
  }

  function findByUsername(username) {
    return AgentModel.findAll({
      where: {
        username,
        connected: true,
      },
    });
  } */

  return {
    createOrUpdate,
    findById,
    //findByUuid,
    //findAll,
    //findConnected,
    //findByUsername,
  };
};
