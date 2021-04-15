require('dotenv').config()
const { response } = require('express')
const cors = require('cors')
const express = require('express')
const app = express()
const Person = require('./models/person')
const morgan = require('morgan')

app.use(express.json())
app.use(cors())
app.use(express.static('build'))
app.use(morgan(':method :url :status :response-time ms :res[content]'))
morgan('tiny')

const persons = [
  {
  name: "Anna",
  number: "5928520",
  id: "60700a0193849c233cead170"
  },
  {
  name: "Vili-Pekka",
  number: "58982402892",
  id: "60704c40205d340015b9e672"
  },
  {
  name: "Sateri",
  number: "548",
  id: "60707cf12ad53c6c44d81760"
  },
  {
  name: "Santeri",
  number: "54834232",
  id: "607087ce698a7e57cc5090f2"
  },
  {
  name: "Juha Uusitalo",
  number: "890258548",
  id: "60708afdfcbbd900157c96b5"
  }
]

const errorHandler = (error, req, res, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

app.get('/info', (req, res) => {
  res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`)
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(people => {
    res.json(people)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => {
      next(error)
    })
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body
  console.log(body)

  if (body.name === undefined) {
    return res.status(400).json({
      error: 'name missing'
    })
  }

  if (body.number === undefined) {
    return res.status(400).json({
      error: 'number missing'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      res.json(savedPerson.toJSON())
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})