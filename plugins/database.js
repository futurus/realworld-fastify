'use strict'

const fp = require('fastify-plugin')
const fastifyNeDB = require('fastify-nedb')

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

module.exports = fp(function (fastify, opts, next) {
  fastify.register(fastifyNeDB, { dataStores: ['user', 'comment'] })

  next()
})

// It you prefer async/await, use the following
//
// module.exports = fp(async function (fastify, opts) {
//   fastify.decorate('someSupport', function () {
//     return 'hugs'
//   })
// })
