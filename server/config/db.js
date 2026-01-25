import mongoose from 'mongoose';
import Products from '../models/products.model.js';
import users from '../models/users.model.js';
import orders from '../models/orders.model.js';

export async function connectDB(dbname) {
    try {
        const DB_URI = `mongodb://localhost:27017/${dbname}`;
        await mongoose.connect(DB_URI);
        console.log('mongo connected succesfuly');
    } catch (error) {
        console.log('ERROR', error.message);
    }
}
