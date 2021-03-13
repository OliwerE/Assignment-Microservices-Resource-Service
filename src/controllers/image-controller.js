/**
 * Module represents image controller.
 */

import createError from 'http-errors'
import fetch from 'node-fetch'
import { Image } from '../models/image-model.js'

/**
 * Class represents the image controller.
 */
export class ImageController {
  /**
   * Finds and returns all images owned by the requesting user.
   *
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @param {Function} next - Next function.
   * @returns {object} - The response object.
   */
  async getUserImages (req, res, next) {
    try {
      const userImages = (await Image.find({ owner: req.user.email })).map(Image => ({
        imageUrl: Image.imageUrl,
        location: Image.location,
        description: Image.description,
        createdAt: Image.createdAt,
        updatedAt: Image.updatedAt,
        id: Image.id
      }))
      return res.json(userImages) // Responds with all found user images
    } catch (err) {
      next(createError(500))
    }
  }

  /**
   * Adds new image data to the resource service and image service.
   *
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @param {Function} next - Next function.
   * @returns {object} - The response object.
   */
  async postNewImage (req, res, next) {
    try {
      const obj = { // Data to image service
        data: req.body.data,
        contentType: req.body.contentType
      }
      const jsonObj = JSON.stringify(obj)

      // posta till image service
      let imageServiceRes = '' // Json response from image service
      await fetch(process.env.IMAGE_SERVICE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'PRIVATE-TOKEN': process.env.IMAGE_SERVICE_TOKEN
        },
        body: jsonObj
      }).then(response => {
        return response.json()
      }).then(json => {
        imageServiceRes = json
      }).catch(err => {
        console.log(err)
        next(createError(500))
      })

      const imageObj = {
        imageUrl: imageServiceRes.imageUrl,
        location: req.body.location,
        description: req.body.description,
        createdAt: imageServiceRes.createdAt,
        updatedAt: imageServiceRes.updatedAt,
        id: imageServiceRes.id,
        owner: req.user.email
      }
      const newImage = new Image(imageObj)
      await newImage.save() // Saves new image in mongodb

      delete imageObj.owner // Removes owner from response to client
      return res.status(201).json(imageObj)
    } catch (err) {
      next(createError(500))
    }
  }

  /**
   * Gets a specific image from the resource service.
   *
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @param {Function} next - Next function.
   * @returns {object} - The response object.
   */
  async getImage (req, res, next) {
    try {
      const reqImage = (await Image.find({ id: req.params.id })).map(Image => ({
        imageUrl: Image.imageUrl,
        location: Image.location,
        description: Image.description,
        createdAt: Image.createdAt,
        updatedAt: Image.updatedAt,
        id: Image.id
      }))

      return res.json(reqImage[0])
    } catch (err) {
      next(createError(500))
    }
  }

  /**
   * Updates image on both resource and image service.
   *
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @param {Function} next - Next function.
   * @returns {object} - The response object.
   */
  async putUpdate (req, res, next) {
    try {
      const newImageServiceData = { // Request body with image for image service.
        data: req.body.data,
        contentType: req.body.contentType
      }
      const jsonObj = JSON.stringify(newImageServiceData)

      const url = process.env.IMAGE_SERVICE_URL + req.params.id
      let putStatus = 0
      await fetch(url, { // Updates image service
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'PRIVATE-TOKEN': process.env.IMAGE_SERVICE_TOKEN
        },
        body: jsonObj
      }).then(response => {
        return response.status
      }).then(status => {
        putStatus = status
      }).catch(err => {
        console.log(err)
        next(createError(500))
      })

      if (putStatus === 204) {
        const url = process.env.IMAGE_SERVICE_URL + req.params.id
        let jsonRes = 0
        await fetch(url, { // Gets updated data from image service
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'PRIVATE-TOKEN': process.env.IMAGE_SERVICE_TOKEN
          }
        }).then(response => {
          return response.json()
        }).then(json => {
          jsonRes = json
        }).catch(err => {
          console.log(err)
          next(createError(500))
        })

        await Image.updateOne({ id: req.params.id }, { // Updates image data in mongodb
          imageUrl: jsonRes.imageUrl,
          location: req.body.location,
          description: req.body.description,
          createdAt: jsonRes.createdAt,
          updatedAt: jsonRes.updatedAt,
          id: jsonRes.id
        })

        return res.status(204).send()
      } else {
        return res.status(404).json({ description: 'Image with id not found' })
      }
    } catch (err) {
      next(createError(500))
    }
  }

  /**
   * Partially updates image data on resource and/or image service.
   *
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @param {Function} next - Next function.
   * @returns {object} - The response object.
   */
  async patchUpdate (req, res, next) {
    try {
      const updateObj = {} // Objektet som uppdaterar datan i mongodb

      if (req.body.data && req.body.contentType) { // Update image
        const obj = { // New image data
          data: req.body.data,
          contentType: req.body.contentType
        }
        const jsonObj = JSON.stringify(obj)

        const url = process.env.IMAGE_SERVICE_URL + req.params.id

        let imageServiceStatus = 0
        await fetch(url, { // Updates image service
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'PRIVATE-TOKEN': process.env.IMAGE_SERVICE_TOKEN
          },
          body: jsonObj
        }).then(response => {
          return response.status
        }).then(status => {
          imageServiceStatus = status
        }).catch(err => {
          console.log(err)
          next(createError(500))
        })

        if (imageServiceStatus === 204) { // If image service update succeeded
          await fetch(url, { // Gets updated image data from image service
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'PRIVATE-TOKEN': process.env.IMAGE_SERVICE_TOKEN
            }
          }).then(response => {
            return response.json()
          }).then(json => {
            // Adds changed data to update object
            updateObj.imageUrl = json.imageUrl
            updateObj.createdAt = json.createdAt
            updateObj.updatedAt = json.updatedAt
            updateObj.id = json.id
          }).catch(err => {
            console.log(err)
            next(createError(500))
          })
        } else {
          next(createError(500))
        }
      }

      if (req.body.location) { // Update location
        // Adds changed data to update object
        updateObj.location = req.body.location
      }

      if (req.body.description) { // Update description
        // Adds changed data to update object
        updateObj.description = req.body.description
      }

      await Image.updateOne({ id: req.params.id }, updateObj) // Saves new data in mongodb

      return res.status(204).send()
    } catch (err) {
      next(createError(500))
    }
  }

  /**
   * Removes image from image and resource service.
   *
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @param {Function} next - Next function.
   * @returns {object} - The response object.
   */
  async deleteImage (req, res, next) {
    try {
      const imageId = req.params.id
      const image = await Image.deleteOne({ id: imageId }) // Removes image data from resource service

      if (image.deletedCount === 0) {
        return res.status(404).json({ description: 'Image with id not found' })
      }

      const url = process.env.IMAGE_SERVICE_URL + imageId
      let response = 0
      await fetch(url, { // Removes image from image service
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'PRIVATE-TOKEN': process.env.IMAGE_SERVICE_TOKEN
        }
      }).then(response => {
        return response.status
      }).then(status => {
        response = status
      }).catch(err => {
        console.log(err)
      })

      if (response === 204) {
        return res.status(204).json({ description: 'Image Deleted' })
      } else {
        return res.status(404).json({ description: 'Image with id not found' })
      }
    } catch (err) {
      next(createError(500))
    }
  }
}
