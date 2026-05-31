# Event Management API System 🚀

An interactive full-stack web application designed to simulate, visualize, and learn backend API architectures for Event Management Systems. Built with **React 19**, **Express (Node.js)**, **TailwindCSS**, and integrated with **Google Gemini 3.5 Flash** for AI-guided backend development.

---

## 🌟 Key Features

* **Interactive Swagger API Playground**: Simulate backend API requests (User registration, login, JWT token generation, event discovery, booking simulation).
* **FastAPI Code Explorer**: Browse production-ready Python FastAPI, SQLAlchemy model, schema, and authentication source files.
* **SQLite Relational ERD**: Visual representation of the relational database schemas (`Users`, `Events`, `Bookings`, `Tickets`, `Notifications`).
* **AI Code Companion (Gemini AI)**: Real-time integration with Google Gemini 3.5 Flash to ask programming questions, explain database design, or write code.
* **Architecture Flow Diagrams**: Visualize client-server-database communications using sequence flows.
* **Local Python Deployment Guide**: Step-by-step documentation on how to set up the actual FastAPI server locally.

---

## 🛠️ Technology Stack

* **Frontend**: React 19, Vite, TailwindCSS (for sleek, responsive UI), Lucide React (icons), Motion (animations).
* **Backend**: Node.js, Express, TypeScript, TSX.
* **AI Integration**: Official `@google/genai` SDK with Gemini 3.5 Flash.

---

## 🚀 How to Run Locally

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or higher recommended)

### Setup Instructions

1. **Clone or Download** this repository.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   * Create a file named `.env.local` in the root directory.
   * Add your Google Gemini API key:
     ```env
     GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
     APP_URL="http://localhost:3000"
     ```
4. **Run the development server**:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**.

---

## 🌐 Deployment (Render.com)

To host this full-stack application on Render:

1. Create a **Web Service** pointing to your GitHub repository.
2. Set the following build settings:
   * **Runtime**: `Node`
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `npm start`
3. Add the following **Environment Variable**:
   * `GEMINI_API_KEY` = *your_actual_gemini_api_key*
