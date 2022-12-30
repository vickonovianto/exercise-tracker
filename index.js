const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const { Schema } = mongoose
require('dotenv').config()

main().catch(err => console.log(err))

async function main() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true})
}

const exerciseSchema = new Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now }
})

const userSchema = new Schema({
  username: { type: String, required: true },
  log: [exerciseSchema],
}, {
  virtuals: {
    count: {
      get() {
        return this.log ? this.log.length : 0
      }
    }
  }
})

const Exercise = mongoose.model("Exercise", exerciseSchema)
const User = mongoose.model("User", userSchema)

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// handle creation of new user
app.post('/api/users', (req, res) => {
  const username = req.body.username.trim() // get username and trim space from start and end from request body
  const user = new User({ username: username })
  user.save((err, savedUser) => {
    if (err) {
      res.json({error: err.message })
    } else {
      res.json({ username: savedUser.username, _id: savedUser.id })
    }
  })
}) 

// return array of user object
app.get('/api/users', (req, res) => {
  User.find().exec((err, users) => { // fetch all users
    if (err) {
      res.json(err.message)
    } else {
      // for every object that is fetched, change with a new object that only includes necessary attributes to be returned
      const formattedUsers = users.map( user => { return { username: user.username, _id: user.id } })
      res.json(formattedUsers)
    }
  })
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
