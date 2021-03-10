/**
 * Module represents the image router.
 */

import express from 'express'
import createError from 'http-errors'

export const router = express.Router()

router.get('/') // get all img
router.post('/') // add new img

router.get('/images/:id') // get specific img
router.put('/images/:id') // update specific img
router.patch('/images/:id') // partially update specific img
router.delete('/images/:id') // remove specific img

// All other pages
router.use('*', (req, res, next) => next(createError(404)))