# platziverse-db

## Usage

```js
/*Platziverse-db exporta una funcion que permite configurar la bd retorna una promesa*/
const setupDatabase = require("platziverse-db");
/*le pasamos un archivo de configuracion*/
setupDabase(config)
  /*retornamos un objeto de db*/
  .then((db) => {
    /*extraemos dos objetos o propiedades  de la db Agent y Metric
     const agent = db.Agent
     cont metric = db.Metric*/
    const { Agent, Metric } = db;
  })
  //escuchamos algun tipo de error
  .catch((err) => console.error(err));
```
