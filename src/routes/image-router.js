/**
 * Module represents the image router.
 */

import express from 'express'
import createError from 'http-errors'

import { ImageController } from '../controllers/image-controller.js'

export const router = express.Router()

const controller = new ImageController()

const authorize = (req, res, next) => {
  try {
    
    // kontrollera jwt här!

    next()
  } catch (err) {

  }
} 

router.get('/', authorize, controller.temp) // get all img
router.post('/') // add new img

router.get('/images/:id') // get specific img
router.put('/images/:id') // update specific img
router.patch('/images/:id') // partially update specific img
router.delete('/images/:id') // remove specific img

// All other pages
router.use('*', (req, res, next) => next(createError(404)))