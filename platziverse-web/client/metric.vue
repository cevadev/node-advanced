<template>
  <div class="metric">
    <h3 class="metric-type">{{ type }}</h3>
    <line-chart
      :chart-data="datacollection"
      :options="{ responsive: true }"
      :width="400" :height="200"
    ></line-chart>
    <p v-if="error">{{error}}</p>
  </div>
</template>
<style>
  .metric {
    border: 1px solid white;
    margin: 0 auto;
  }
  .metric-type {
    font-size: 28px;
    font-weight: normal;
    font-family: 'Roboto', sans-serif;
  }
  canvas {
    margin: 0 auto;
  }
</style>
<script>

//request nos permitira realizar la peticion al servidor
//request-promise-native podemos utilizarlo tanto del lado del servidor como del lado del client
const request = require('request-promise-native');
const moment = require('moment');
const randomColor = require('random-material-color');
const LineChart = require('./line-chart')
module.exports = {
  name: 'metric',
  components: {
    LineChart
  },
  //definicion de las props del componente
  props: [ 'uuid', 'type' ],
  data() {
    return {
      //objeto que contienen los datos de la grafica
      datacollection: {},
      error: null,
      color: null
    }
  },
  mounted() {
    this.initialize()
  },
  methods: {
    //cuando inicalizamos el componente metric realizaremos una peticion al servidor para obtener los datos del componente
    //la funcion initialize la volvemos asincrona ya que utilizaremos request-promise-native
    async initialize() {
      //deconstruimos el componente y obtenemos sus variables
      const { uuid, type } =  this;
      //aplicamos un color
      this.color =  randomColor.getColor();
      //creamos nuestra peticion http a la API
      const options = {
        method: 'GET',
        url: `http://localhost:8080/metrics/${uuid}/${type}`,
        json: true
      }
      //procesamos el resultado
      let result
      try {
        //pasamos el requets para obtener las metricas
        result = await request(options)
      } catch (e) {
        //e.error(es el error que retorna request-promise-native).error(es el error que retorna el nuestro API)
        this.error = e.error.error
        //si ocurre un error dejamos de ejecutar el componente con un return
        return
      }

      //definimos label y data para el objeto dataCollection
      const labels = []
      const data = []

      //verificamos que el resultado de la peticion GET es un array
      if (Array.isArray(result)) {
        //recorremos el arreglo
        result.forEach(m => {
          //adicionamos un label y formateamos el contenido
          labels.push(moment(m.createdAt).format('HH:mm:ss'))
          //adicionamos en data el valor de la metrica
          data.push(m.value)
        })
      }

      //pasamos la informacion al objeto datacollection
      this.datacollection = {
        //pasamos los labels como primera propiedad
        labels,
        //un arreglo de datasets, que son la cantidad de lineas que le pasamos a la grafica
        datasets: [{
          backgroundColor: this.color,
          label: type,
          data
        }]
      }
    },
    handleError (err) {
      this.error = err.message
    }
  }
}
</script>