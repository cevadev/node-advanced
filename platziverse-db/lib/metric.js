"use strict";

module.exports = function setupMetric(MetricModel, AgentModel) {
  //funcion para crear una metrica

  //obtenemos las metricas a partir del id del agent
  async function findByAgentUuid(uuid) {
    return MetricModel.findAll({
      attributes: ["type"],
      group: ["type"],
      include: [
        {
          attributes: [],
          model: AgentModel,
          where: {
            uuid,
          },
        },
      ],
      raw: true,
    });
  }

  async function findByTypeAgentUuid(type, uuid) {
    return MetricModel.findAll({
      attributes: ["id", "type", "value", "createdAt"], // Los atributos que se van a regresar en el SELECT -->id, type, value, createdAt<-- FROM table
      where: {
        // SELECT xxxx FROM yyyy WHERE -->type = type<--
        type,
      },
      limit: 20,
      order: [["createdAt", "DESC"]],
      include: [
        {
          // Join
          attributes: [],
          model: AgentModel,
          where: {
            uuid,
          },
        },
      ],
      raw: true, // return in JSON
    });
  }

  async function create(uuid, metric) {
    //buscamos si el agente existe en ela BD
    const agent = await AgentModel.findOne({
      where: {
        //recuperamos el agente donde el uuid del agente es igual a uuid que pasamos
        uuid,
      },
    });

    //si existe el agente
    if (agent) {
      //asignamos al objeto de metric el id del agent
      metric.agentId = agent.id;
      //Object.assign(metric, {agentId: agent.id})

      //almacenamos la metric en la BD
      const result = await MetricModel.create(metric);
      return result.toJSON();
    }
  }

  //retornamos el objeto create
  return {
    create,
    findByAgentUuid,
    findByTypeAgentUuid,
  };
};
