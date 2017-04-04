const express = require('express')
const Correios = require('node-correios')
const database = require('./database')

const app = express()
const correios = new Correios()
const config = process.env.CONFIG_STRING || 'localhost-config'

database.init(function (err, Order, Stat) {
  if (err) throw err

  app.get('/order', function (req, res) {
    const cep = req.query.cep
    const productId = req.query.productId
    const latencies = {}

    if (!cep || !productId) return res.status(400).send()

    var startTime = new Date()
    correios.calcPreco({
      nCdServico  : '41106',
      sCepOrigem  : '01311300',
      sCepDestino : cep,
      nVlPeso     : '1',
      nCdFormato  : 1,
      nVlComprimento : 20,
      nVlAltura: 20,
      nVlLargura : 30
    }, function (err, results) {
      latencies.correios = new Date() - startTime
      
      if (err) return res.status(500).send()

      // crashable code left here intentionally
      const price = results[0].ValorSemAdicionais

      startTime = new Date()
      new Order({
        product_id  : productId,
        price       : price,
        created_at  : new Date(),
        cep         : cep
      }).save(function (err) {
        if (err) return res.status(500).send()
        latencies.database = new Date() - startTime

        res.status(200).send()
        console.log(latencies)

        new Stat({
          config     : config,
          created_at : new Date(),
          extra_info : latencies
        }).save()
      })

    })

  })

  app.listen(3000, function () {
    console.log('server listening...')
  })



})
