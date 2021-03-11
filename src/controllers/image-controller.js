/**
 * Module represents image controller.
 */

import { json } from 'express'
import createError from 'http-errors'
import fetch from 'node-fetch'
import { Image } from '../models/image-model.js'

export class ImageController {
  temp (req, res, next) {
    res.json({ message: 'test' })
  }

  async getUserImages (req, res, next) {
    try {
      const email = req.user.email
      const userImages = (await Image.find({ owner: email })).map(Image => ({
        imageUrl: Image.imageUrl,
        location: Image.location,
        description: Image.description,
        createdAt: Image.createdAt,
        updatedAt: Image.updatedAt,
        id: Image.id
      }))

      // console.log(userImages)

      res.json(userImages)
    } catch (err) {
      console.log(err)
      next(createError(500))
    }
  }

  async postNewImage (req, res, next) {
    try {
      console.log('-----')
      // console.log(process.env.IMAGE_SERVICE_TOKEN)
      // console.log(req.body)

      const obj = { // Något fel här (!)
        "data": req.body.data,
        "contentType": req.body.contentType
      }
      const jsonObj = JSON.stringify(obj)

      // console.log(typeof jsonObj)


      // posta till image service
      let imageServiceRes = ''
      const test = await fetch(process.env.IMAGE_SERVICE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'PRIVATE-TOKEN': process.env.IMAGE_SERVICE_TOKEN
        },
        body: jsonObj
      }).then(response => {
        return response.json()
      }).then(text => {
        // console.log(text)
        imageServiceRes = text
      }).catch(err => {
        console.log(err)
        throw new Error('An error has occurred (getScraper)')
      })


      // console.log(test)

      // spara image url här

      // response objekt
      /*
      const res = {
        imageUrl: imageServiceRes.imageUrl,
        location: req.body.location,
        description: req.body.description,
        createdAt: imageServiceRes.createdAt,
        updatedAt: imageServiceRes.updatedAt,
        id: imageServiceRes.id
      }
      */
      // För mongodb
      const newImage = new Image({
        imageUrl: imageServiceRes.imageUrl,
        location: req.body.location,
        description: req.body.description,
        createdAt: imageServiceRes.createdAt,
        updatedAt: imageServiceRes.updatedAt,
        id: imageServiceRes.id,
        owner: req.user.email
      })

      // console.log(newImage)

      
      await newImage.save() // Saves new account in mongodb

      res.status(201).json({
        imageUrl: imageServiceRes.imageUrl,
        location: req.body.location,
        description: req.body.description,
        createdAt: imageServiceRes.createdAt,
        updatedAt: imageServiceRes.updatedAt,
        id: imageServiceRes.id
      })
    } catch (err) {
      next(createError(500))
    }

  }
}