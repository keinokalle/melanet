const express = require('express')
const app = express()

const { PORT } = require('./util/config')
const { connectToDatabase } = require('./util/db')
const { usersRouter, loginRouter, clubsRouter, equipmentsRouter, membershipsRouter, paddlesRouter, reservationsRouter } = require('./controllers')
const { unknownEndpoint, errorHandler } = require('./util/middlevare')
const { info: logInfo } = require('./util/logger')

app.use(express.json())

app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/clubs', clubsRouter)
app.use('/api/equipments', equipmentsRouter)
app.use('/api/memberships', membershipsRouter)
app.use('/api/paddles', paddlesRouter)
app.use('/api/reservations', reservationsRouter)

app.use(unknownEndpoint)
app.use(errorHandler)

const start = async () => {
  await connectToDatabase()
  app.listen(PORT, () => {
    logInfo(`Server running on port ${PORT}`)
  })
}

// Only start the server if this file is run directly
if (require.main === module) {
  start()
}

module.exports = app