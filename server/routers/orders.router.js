import { Router } from "express";
import { getOrders, postOrders, putOrders } from "../controllers/orders.controllers.js";
import { validateJoiSchema } from "../middlewares/validate.middleware.js";
import { auth, hasRole } from "../middlewares/auth.middleware.js";
import { orderSchemas } from "../models/orders.model.js";

const router = Router();
const MANAGER = 'menager';
const DELIVER = 'deliver';

//     --         ניהול הזמנות     --
router.get('/',auth, getOrders);//צפייה בהזמנות
router.post('/', validateJoiSchema(orderSchemas.post), postOrders);//הוספת הזמנות
router.put('/:id',auth, hasRole([MANAGER, DELIVER]), validateJoiSchema(orderSchemas.put), putOrders);//עדכון הזמנות

export default router;
