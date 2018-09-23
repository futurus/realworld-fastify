'use strict'

const { UserSchema } = require('./schemas')

// const {
//   login: loginSchema,
//   registration: registrationSchema,
//   search: searchSchema,
//   getProfile: getProfileSchema
// } = require('./schemas')

module.exports = (fastify, opts, next) => {
  const Mongoose = fastify.mongo.db
  const User = Mongoose.model('User', UserSchema)

  fastify.post('/users/login', (request, reply) => {
    const { username, password } = request.body

    console.log(username, password)

    if (!username) {
      return reply.send({ errors: { email: "can't be blank" } })
    }

    if (!password) {
      return reply.send({ errors: { password: "can't be blank" } })
    }

    User.findOne({ username }, function (err, user) {
      if (err) return reply.send(err)

      if (!user) return reply.send({ errors: { username: 'user not existed' } })

      if (user.validPassword(password)) {
        return reply.send(user.toAuthJSON(fastify.jwt))
      }

      return reply.send({ errors: { password: 'wrong password' } })
    })
  })

  fastify.post('/users', (request, reply) => {
    const { username, email, password } = request.body

    const user = new User({ username, email })
    user.setPassword(password)

    user.save(err => {
      if (err) return reply.send(err)

      reply.send(user)
    })
  })

  fastify.get(
    '/users',
    // {
    //   beforeHandler: [fastify.authenticate]
    // },
    (request, reply) => {
      User.find({}, function (err, users) {
        if (err) return reply.send(err)
        reply.send(users)
      })
    }
  )

  next()
}
