import { Router } from "express";
import { getProducts, postProducts, putProducts, deleteProducts } from "../controllers/products.controllers.js";
import { validateJoiSchema } from "../middlewares/validate.middleware.js";
import { auth, hasRole } from "../middlewares/auth.middleware.js";
import { productSchemas } from "../models/products.model.js";
import multer from 'multer';
import path from 'path'; 
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', '..', 'client', 'client-wolt', 'public', 'images'); 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname); 
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });
const router = Router();
const MANAGER = 'menager';
const CLIENT = 'claient';
const DELIVER = 'deliver';

//     --         ניהול מוצרים     --
router.get('/', getProducts);//צפייה במוצרים
router.post('/',auth, hasRole([MANAGER]),upload.single('imageP'), validateJoiSchema(productSchemas.post), postProducts);//הוספת מוצר
router.put('/:id',auth, hasRole([MANAGER, CLIENT, DELIVER]), upload.single('imageP'),validateJoiSchema(productSchemas.put), putProducts);//עדכון מוצר
router.delete('/:id',auth, hasRole([MANAGER]), deleteProducts);//מחיקת מוצר

export default router;