const express = require('express')
const app = express()

const { PORT } = require('./util/config')
const { connectToDatabase } = require('./util/db')

const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const clubsRouter = require('./controllers/clubs')
const equipmentsRouter = require('./controllers/equipments')

app.use(express.json())

app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/clubs', clubsRouter)
app.use('/api/equipments', equipmentsRouter)

const start = async () => {
  await connectToDatabase()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()