# 📚 School Management System (Mobile Application)

A scalable mobile application for managing students, courses, enrollments, and academic workflows. The system integrates modern backend architecture with real-time features, third-party services, and AI capabilities.

---

## 📱 Demo Screenshots
### Admin screen 
<p align="left">
<img src="https://github.com/user-attachments/assets/e68bdc31-8f50-41e1-8b5f-0026926b5a7f" width="30%" />
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<img src="https://github.com/user-attachments/assets/710eeaf0-778f-4f39-9ae4-4cc80044d5fc" width="30%" />
</p>

### Payment screen
<img src="https://github.com/user-attachments/assets/568deeda-9190-4d70-9529-f3e65028e739" width="30%"/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<img src="https://github.com/user-attachments/assets/53217d3c-e83b-4a86-9f3f-ae6583490c0e" width="30%"/>

### Chat message screen
<img src="https://github.com/user-attachments/assets/0b665578-83b6-441e-a01d-80b561f7bc06" width="30%"/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<img src="https://github.com/user-attachments/assets/24c0038e-473c-43c8-a6d3-4291c588f96b" width="30%"/>


### AI chatbot screen
<p align="left">
<img src="https://github.com/user-attachments/assets/bb9d0171-1add-42f6-8fc1-10efabbe9404" width="30%" />
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<img src="https://github.com/user-attachments/assets/22258c07-47b5-4fb9-bbd7-c17354af91dc" width="30%" />
</p>

### Course screen
<p align="left">
<img src="https://github.com/user-attachments/assets/4375ae3b-447b-4514-8f15-06ea03a3319a" width="30%"/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<img src="https://github.com/user-attachments/assets/4bb0bef3-a5b2-4e5d-a534-882b940a0869" width="30%"/>
</p>

### Login and Attendance screen
<p align="left">
<img src="https://github.com/user-attachments/assets/fd1dce6c-2790-445e-a7af-ddb568e0d928" width="30%"/>  
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<img src="https://github.com/user-attachments/assets/9b43c3a4-7066-4902-9905-9a49e7d0060b" width="30%"/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<img src="https://github.com/user-attachments/assets/7d30339b-146a-4000-80b3-678071bbf67d" width="30%"/>
</p>

## Teacher and Student screen
<p align="left">
<img src="https://github.com/user-attachments/assets/e691eb19-cb21-4230-b867-e65b156cb510" width="30%"/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<img src="https://github.com/user-attachments/assets/c7165f4b-2027-4694-97a4-54c07d073cae" width="30%"/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<img src="https://github.com/user-attachments/assets/ecced54e-1870-432a-a1e8-1d6ec009571d" width="30%"/>
</p>

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
- **Data Access:** Entity Framework Core
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
cd School-Management-Mobile/code/fe

# Install dependencies
npm install

# Start the Expo server
npx expo start
```
After running the start command, scan the QR code with your phone's camera (iOS) or Expo Go app (Android) to view the application.
## 👥 Team & Roles
- Le Anh Tuan (Backend Developer) 
- Nguyen Xuan Nhat Minh (Frontend Developer)
