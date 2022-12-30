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

// Validates that the input string is a valid date formatted as "yyyy-mm-dd"
function isValidDate(dateString)
{
    // First check for the pattern
    if(!/^\d{4}-\d{2}-\d{2}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    const parts = dateString.split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    const monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
};

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
  user.save((err, createdUser) => {
    if (err) {
      res.json({error: err.message })
    } else {
      res.json({ username: createdUser.username, _id: createdUser.id })
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

// handle creation of new exercise of a certain user
app.post('/api/users/:_id/exercises', (req, res) => {
  const _id = req.params._id // get _id from request params
  const description = req.body.description.trim() // get username and trim space from start and end from request body
  const duration = req.body.duration // get duration from request body
  const dateString = req.body.date.trim() // get date string and trim space from start and end from request body
  const exerciseObject = { description: description, duration: duration } // create a temporary object to contain required attributes
  if (isValidDate(dateString)) {
    exerciseObject.date = new Date(dateString) // add the date field to the temporary object
  }
  const exercise = new Exercise(exerciseObject) // use the temporary object to create an exercise
  exercise.save((err, createdExercise) => { // save to database
    if (err) {
      res.json({error: err.message })
    } else {
      User.findById(_id, (err, user) => { // get the user to get the id and username to be embedded in response
        if (err) {
          res.json({error: err.message })
        } else {
          user.log.push(createdExercise) // add the newly created exercise to array of exercises
          user.save((err, updatedUser) => {
            if (err) {
              res.json({error: err.message })
            } else {
                res.json({ // return the necessary attributes
                  username: updatedUser.username,
                  description: createdExercise.description,
                  duration: createdExercise.duration,
                  date: createdExercise.date.toDateString(),
                  _id: updatedUser.id
                })
            }
          })
        }
      })
    }
  })
}) 

// get list of exercises of certain user along with the total number of exercises
app.get('/api/users/:_id/logs', (req, res) => {
  const _id = req.params._id // get id from request param
  User.findById(_id, (err, user) => { // get user from the id supplied
    if (err) {
      res.json({error: err.message })
    } else {
      const userObjectWithCount = user.toObject({ virtuals: true }) 
      const formattedExercises = userObjectWithCount.log.map((exercise) => { 
        return {
          description: exercise.description,
          duration: exercise.duration,
          date: exercise.date
        } 
      })
      res.json({
        username: userObjectWithCount.username,
        count: userObjectWithCount.count,
        _id: userObjectWithCount.id,
        log: formattedExercises
      })
    }
  })
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
