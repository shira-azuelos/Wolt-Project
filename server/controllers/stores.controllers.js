import stores from "../models/stores.model.js";

//     --         ניהול חנויות      --
export const getStores = async (req, res, next) => {//צפייה בחנויות
   try {
        const { catS, name,address, typeS,manager} = req.query;
        const filter = {};
       if (req.user && req.user.status === 'menager') { 
            filter.manager = req.user.userId;
        } else if (manager) {
            filter.manager = manager; 
        }
        if (typeS) {
            filter.typeS = typeS;
        }
        if (catS) {
            filter.catS = catS;
        }
        if (name) {
            filter.name = { $regex: name, $options:'i'}
        }
        if (address) {
            filter.address = { $regex: address, $options:'i'}
        }
        if (manager) {
            filter.manager = manager; 
       }
           const allstores = await stores.find(filter); 
           res.status(200).json(allstores);
    } catch (error) {
        console.error('Error fetching stores:', error.message);
        next({ message: 'Failed to fetch stores', error: error.message });
    }
};
export const getStoreById = async (req, res, next) => { //צפייה בחנות ספציפית לפי ID
   try {
        const { id } = req.params;
        const store = await stores.findById(id); 
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        
        res.status(200).json(store);
    } catch (error) {
        console.error('Error fetching store by ID:', error.message);
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'Invalid Store ID format' });
        }
        next({ message: 'Failed to fetch store', error: error.message });
    }
};
export const postStotes=async (req, res,next) => {//הוספת חנות
    const managerId = req.user.userId;
    try {
        const { name, address, openion, phone, typeS, catS } = req.body;
        let imageS= ''; 
        if (req.file) {
            imageS = `./public/images/${req.file.filename}`;
      }
        const newS = new stores({ name, address, openion, phone,manager: managerId, typeS, catS ,imageS:imageS });
        await newS.save();
        console.log(newS);
        res.status(201).json(newS);
    } catch (error) {
        console.error(error.message);
        return next({ message: "Error adding store", error: error.message });
    }
};
export const deleteStores=async (req, res,next) => {//מחיקת חנות
     try {
        const { id } = req.params;
        const managerId = req.user.userId;
        const existingStore = await stores.findById(id);
        if (!existingStore) {
             return res.status(404).json({ message: 'store not found' });
        }
        if (existingStore.manager.toString() !== managerId.toString()) {
            return res.status(403).json({ message: 'Access Forbidden: You do not manage this store' });
        }        
        const result = await stores.findByIdAndDelete(id);
        res.status(204).json({ message: 'store deleted successfully' });
    } catch (error) {
        console.error('Error deleting store:', error.message);
        next({ message: 'Failed to delete store', error: error.message });
    }
};
export const putStores=async (req, res,next) => {//עדכון חנות
    try {
        const { id } = req.params;
        const updateOperation = {};
        if (req.body.openion && Array.isArray(req.body.openion) && req.body.openion.length > 0) {
            updateOperation.$push = { openion: { $each: req.body.openion } };
            delete req.body.openion; 
        }
        if (Object.keys(req.body).length > 0) {
            const userStatus = req.user.status;             
            if (userStatus !== 'menager') {
                return res.status(403).json({ message: 'Access Forbidden: Only manager can update store details' });
            }            
            const managerId = req.user.userId;
            const existingStore = await stores.findById(id);
            if (!existingStore || existingStore.manager.toString() !== managerId.toString()) {
                return res.status(403).json({ message: 'Access Forbidden: You do not manage this store' });
            }            
            updateOperation.$set = req.body;
        }
        let updatedStores;
        if (Object.keys(updateOperation).length > 0) {
             updatedStores = await stores.findByIdAndUpdate(id, updateOperation, { new: true, runValidators: true });
        } else {
             updatedStores = await stores.findById(id);
        }
        if (!updatedStores) {
            return res.status(404).json({ message: 'Store not found' });
        }
        res.status(200).json(updatedStores);
    } catch (error) {
        console.error('Error updating store', error.message);
        next({ message: 'Failed to update store', error: error.message });
    }
};




