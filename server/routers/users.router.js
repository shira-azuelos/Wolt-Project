import { Router } from "express";
import { login, register,getUserById,putUsers  } from "../controllers/users.controllers.js";
import { validateJoiSchema } from "../middlewares/validate.middleware.js"; 
import { auth } from "../middlewares/auth.middleware.js";
import { userSchemas } from "../models/users.model.js";

const router = Router();

//     --         ניהול משתמשים     --
router.post('/login', validateJoiSchema(userSchemas.login), login); // התחברות
router.post('/', validateJoiSchema(userSchemas.register), register);//הרשמה
router.get('/:id', auth, getUserById);
router.put('/:id', auth, putUsers); // עדכון משתמש

export default router;
