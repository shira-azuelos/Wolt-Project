# Wolt Clone - Real-Time Delivery Platform

## Overview

A comprehensive system simulating the core functionality of a modern delivery platform. The application enables full management of purchasing processes, deliveries, and real-time transactions, with a clear separation of logic and interfaces between customers, store managers, and couriers.

## Key Features

- **Customer Experience:** Browse stores and products, manage shopping carts, track active orders in real-time, and leave reviews. Supports both anonymous browsing and registered user flows.
- **Store Management:** Dedicated interface for store managers to handle product catalogs (CRUD operations), update store details, and manage incoming orders.
- **Courier Operations:** Real-time push notifications for available deliveries and instant delivery status updates.
- **Real-Time Synchronization:** Powered by Socket.IO to ensure seamless communication between the server, couriers, and customers.

## Tech Stack

- **Backend:** Node.js & Express.js (MVC Architecture)
- **Database:** MongoDB & Mongoose
- **Real-Time Engine:** Socket.IO
- **Security:** JWT Authentication, Bcrypt password hashing, and Role-Based Access Control (RBAC)
- **Frontend:** JavaScript (ES6+), HTML5, CSS3, Axios

## Architecture & Security Highlights

Instead of a monolithic approach, the backend is structured to ensure security and scalability:
- **Role-Based Access Control:** Custom middlewares ensure that routes are protected. For example, only authenticated couriers can accept deliveries, and only managers can edit store catalogs.
- **Data Validation:** Strict schema validation using **Joi** for all incoming requests (POST/PUT).
- **Media Management:** Integrated **Multer** for handling and storing image uploads for products and store profiles.
- **Robust Data Models:** Well-structured MongoDB schemas mapping relationships between Users, Stores, Products, and Orders.

## Real-Time Flow

1. **Connection:** Users connect via WebSockets, mapping their unique IDs to active socket sessions.
2. **Dispatching:** When an order is ready for delivery, the system broadcasts a live alert to all available couriers.
3. **Completion:** Upon delivery confirmation by the courier, the customer instantly receives a notification prompting them to rate the store.

---

## Getting Started

### 1. Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)

### 2. Installation & Setup

**Clone the repository:**
```bash
git clone [https://github.com/shira-azuelos/wolt-clone.git](https://github.com/shira-azuelos/wolt-clone.git)
cd wolt-clone
npm install
npm run dev

Developed by: Shira Azuelos & Tovi Gringard
