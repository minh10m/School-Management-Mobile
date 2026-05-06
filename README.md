# 📚 School Management System (Mobile Application)

A scalable mobile application for managing students, courses, enrollments, and academic workflows. The system integrates modern backend architecture with real-time features, third-party services, and AI capabilities.

---
## 📱 Project Overview

- **Comprehensive Management:** Handles students, courses, enrollments, and scheduling  
- **Real-time Communication:** Chat and notifications powered by a hybrid architecture (PostgreSQL + Firebase)  
- **AI Integration:** Context-aware chatbot using Google Gemini API and Semantic Kernel with Retrieval-Augmented Generation (RAG)  
- **Payment Integration:** SePay gateway with webhook verification for tuition payments  
- **Security:** JWT authentication, Role-Based Access Control (RBAC), and Cloudflare WAF  

---

## 🛠️ Tech Stack

### Backend (Core System)
- **Language/Framework:** C#, ASP.NET Core  
- **Data Access:** Entity Framework Core, ADO.NET  
- **Databases:** PostgreSQL (relational), Firebase Firestore (real-time), Redis (caching)  
- **Security:** JWT, RBAC, Cloudflare WAF  

### AI & Integrations
- **AI:** Google Gemini API, Semantic Kernel (RAG)  
- **Payment:** SePay  
- **Infrastructure:** Azure, GitHub Actions (CI/CD)  

### Mobile
- **Framework:** React Native, TypeScript  

---

## ✨ Key Features

### 1. RESTful API System
- Developed 100+ RESTful APIs covering core modules  
- Designed and optimized database schema with 30+ tables  

### 2. Hybrid Real-time Chat
- Messages stored in PostgreSQL for persistence  
- Synced with Firebase Firestore for real-time delivery  
- Backend-controlled flow to ensure consistency  

### 3. AI Assistant (RAG)
- Implemented Retrieval-Augmented Generation (RAG)  
- Enables context-aware responses based on system data  

### 4. CI/CD & Deployment
- Automated deployment using GitHub Actions  
- Deployed on Azure  
- API protected by Cloudflare WAF (rate limiting, basic attack mitigation)  

---

## 🏗️ System Architecture

- **Mobile Client:** Handles UI and real-time listeners  
- **Backend API (.NET):** Processes business logic and integrations  
- **Database Layer:** PostgreSQL (primary), Redis (caching)  
- **Realtime Layer:** Firebase Firestore  
- **AI Layer:** Semantic Kernel + Gemini API  

---

## ⚙️ Setup & Run

### 1. Backend
The backend is already deployed and managed via CI/CD (GitHub Actions).  

Swagger Documentation: https://api.tuan-minh-dev-soc.io.vn/swagger

### 2. Mobile (Frontend)
Follow these steps to run the mobile application locally:

Environment Setup:

Create a .env file in the root of the mobile project.

Add the following configurations (Contact the administrator for actual keys):
```bash
API_URL=https://api.tuan-minh-dev-soc.io.vn/api

SEPAY_API_KEY=YOUR_SEPAY_API_KEY_HERE
```
Prerequisites:

Install Expo Go app on your physical device (iOS/Android).

Node.js installed on your machine.

Steps:
```bash
# Clone the project
git clone https://github.com/minh10m/School-Management-Mobile.git
cd School-Management-Mobile

# Install dependencies
npm install

# Start the Expo server
npx expo start
```
After running the start command, scan the QR code with your phone's camera (iOS) or Expo Go app (Android) to view the application.
## 👥 Team & Roles
- Le Anh Tuan (Backend Developer) 
- Nguyen Xuan Nhat Minh (Frontend Developer)
