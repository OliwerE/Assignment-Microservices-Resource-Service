/**
 * Module represents the image router.
 */

import express from 'express'
import createError from 'http-errors'

import { readFileSync } from 'fs'
import jwt from 'jsonwebtoken'

import { ImageController } from '../controllers/image-controller.js'

export const router = express.Router()

const controller = new ImageController()

const authorize = (req, res, next) => {
  try {
    const token = req.headers.authorization

    console.log(token)

    if (token === undefined) {
      return next(createError(401))
    }

    const splitToken = token.split(' ')[1]

    const privateKey = readFileSync('public.pem', 'utf-8')
    const payload = jwt.verify(splitToken, privateKey)
    // console.log(payload)
    req.user = {
      email: payload.sub,
      permissionLevel: payload.x_permission_level
    }
    // console.log(req.user)
    return next()
  } catch (err) {
    // OBS KOMMER HIT OM INVALID SIGNATURE!
    console.log(err)
    // err 403 här!
    next(createError(403))
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