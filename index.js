const express = require('express') // load express module
const nedb = require('nedb-promises') // load nedb module

const app = express() // init app
const db = nedb.create('users.jsonl') // init db

const bcrypt = require('bcrypt') // load bcrypt module

const crypto = require('crypto') // load crypto module

app.use(express.static('public')) // enable static routing to "./public" folder

// automatically decode all requests from JSON and encode all responses into JSON
app.use(express.json())

app.get('/users', (req, res) => {
  db.find({})
    .then((records) => res.send(records.map((record) => ({ _id: record._id }))))
    .catch((error) => res.send({ error }))
})

// login
app.post('/users/auth', (req, res) => {
  const { username, password } = req.body

  db.findOne({ _id: username })
    .then((user) => {
      if (user) {
        const passwordIsValid = bcrypt.compareSync(password, user.password)
        if (passwordIsValid) {
          const authToken = crypto.randomBytes(30).toString('hex')
          user.authToken = authToken
          db.updateOne({ _id: username }, user).then(() => {
            const { password, ...userWithoutPassword } = user
            res.send(userWithoutPassword)
          })
        } else {
          res.send({ error: 'Invalid password.' })
        }
      } else {
        res.send({ error: 'Username not found.' })
      }
    })
    .catch((error) => res.send({ error }))
})

// register
app.post('/users', (req, res) => {
  if (
    req.body.username &&
    req.body.password &&
    req.body.email &&
    req.body.name
  ) {
    db.findOne({ _id: req.body.username })
      .then((record) => {
        if (record) {
          res.send({ error: 'Username already exists.' })
        } else {
          // req.body._id = req.body.username
          // delete req.body.username

          const authToken = crypto.randomBytes(30).toString('hex')

          const registerData = {
            _id: req.body.username,
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync()),
            authToken
          }

          db.insertOne(registerData)
            .then((record) =>
              res.send({
                _id: record._id,
                name: record.name,
                email: record.email
              })
            )
            .catch((error) => res.send({ error }))
        }
      })
      .catch((error) => res.send({ error }))
  } else {
    res.send({ error: 'Missing fields.' })
  }
})

app.patch('/users/:username/:authToken', (req, res) => {
  const { username, authToken } = req.params

  db.findOne({ _id: username })
    .then((user) => {
      if (user && user.authToken === authToken) {
        db.updateOne({ _id: username }, { $set: req.body })
          .then((numReplaced) => {
            if (numReplaced === 0) {
              res.send({ error: 'Something went wrong.' })
            } else {
              res.send({ ok: true })
            }
          })
          .catch((error) => res.send({ error }))
      } else {
        res.send({ error: 'Invalid authentication token.' })
      }
    })
    .catch((error) => res.send({ error }))
})

app.delete('/users/:username/:authToken', (req, res) => {
  const { username, authToken } = req.params

  db.findOne({ _id: username })
    .then((user) => {
      if (user && user.authToken === authToken) {
        db.deleteOne({ _id: username })
          .then((numReplaced) => {
            if (numReplaced === 0) {
              res.send({ error: 'Something went wrong.' })
            } else {
              res.send({ ok: true })
            }
          })
          .catch((error) => res.send({ error }))
      } else {
        res.send({ error: 'Invalid authentication token.' })
      }
    })
    .catch((error) => res.send({ error }))
})

// start server
app.listen(3000, () => console.log('Server started on http://localhost:3000'))