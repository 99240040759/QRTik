import mongoose from 'mongoose'

export function connectDb(uri) {
  return mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000
  })
}
