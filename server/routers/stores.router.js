import { Router } from "express";
import { getStores,getStoreById, postStotes, putStores, deleteStores } from "../controllers/stores.controllers.js";
import { validateJoiSchema } from "../middlewares/validate.middleware.js";
import { auth, hasRole,optionalAuth } from "../middlewares/auth.middleware.js";
import { storeSchemas } from "../models/stores.model.js";
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

//     --         ניהול חנויות      --
router.get('/',optionalAuth, getStores);//צפייה בחנויות
router.get('/:id', getStoreById); // צפייה בחנות ספציפית לפי ID
router.post('/',auth, hasRole([MANAGER]), upload.single('imageS'), validateJoiSchema(storeSchemas.post), postStotes);//הוספת חנות
router.delete('/:id',auth, hasRole([MANAGER]), deleteStores);//מחיקת חנות
router.put('/:id',auth, hasRole([MANAGER, CLIENT, DELIVER]),upload.single('imageS'), validateJoiSchema(storeSchemas.put), putStores);//עדכון חנות

export default router;
