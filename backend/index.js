const express = require('express')
const app = express()

const { PORT } = require('./util/config')
const { connectToDatabase } = require('./util/db')
const { usersRouter, loginRouter, clubsRouter, equipmentsRouter, membershipsRouter, paddlesRouter } = require('./controllers')

app.use(express.json())

app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/clubs', clubsRouter)
app.use('/api/equipments', equipmentsRouter)
app.use('/api/memberships', membershipsRouter)
app.use('/api/paddles', paddlesRouter)

console.log('What the date looks like:', new Date())

const start = async () => {
  await connectToDatabase()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()