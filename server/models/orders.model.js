import { model, Schema } from "mongoose";
import Joi from 'joi';

const ordersSchema = new Schema({
  productorder: [{
        type: Schema.Types.ObjectId,
        ref: 'products'
  }],
  user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
  },
  store: {
        type: Schema.Types.ObjectId,
        ref: 'stores',
        required: true 
    },
  date:{type:Date , default: Date.now},
  status:
  {
     type: String,
     enum: ['deliver', 'finish', 'waiting'],
     default: 'waiting',
     required: true
  } 
    
}); 


export const orderSchemas = {
  post: Joi.object({
    productorder: Joi.array().items(Joi.string().hex().length(24)).required(),
    user: Joi.string().hex().length(24).required(),
    date: Joi.date().default(new Date()),
    store: Joi.string().hex().length(24).required(),
    status: Joi.string().valid('deliver', 'finish', 'waiting').default('waiting') 
  }),
  put: Joi.object({
    productorder: Joi.array().items(Joi.string().hex().length(24)),
    user: Joi.string().hex().length(24),
    store: Joi.string().hex().length(24),
    date: Joi.date(),
    status: Joi.string().valid('deliver', 'finish', 'waiting')
  }).min(1)
};
const orders = model('orders', ordersSchema);
export default orders;


