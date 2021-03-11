/**
 * Module represents image controller.
 */

import fetch from 'node-fetch'
import { Image } from '../models/image-model.js'

export class ImageController {
  temp (req, res, next) {
    res.json({ message: 'test' })
  }

  async postNewImage (req, res, next) {
    console.log('-----')
    console.log(process.env.IMAGE_SERVICE_TOKEN)
    // console.log(req.body)

    const obj = { // Något fel här (!)
      "data": req.body.data,
      "contentType": req.body.contentType
    }
    const jsonObj = JSON.stringify(obj)

    // console.log(typeof jsonObj)


    // posta till image service
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
      console.log(text)
    }).catch(err => {
      console.log(err)
      throw new Error('An error has occurred (getScraper)')
    })


    // console.log(test)

    // spara image url här


    // lagra info + url i mongodb

    /* 
    const newAccount = new Account({
      email: email,
      password: await bcrypt.hash(password, 8) // Encrypts password
    })
    await newAccount.save() // Saves new account in mongodb
    */
  }
}