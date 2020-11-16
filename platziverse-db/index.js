'use strict'

//exportamos una funcion async y que al ser llamada retornará unna promesa que al ser resuelva retorna los objetos Metric y Agent
module.exports = async function(config){
    const Agent = {};
    const Metric = {};

    //cuando se llame a nuestra funcion, retornamos los objetos
    return {
        //al ser iguales variable y propiedad podriamos simplemente escribir Agent, Metric y seria igual
        Agent = Agent,
        Metric = Metric,
    }
}