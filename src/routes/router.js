/**
 * Module represents the main router.
 */

import express from 'express'
import createError from 'http-errors'
import { router as imageRouter } from './image-router.js'

export const router = express.Router()

router.get('/', (req, res, next) => { res.json({ message: 'Welcome to resource service!' }) })

router.use('/images', imageRouter)

// All other pages
router.use('*', (req, res, next) => next(createError(404)))
