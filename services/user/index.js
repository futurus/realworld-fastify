'use strict'

module.exports = function (fastify, opts, next) {
  fastify.get('/addUser', function (request, reply) {
    const userCollection = this.db.user

    userCollection.insert({ name: 'hihi', age: Math.random() }, function (err, status) {
      if (err) return reply.send(err)
      reply.send(status)
    })
  })

  fastify.get('/users', function (request, reply) {
    const userCollection = this.db.user

    userCollection.find({}, function (err, users) {
      if (err) return reply.send(err)
      reply.send(users)
    })
  })

  next()
}

// It you prefer async/await, use the following
//
// module.exports = async function (fastify, opts) {
//   fastify.get('/example', async function (request, reply) {
//     return 'this is an example'
//   })
// }
