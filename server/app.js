import express, { json, urlencoded } from 'express'
import morgan from 'morgan';
import cors from 'cors'; 
import { connectDB } from './config/db.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import productsRouter from './routers/products.router.js';
import ordersRouter from './routers/orders.router.js';
import usersRouter from './routers/users.router.js';
import storesRouter from './routers/stores.router.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { config } from 'dotenv';

config();

const app = express();
const httpServer = createServer(app);//בשביל  Socket.IO

const io = new Server(httpServer, {
    cors: {
        origin: ['http://127.0.0.1:5501', 'http://127.0.0.1:5500'],
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type']
    }
});

const users = {}; 
global.io = io;
global.users = users;

connectDB('woltDB');

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(morgan("dev"));
app.use('/products', productsRouter);
app.use('/orders', ordersRouter);
app.use('/users', usersRouter);
app.use('/stores', storesRouter);

io.on('connection', (socket) => {//בכל זמן שמשתמש נכנס למערכת
    console.log('A user connected:', socket.id);
    socket.on('register', (userId) => {
        users[userId] = socket.id; 
        console.log(`User ${userId} registered with socket ID: ${socket.id}`);
    });
    socket.on('order_transferred_to_deliver', (orderData) => {//מקשיב לאירוע שמגיע מהמנהל (קובץ mangerO.js
        console.log('Order transferred to deliver, broadcasting for notification.');
        io.emit('new_delivery_notification', orderData);  //ומשדר אותו לכל המחוברים
    });
    socket.on('finish_delivery_from_courier', (orderData) => {//מקשיב לאירוע שמגיע מהמשלוחן
        console.log('Delivery finished, notifying manager and others.');
      io.emit('finish_delivery_notification', orderData);    });//משדר אותו למנהל המתאים
    
    socket.on('message', (data) => {11//חוות דעת
        const { message, user, store } = data;  
        if (user && users[user] && store) {
            socket.to(users[user]).emit('message', { message, store });
        } else {
            console.error('User not defined or not connected');
        }
    });

    socket.on('disconnect', () => {//כשאר לקוח מתנתק
        console.log('User disconnected');
        for (const userId in users) {
            if (users[userId] === socket.id) {
                delete users[userId];
                break;
            }
        }
    });
});

app.use(errorHandler);

httpServer.listen(process.env.PORT || 3000, () => {
    console.log(`app listening http://localhost:${process.env.PORT || 3000}`);
});