/**
 * Module represents the main router.
 */

import express from 'express'
import createError from 'http-errors'

export const router = express.Router()

router.get('/', (req, res, next) => { res.json({ message: 'Welcome to resource service!' }) })

// All other pages
router.use('*', (req, res, next) => next(createError(404)))
