/**
 * Module represents the image router.
 */

import express from 'express'
import createError from 'http-errors'

import { readFileSync } from 'fs'
import jwt from 'jsonwebtoken'

import { ImageController } from '../controllers/image-controller.js'

import { Image } from '../models/image-model.js'

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
    // console.log(err.message)
    // err 403 här!
    next(createError(403))
  }
}

const isOwner = async (req, res, next) => {
  try {
    const reqImage = await Image.findOne({ id: req.params.id })
    if (reqImage.owner === req.user.email) {
      next()
    } else {
      next(createError(403))
    }
  } catch (err) {
    next(createError(404))
  }
}

router.get('/', authorize, controller.getUserImages) // get all img
router.post('/', authorize, controller.postNewImage) // add new img
router.delete('/:id', authorize, isOwner, controller.deleteImage) // remove specific img
router.get('/:id', authorize, isOwner, controller.getImage) // get specific img
router.put('/:id', authorize, isOwner, controller.putUpdate) // update specific img

router.patch('/images/:id') // partially update specific img

// All other pages
router.use('*', (req, res, next) => next(createError(404)))