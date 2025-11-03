const mongoose = require('mongoose');

async function connectMongo(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log('✅ MongoDB connected');
}

module.exports = { connectMongo };


