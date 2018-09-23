'use strict'

const fp = require("fastify-plugin")

module.exports = fp(async (fastify, opts) => {
  fastify.register(require("fastify-mongoose"), {
    uri: 'mongodb://localhost:27017/test'
  }, (err) => { if (err) throw err })
})
