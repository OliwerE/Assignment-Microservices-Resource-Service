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

/**
 * Function authorize user sending request.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {Function} next - Next function.
 * @returns {Function} - Next method.
 */
const authorize = (req, res, next) => {
  try {
    const token = req.headers.authorization

    if (token === undefined) {
      return next(createError(401))
    }

    const splitToken = token.split(' ')[1]

    // Verify token
    const privateKey = readFileSync('public.pem', 'utf-8')
    const payload = jwt.verify(splitToken, privateKey)

    req.user = { // Adds user to request object
      email: payload.sub,
      permissionLevel: payload.x_permission_level
    }
    return next()
  } catch (err) {
    console.log(err)
    next(createError(403))
  }
}

/**
 * Function verify if user is owner of image data.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {Function} next - Next function.
 */
const isOwner = async (req, res, next) => {
  try {
    const reqImage = await Image.findOne({ id: req.params.id })
    if (reqImage.owner === req.user.email) { // If user owns the requested image
      next()
    } else {
      next(createError(403))
    }
  } catch (err) {
    res.status(404).json({ description: 'Image with id not found' })
  }
}

router.get('/', authorize, controller.getUserImages)
router.post('/', authorize, controller.postNewImage)

router.get('/:id', authorize, isOwner, controller.getImage)
router.patch('/:id', authorize, isOwner, controller.patchUpdate)
router.put('/:id', authorize, isOwner, controller.putUpdate)
router.delete('/:id', authorize, isOwner, controller.deleteImage)

// All other pages
router.use('*', (req, res, next) => next(createError(404)))
