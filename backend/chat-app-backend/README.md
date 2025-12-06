 
# Chat App Backend
This is a simple chat application backend built with Node.js, Express, and Socket.IO. It allows users to send and receive messages in real-time.
## Features
- Real-time messaging with Socket.IO (coming soon)
- User authentication with JWT
- Message persistence with MongoDB
- Basic user management (register, login, logout,update profile)
## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/0xTr3m0r/chat-app-backend.git
   ```
2. Create a `.env` file in the root directory and add your MongoDB connection string:
   ```plaintext
   JWT_SECRET=your_jwt_secret
   PORT=5000
   MONGODB_URI=<your-mongodb-uri>
   CLOUDINARY_CLOUD_NAME=<your-cloud-name>
   CLOUDINARY_API_KEY=<your-api-key>
   CLOUDINARY_API_SECRET=<your-api-secret>
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
   
