import orders from "../models/orders.model.js";
import stores from "../models/stores.model.js";
import { isValidObjectId } from "mongoose";

//     --         ניהול הזמנות     --
export const  getOrders= async(req, res,next) => {//צפייה בהזמנות
   try {
        const { status,store } = req.query;
       const filter = {};
       const user = req.user;
       const userStatus = user.status ? (Array.isArray(user.status) ? user.status[0] : user.status).toUpperCase() : null;
           
           if (userStatus === 'CLAIENT') { 
                filter.user = user.userId;
           }
           else if (userStatus === 'MENAGER') { 
                if (store) {
                filter.store = store;
               }
               if (status) { 
                   filter.status = status;
               }
           }
            else if (userStatus === 'DELIVER') {
               filter.status = 'deliver';
            }
        const allorders = await orders.find(filter).populate('store');
        res.status(200).json(allorders);
    } catch (error) {
        console.error('Error fetching orders:', error.message);
        next({ message: 'Failed to fetch orders', error: error.message });
    }
};
 export const postOrders= async (req, res,next) => {// הוספה הזמנה
     try {
         const { productorder,user, date, status,store } = req.body;
        const newO = new orders({ productorder,user, date, status,store });
        await newO.save();
        console.log(newO);
        res.status(201).json(newO);
    } catch (error) {
        console.error(error.message);
        next({ message: "Error adding order", error: error.message });
    }
};
 export const putOrders= async (req, res,next) => {//עדכון הזמנה
  try {
        const { id } = req.params;
        const updatedData = req.body;
        const { userId, status: userStatus } = req.user;         
        const userRole = (Array.isArray(userStatus) ? userStatus[0] : userStatus).toLowerCase(); 
        const existingOrder = await orders.findById(id).populate('store');
        if (!existingOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }        
        
        if (userRole === 'menager') {
            const store = existingOrder.store;
            if (!store || store.manager.toString() !== userId.toString()) {
                return res.status(403).json({ message: 'Access Forbidden: You do not manage the store associated with this order' });
            }
            if (updatedData.user) {
                delete updatedData.user; 
            }
        } 
        else if (userRole === 'deliver') {
            const allowedFields = ['status']; //למשלוחן מותר לעדכן רק את הסטטוס
            const hasOtherFields = Object.keys(updatedData).some(key => !allowedFields.includes(key));//בודק אם זה מכיל שדות נוספים מלבד הסטטוס
            if (hasOtherFields) {
                 return res.status(403).json({ message: 'Access Forbidden: Deliverers can only update the order status' });
            }            
            if (updatedData.status && updatedData.status !== 'finish') {
                 return res.status(400).json({ message: 'Invalid status update for deliverer - only "finish" is allowed' });
            }
             if (updatedData.status === 'finish' && existingOrder.status !== 'deliver') {//סטטוס לפני העדכון חייב להיות משלוחן
                 return res.status(400).json({ message: 'Order must be in "deliver" status to be marked as "finish"' });
             }
        }
        let updatedOrders = await orders.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        if (!updatedOrders) {
            return res.status(404).json({ message: 'order not found' });
        }
        if (updatedOrders.status === 'finish') {
            updatedOrders = await updatedOrders.populate('user'); 
        }
        if (updatedOrders.status === 'deliver' && global.io) {
            const messagePayload = {
                text: `ישנה הזמנה חדשה (מס' ${updatedOrders._id}) ממתינה למשלוח!`,
                orderId: updatedOrders._id,
                type: 'new_delivery'
            };
            global.io.emit('new_delivery_notification', messagePayload);
        }
        if (updatedOrders.status === 'finish' && updatedOrders.user && updatedOrders.user._id && global.io && global.users) {
            const customerId = updatedOrders.user._id.toString(); 
            const storeId = updatedOrders.store.toString(); 
            const customerSocketId = global.users[customerId];
            if (customerSocketId) {
                global.io.to(customerSocketId).emit('message', {
                    type: 'order_finished',
                    message: "ההזמנה שלך הסתיימה בהצלחה! אנא דרג את החנות.",
                    store: storeId,
                    user: customerId
                });
            }
        }
        res.status(200).json(updatedOrders);
    } catch (error) {
        console.error('Error updating order:', error.message);
        next({ message: 'Failed to update order', error: error.message });
    }
};

 