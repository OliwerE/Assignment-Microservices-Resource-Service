/**
 * Mongoose image model.
 */

import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
    // unique: true
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true
  },
  owner: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
})

export const Image = mongoose.model('Image', schema)
