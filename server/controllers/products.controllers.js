import products from "../models/products.model.js";
 import stores from "../models/stores.model.js";
 
//     --         ניהול מוצרים     --
export const getProducts=async (req, res,next) => {//צפייה מוצרים
    try {
        const {_id, catP, name, storeId } = req.query; 
        const filter = {};
        if (_id) {
            filter._id = _id;
        }

        if (catP) {
            filter.catP = catP;
        }
        if (name) {
            filter.name = { $regex: name, $options: 'i' }
        }
        if (storeId) {
            filter.store = storeId;
        }

           const allProducts = await products.find(filter);
           res.status(200).json(allProducts);
    } catch (error) {
        console.error('Error fetching products:', error.message);
        next({ message: 'Failed to fetch products', error: error.message });
    }
};
export const postProducts=async(req, res) => {//הוספת מוצר
    try {
      const managerId = req.user.userId;
      const storeId = req.body.store;
      const store = await stores.findById(storeId);
      if (!store || store.manager.toString() !== managerId.toString()) {
           return res.status(403).json({ message: 'Access Forbidden: You do not manage this store' });
      }
      const { name, price, describe, amount, isSale, catP } = req.body;
      let imageP = ''; 
        if (req.file) {
            imageP = `../../public/images/${req.file.filename}`;
        }

      const newP = new products({ name, price, describe, amount, isSale, catP, store: storeId,imageP: imageP});
        await newP.save();
        console.log(newP);
        res.status(201).json(newP);
    } catch (error) {
        console.error('Error adding product:', error.message);
        return next({ message: 'Failed to add product', error: error.message });
    }
};
export const deleteProducts=async(req, res) => {//מחיקת מוצר
     try {
        const { id } = req.params;
       const managerId = req.user.userId; 
        const productToDelete = await products.findById(id);
        if (!productToDelete) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const store = await stores.findById(productToDelete.store);        
        if (!store || store.manager.toString() !== managerId.toString()) {
            return res.status(403).json({ message: 'Access Forbidden: You do not manage the store of this product' });
        }        
        await products.findByIdAndDelete(id);
        res.status(204).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error.message);
        next({ message: 'Failed to delete product', error: error.message });
    }
};
export const putProducts = async (req, res, next) => { // עדכון מוצר
    try {
        const { id } = req.params;
        const updateData = req.body;        
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Unauthorized: User information missing' });
        }
        const userStatus = req.user.status; 
        const isOnlyAmountUpdate = (//אם זה רק עדכון מלאי
            Object.keys(updateData).length === 1 && 
            updateData.amount !== undefined && 
            !req.file 
        );        
        if (!isOnlyAmountUpdate) {                        
            if (userStatus !== 'menager') {
                 return res.status(403).json({ message: 'Access Forbidden: Only manager can perform full product update' });
            }            
            const managerId = req.user.userId;
            const existingProduct = await products.findById(id);
            if (!existingProduct) {
                 return res.status(404).json({ message: 'Product not found' });
            }        
            const store = await stores.findById(existingProduct.store);        
            if (!store || store.manager.toString() !== managerId.toString()) {
                 return res.status(403).json({ message: 'Access Forbidden: You do not manage the store of this product' });
            }            
            if (req.file) {
                updateData.imageP = `../../public/images/${req.file.filename}`;
            }
        }        
        const updatedProduct = await products.findByIdAndUpdate(id, updateData, { 
            new: true, 
            runValidators: true
        });
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Error in putProducts controller:', error.message);
        return next({ message: 'Failed to update product due to server error', error: error.message });
    }
};