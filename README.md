# BiteWise: Full-Stack Smart Grocery Registry

BiteWise is a responsive, production-ready full-stack web application designed to streamline pantry management and grocery tracking. Built using the robust **PERN stack** (PostgreSQL, Express, React, Node.js), it features secure user authentication and an automated autocomplete search algorithm capable of instantly navigating large product registries.



## Key Features

* **Full CRUD Operations:** Seamlessly **C**reate, **R**ead, **U**pdate, and **D**elete items within your personal grocery and pantry lists, with real-time state synchronization.
* **Smart Search Registry:** Instantly filter and scroll through a database of 200+ predefined grocery items with a maximized fluid dropdown UI layout.
* **Secure Session Authentication:** Implements JSON Web Tokens (JWT) for secure user login and route protection, eliminating hardcoded keys via environment variables (`.env`).
* **Dynamic Database Synchronization:** Client-side states communicate seamlessly with a PostgreSQL connection pool architecture to manage personal user lists.
* **Polished Component Design:** Built with a clean, scannable, component-driven user interface utilizing React and custom responsive CSS.


## The Architecture (PERN Stack)

This application is engineered using four primary technologies:

* **PostgreSQL:** Handles relational data storage, securing user profiles, predefined catalogs, and dynamic shopping items.
* **Express.js:** Manages backend REST API routing, query execution parameters, and request-response cycles.
* **React.js:** Renders the modular, high-speed component tree, managing state transitions and UI elements.
* **Node.js:** Serves as the high-performance asynchronous JavaScript runtime environment handling backend operations.


Project Structure

BiteWise/
├── client/          # React frontend, custom UI components, and styles  
└── server/          # Node.js/Express API, database pools, and JWT middleware  



## Local Setup and Configuration
1. Database Setup
Ensure you have PostgreSQL installed and running locally, then initialize a database named bitewise.


2. Environment Variables
Create a hidden .env file inside your /server directory and configure your credentials:

PORT=5000  
DB_USER=your_postgres_user  
DB_PASSWORD=your_pgadmin_password  
DB_HOST=localhost  
DB_PORT=5432  
DB_DATABASE=bitewise  
JWT_SECRET=your_generated_cryptographic_secret_key  


3. Run the Backend
cd server
npm install
npm run dev # or node index.js


4. Run the Frontend
cd client
npm install
npm run dev
Open http://localhost:5173 to interact with the system!


