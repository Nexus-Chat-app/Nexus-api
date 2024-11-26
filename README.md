# Nexus Api

This is the backend for the real-time chat application, built using **NestJS** and **Express.js**. It handles real-time messaging, video call signaling, and authentication via a microservice.

## Features

- User authentication via Express.js microservice
- Real-time messaging with WebSocket
- WebRTC signaling for video and voice calls
- Database management for users and chat histories

## Tech Stack

- **NestJS**
- **Express.js (Microservice)**
- **TypeScript**
- **WebSocket**
- **WebRTC**
- **MySQL**

## Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd <repo-folder>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env` file:
   ```bash
   cp .env.example .env
   ```
   ```env
   DB_HOST=your-database-host
   DB_USER=your-database-username
   DB_PASS=your-database-password
   JWT_SECRET=your-jwt-secret
   ```
4. Start the development server:
   ```bash
   npm run start:dev
   ```

## Scripts

- `npm run start:dev` - Start the development server
- `npm run build` - Build the production-ready backend

## Contributing

Feel free to open issues or submit pull requests to improve the project!

## License

This project is licensed under [MIT License](./LICENSE).
