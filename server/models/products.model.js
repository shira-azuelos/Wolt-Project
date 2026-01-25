import { model, Schema, Types } from "mongoose";
import Joi from 'joi';

const productSchema = new Schema({
    name: {type:String,required:true},
    price: {type:Number,min: [1, 'Must be at least one shekel'],required:true},
    describe:{type:String,default:''},
    amount: {type:Number,default:0},
    isSale: {type:Boolean,default:false},
    imageP: {type:String,default:''},
    catP: { type: String, enum: ['milk', 'meat', 'drink', 'parve','other'], required: true },
    store: { 
        type: Schema.Types.ObjectId,
        ref: 'stores',
    }
});

export const productSchemas = {
  post: Joi.object({
    name: Joi.string().required(),
    price: Joi.number().min(1).required(),
    describe: Joi.string().default(''),
    amount: Joi.number().default(0),
    isSale: Joi.boolean().default(true),
    imageP: Joi.string().default(''),
    catP: Joi.string().valid('milk', 'meat', 'drink', 'parve','other').required(),
    store: Joi.string().required()
  }),
  put: Joi.object({
    name: Joi.string(),
    price: Joi.number().min(1),
    describe: Joi.string(),
    amount: Joi.number(),
    isSale: Joi.boolean(),
    imageP: Joi.string(),
    catP: Joi.string().valid('milk', 'meat', 'drink', 'parve','other')
  }) 
};
const Product = model('products', productSchema);
export default Product;