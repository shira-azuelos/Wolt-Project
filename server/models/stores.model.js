import { model, Schema } from "mongoose";
import Joi from 'joi';

const storesSchema = new Schema({
    name: { type: String, require: true },
    address: {
        street: String,
        city: { type: String, require: true }
    },
    openion: [{
        derug: Number,
        nameO: String,
        describe: String
    }],
    phone: String,
    imageS: String,
    typeS: { type: String, enum: ['resturant', 'shop'], required: true },
    catS: { type: String, enum: ['milk', 'meat', 'colbo'], required: true },
    manager: { 
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true 
    }
});

export const storeSchemas = {
    post: Joi.object({
        name: Joi.string().required(),
        address: Joi.object({
            street: Joi.string().required(),
            city: Joi.string().required()
        }).required(),
        openion: Joi.array().items(Joi.object({
            derug: Joi.number(),
            nameO: Joi.string(),
            describe: Joi.string()
        })),
        phone: Joi.string().required().pattern(/^0(5[012345689]|(7[1-9]))[0-9]{7}$/),
        imageS: Joi.string(),
        typeS: Joi.string().valid('resturant', 'shop').required(),
        catS: Joi.string().valid('milk', 'meat', 'colbo').required(),
        manager: Joi.string().required() 
    }),
    put: Joi.object({
        name: Joi.string(),
        address: Joi.object({
            street: Joi.string(),
            city: Joi.string()
        }),
        openion: Joi.array().items(Joi.object({
            derug: Joi.number(),
            nameO: Joi.string(),
            describe: Joi.string()
        })),
        phone: Joi.string().pattern(/^0(5[012345689]|(7[1-9]))[0-9]{7}$/),
        imageS: Joi.string(),
        typeS: Joi.string().valid('resturant', 'shop'),
        catS: Joi.string().valid('milk', 'meat', 'colbo'),
        manager: Joi.string()
    }).min(1)
};

const stores = model('stores', storesSchema);
export default stores;
