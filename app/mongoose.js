import mongoose from 'mongoose';
import configDatabase from '../config';

mongoose.Promise = global.Promise;

const MongoConnect = () => {
  const db = mongoose.connect(configDatabase.db.url, {
    useNewUrlParser: true,
    socketTimeoutMS: 30000,
    keepAlive: true,
    reconnectTries: 30000,
  }, (error) => {
    if (error) {
      console.log(`Mongoose default connection error: ${error}`);
    } else {
      console.log('mongo Connected :)');
    }
  });
  // If the connection throws an error
  mongoose.connection.on('error', (err) => {
    console.log(`Mongoose default connection error: ${err}`);
  });

  // When the connection is disconnected
  mongoose.connection.on('disconnected', () => {
    console.log('Mongoose default connection disconnected');
  });

  // If the Node process ends, close the Mongoose connection
  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log('Mongoose default connection disconnected through app termination');
      process.exit(0);
    });
  });


  return db;
};

export default MongoConnect;
