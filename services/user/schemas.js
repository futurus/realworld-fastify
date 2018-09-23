'use strict'

const mongoose = require('mongoose')
const crypto = require('crypto')

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9]+$/, 'is invalid'],
      index: true
    },
    email: {
      type: String,
      unique: true,
      required: [true, "can't be blank"],
      match: [/\S+@\S+\.\S+/, 'is invalid'],
      index: true
    },
    bio: String,
    image: String,
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    salt: String,
    hash: String
  },
  { timestamps: true }
)

UserSchema.methods.validPassword = function (password) {
  var hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
    .toString('hex')
  return this.hash === hash
}

UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex')
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
    .toString('hex')
}

UserSchema.methods.generateJWT = function (jwt) {
  var today = new Date()
  var exp = new Date(today)
  exp.setDate(today.getDate() + 60)

  return jwt.sign({
    id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000)
  })
}

UserSchema.methods.toAuthJSON = function (jwt) {
  return {
    username: this.username,
    email: this.email,
    token: this.generateJWT(jwt),
    bio: this.bio,
    image: this.image
  }
}

UserSchema.methods.toProfileJSONFor = function (user) {
  return {
    username: this.username,
    bio: this.bio,
    image: this.image ||
      'https://static.productionready.io/images/smiley-cyrus.jpg',
    following: user ? user.isFollowing(this._id) : false
  }
}

UserSchema.methods.favorite = function (id) {
  if (this.favorites.indexOf(id) === -1) {
    this.favorites.push(id)
  }

  return this.save()
}

UserSchema.methods.unfavorite = function (id) {
  this.favorites.remove(id)
  return this.save()
}

UserSchema.methods.isFavorite = function (id) {
  return this.favorites.some(favoriteId => {
    return favoriteId.toString() === id.toString()
  })
}

UserSchema.methods.follow = function (id) {
  if (this.following.indexOf(id) === -1) {
    this.following.push(id)
  }

  return this.save()
}

UserSchema.methods.unfollow = function (id) {
  this.following.remove(id)
  return this.save()
}

UserSchema.methods.isFollowing = function (id) {
  return this.following.some(followId => {
    return followId.toString() === id.toString()
  })
}

const registration = {
  schema: {
    schema: {
      description: 'post some data',
      tags: ['user', 'code'],
      summary: 'qwerty',
      body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: {
            type: 'string'
          },
          password: {
            type: 'string'
          }
        },
        additionalProperties: false
      },
      response: {
        200: {
          type: 'object',
          required: [],
          properties: {},
          additionalProperties: false
        }
      }
    }
  }
}

const login = {
  schema: {
    body: {
      type: 'object',
      require: ['username', 'password'],
      properties: {
        username: { type: 'string' },
        password: { type: 'string' }
      },
      additionalProperties: false
    },
    response: {
      200: {
        type: 'object',
        require: ['jwt'],
        properties: {
          jwt: { type: 'string' }
        },
        additionalProperties: false
      }
    }
  }
}

const search = {
  schema: {
    querystring: {
      type: 'object',
      require: ['search'],
      properties: {
        search: { type: 'string' }
      },
      additionalProperties: false
    },
    response: {
      200: {
        type: 'array',
        items: {
          type: 'object',
          require: ['_id', 'username'],
          properties: {
            _id: { type: 'string' },
            username: { type: 'string' }
          },
          additionalProperties: false
        }
      }
    }
  }
}

const getProfile = {
  schema: {
    params: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: {
          type: 'string',
          pattern: '^[0-9a-fA-F]{24}'
        }
      }
    }
  }
}

module.exports = {
  registration,
  login,
  search,
  getProfile,
  UserSchema
}
