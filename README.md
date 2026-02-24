# WOLT - Real-Time Delivery & Purchase Management System

A comprehensive system simulating the core functionality of a modern delivery platform. The system enables full management of purchasing processes, deliveries, and real-time transactions, with a clear separation between customers, store managers, and couriers.

---

## Key Features

### Role-Based UI (User Interfaces)

- **Customer Interface:** Browse stores and products, manage shopping carts (anonymous/registered), track orders in real-time, and leave reviews.
- **Store Manager Interface:** Full management of the product catalog (CRUD), updating store details, and managing incoming orders.
- **Courier Interface:** Receive real-time notifications for available deliveries and update delivery status.

### Tech Stack

- **Backend:** Node.js & Express.js using MVC (Model-View-Controller) architecture.
- **Database:** MongoDB & Mongoose.
- **Real-time:** Socket.IO for instant synchronization (courier notifications and status updates).
- **Security:** JWT Authentication, password encryption (bcryptjs), and Role-Based Access Control (RBAC).
- **Frontend:** JavaScript (ES6+), HTML5, CSS3, and Axios.

---

## Database Schema (Data Models)

### Users

| Field       | Type   | Constraints/Default                  | Description                   |
| :---------- | :----- | :----------------------------------- | :---------------------------- |
| `firstname` | String | -                                    | User's first name             |
| `lastname`  | String | Required, Min 3 chars                | User's last name              |
| `email`     | String | Required, Unique, Email format       | Login email address           |
| `password`  | String | Required, Hashed                     | Bcrypt encrypted password     |
| `phone`     | String | Required, Unique, Regex              | Phone number (Israeli format) |
| `status`    | String | enum: `client`, `manager`, `courier` | User's role in the system     |

### Products

| Field      | Type     | Constraints/Default                             | Description                     |
| :--------- | :------- | :---------------------------------------------- | :------------------------------ |
| `name`     | String   | Required                                        | Product name                    |
| `price`    | Number   | Required, Min: 1                                | Price in NIS                    |
| `describe` | String   | Default: ""                                     | Short description of the item   |
| `amount`   | Number   | Default: 0                                      | Inventory stock quantity        |
| `catP`     | String   | enum: `milk`, `meat`, `drink`, `parve`, `other` | Kosher category/Type            |
| `store`    | ObjectId | Ref: `stores`                                   | Store ID the product belongs to |

### Stores

| Field     | Type     | Constraints/Default                    | Description                  |
| :-------- | :------- | :------------------------------------- | :--------------------------- |
| `name`    | String   | Required                               | Store/Restaurant name        |
| `address` | Object   | `street`, `city` (Required)            | Physical address             |
| `phone`   | String   | Required, Regex                        | Contact phone number         |
| `typeS`   | String   | enum: `restaurant`, `shop`             | Type of business             |
| `manager` | ObjectId | Ref: `User`, Required                  | User who manages the store   |
| `opinion` | Array    | Objects: `rating`, `nameO`, `describe` | Array of reviews and ratings |

### Orders

| Field          | Type     | Constraints/Default                   | Description               |
| :------------- | :------- | :------------------------------------ | :------------------------ |
| `productorder` | Array    | [ObjectId], Ref: `products`           | List of ordered products  |
| `user`         | ObjectId | Ref: `users`, Required                | Customer who placed order |
| `status`       | String   | enum: `waiting`, `delivery`, `finish` | Current delivery status   |

---

## API Documentation (Endpoints)

### Order Management

| Action        | Path          | Method | Permission                |
| :------------ | :------------ | :----- | :------------------------ |
| View Orders   | `/orders`     | `GET`  | `Auth` (Filtered by role) |
| Create Order  | `/orders`     | `POST` | `Public / Registered`     |
| Update Status | `/orders/:id` | `PUT`  | `Manager / Courier`       |

### Products & Stores

| Action         | Path            | Method   | Permission |
| :------------- | :-------------- | :------- | :--------- |
| Fetch Stores   | `/stores`       | `GET`    | `Public`   |
| Add Store      | `/stores`       | `POST`   | `Manager`  |
| Add Product    | `/products`     | `POST`   | `Manager`  |
| Delete Product | `/products/:id` | `DELETE` | `Manager`  |

---

## Security & Middlewares

The system utilizes custom Middlewares to ensure secure access control:

- **Auth Middleware:** Validates JWT Tokens and identifies the logged-in user.
- **Role Validation (`hasRole`):** Checks permissions (e.g., only couriers and managers can update order status).
- **Joi Validation:** Comprehensive schema validation for `POST` and `PUT` request bodies.
- **Multer:** Handles image uploads for products and stores, storing them on the server.

---

## Real-Time Communication (Socket.IO Flow)

The logic is managed via `app.js` to enable seamless synchronization:

1. **Registration:** A connecting user maps their `userId` to their unique `socket.id` on the server.
2. **Courier Notification:** When an order status changes to `delivery`, an alert is broadcasted to all connected couriers.
3. **Order Completion:** When a courier marks an order as `finish`, the customer receives a notification requesting a store review.

---

## Local Setup

1. **Install Dependencies:**

```bash
npm install
Run the Server:

Bash
npm start
© Developed by: Shira Azualos & Tobi Gringard
```
