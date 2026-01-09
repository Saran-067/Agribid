# 🌾 AgriBid: Real-Time Agricultural Auction Platform

[![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-NoSQL-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-010101?logo=socket.io)](https://socket.io/)

**AgriBid** is a full-stack MERN application designed to revolutionize how farmers sell their produce. By providing a transparent, real-time auctioning environment, AgriBid allows farmers to list both **perishable** and **non-perishable** goods, connecting them directly with buyers to ensure fair market pricing and reduce middleman exploitation.

---

## 🚀 Core Features
* **Live Real-Time Bidding:** Powered by **Socket.io** for instantaneous bid updates across all connected clients without page refreshes.
* **Smart Categorization:** Specialized handling for:
    * **Perishables:** Short-duration auctions for fresh produce (fruits, vegetables, dairy).
    * **Non-Perishables:** Bulk volume bidding for long-shelf-life items (grains, pulses, seeds).
* **Cloud Image Management:** Seamless product image uploads and transformations using **Cloudinary**.
* **Modern Frontend:** Built with **React + Vite** for a lightning-fast, responsive user experience.
* **Efficient Development:** Integrated **Nodemon** for rapid backend iteration and hot-reloading.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React.js (Vite), Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose) |
| **Real-Time Engine** | Socket.io |
| **Media Storage** | Cloudinary API |
| **Development** | Nodemon, Axios, JWT |

---

## ⚙️ Technical Workflow

### 1. Real-Time Bidding Engine
AgriBid uses WebSockets via **Socket.io** to create a persistent connection between the server and all active bidders. 
* When a new bid is placed, the server validates it against the current highest bid in the database.
* Once validated, the new highest bid is broadcasted to all users in the specific "Auction Room" instantly.





### 2. Product Lifecycles
* **Farmers** can upload images of their crop, set a base price, and select a category.
* The system handles the countdown timers. For perishables, the window is narrowed to ensure the product reaches the buyer while fresh.

---


##Installation & Setup
###1. Prerequisites
*Node.js (v16+)

*MongoDB Atlas Account

*Cloudinary Account (for image hosting)



```
# Clone the repository
git clone [https://github.com/Saran-067/Agribid.git](https://github.com/Saran-067/Agribid.git)
cd Agribid

# Install Backend dependencies
cd app
npm install

# Install Frontend dependencies
cd ../web
npm install

#env file
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret


#run
Backend : cd app , nodemon app
Frontend : cd web , npm run dev   
