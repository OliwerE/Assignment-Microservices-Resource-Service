/**
 * Mongoose configuration module.
 *
 * @author Oliwer Ellréus <oe222ez@student.lnu.se>
 * @version 1.0.0
 */

import mongoose from 'mongoose'

import session from 'express-session'
import MongoStore from 'connect-mongo'

/**
 * Represents the mongoose configuration used for the connection to mongoDB.
 *
 * @param {Function} application - The express application.
 */
export const connectDB = async (application) => {
  mongoose.connection.on('connected', () => {
    console.log('Mongoose is connected.')
  })
  mongoose.connection.on('error', (error) => {
    console.log(`A mongoose connection error has occured: ${error}`)
  })
  mongoose.connection.on('disconnected', () => {
    console.log('Mongoose is disconnected.')
  })

  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log('Mongoose is disconnected because of application termination.')
      process.exit(0)
    })
  })

  await mongoose.connect(process.env.DB_CONNECTION_STRING, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })

  const MongoDBSessionStore = MongoStore(session) // Used for session storage in mongoDB

  const sessionOptions = {
    name: process.env.SESSION_NAME,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoDBSessionStore({ mongooseConnection: mongoose.connection, clear_interval: 3600 })
  }

  if (application.get('env') === 'production') { // trusts first proxy and requires secure cookies if in production
    application.set('trust proxy', 1)
  }

  application.use(session(sessionOptions))
}
