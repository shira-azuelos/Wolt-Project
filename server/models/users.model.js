import { model, Schema } from "mongoose";
import Joi from 'joi';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
  
const usersSchema = new Schema({
    firstname: String,
    lastname: { type: String, required: true, minlength: [3, 'Username must be at least 3 characters'] },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true }
    },
    phone: {
        type: String, required: true, unique: true, trim: true,
    },
    email: {
        type: String, required: true, unique: true, trim: true,
        lowercase: true,
    },
    password: {
        type: String, required: true,
    },
    status: {
        type: String,
        enum: ['deliver', 'menager', 'claient'],
        default: 'claient'
    }
});

usersSchema.pre('save', async function () {
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(this.password, salt); 
    this.password = hash;
});
 export const userSchemas = {
    login: Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().required()
    }),
     register: Joi.object({
        firstname:Joi.string(),
        lastname: Joi.string().required().min(3),
        address: Joi.object({
            street: Joi.string().required(),
            city: Joi.string().required()
        }).required(),
        phone: Joi.string().required().pattern(/^0(5[012345689]|(7[1-9]))[0-9]{7}$/),
        email: Joi.string().required().email(),
        password: Joi.string().required().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/),
        status: Joi.string().valid('deliver', 'menager', 'claient')
    }),
};

export const generateToken = (user) => {
    const payload = { userId: user._id, status: user.status };
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    return token;
};

const users = model('users', usersSchema);
export default users;