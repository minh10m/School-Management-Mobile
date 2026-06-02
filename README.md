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

- **Comprehensive Management:** Handles complex academic logic including students, courses, enrollments, tuition fees, timetables, and exam schedules.
- **Real-time Communication:** Chat and notifications powered by a hybrid architecture (PostgreSQL for persistence + Firebase Firestore for real-time delivery).
- **AI Integration:** Context-aware chatbot using Google Gemini API and Semantic Kernel with Retrieval-Augmented Generation (RAG) to query system data.
- **Payment Integration:** SePay gateway with automated webhook verification for tuition payments.
- **Media Management:** Integrated Cloudinary for optimized image storage and processing.
- **Security & DevOps:** JWT authentication, RBAC, Cloudflare WAF, and automated CI/CD via GitHub Actions deployed on Azure.

---

## 🛠️ Tech Stack

### Backend (Core System)
- **Language/Framework:** C# (.NET 8), ASP.NET Core
- **Data Access:** Entity Framework Core (EF Core)
- **Databases:** PostgreSQL (Relational), Firebase Firestore (Real-time), Redis (Caching)
- **Media:** Cloudinary API (Image hosting & optimization)
- **Security:** JWT, Role-Based Access Control (RBAC), Cloudflare WAF (Rate limiting, DDoS protection)

### AI & Integrations
- **AI Engine:** Google Gemini API, Semantic Kernel (RAG Architecture)
- **Payment Gateway:** SePay (QR Code & Webhook integration)
- **Infrastructure:** Microsoft Azure, GitHub Actions (CI/CD)

### Mobile
- **Framework:** React Native, TypeScript, Expo
- **State Management:** Zustand

---

## ✨ Key Features

### 1. Academic Workflow & RESTful API
- **Complex Logic:** Developed 100+ APIs managing intricate school workflows: Timetables, Exam schedules, Tuition debt, and Attendance.
- **Database Design:** Optimized schema with 30+ tables in PostgreSQL.

### 2. Hybrid Real-time Chat & Notifications
- **Consistency:** Messages stored in PostgreSQL for permanent records.
- **Speed:** Synchronized with Firebase Firestore for instant real-time messaging.
- **Push Notifications:** Automated system alerts for academic updates via Firebase.

### 3. AI Assistant (RAG Implementation)
- **Context-aware:** Uses Retrieval-Augmented Generation (RAG) to provide answers based on real-time school data (schedules, grades, regulations).

### 4. Financial & Media Integration
- **Automated Billing:** Real-time tuition payment processing via SePay Webhooks.
- **Optimized Media:** Profile pictures and documents managed via Cloudinary with on-the-fly resizing.

### 5. Monitoring & Observability
- **Logging:** Centralized structured logging implemented with **Serilog** for context enrichment and request tracking.
- **Tracing & Metrics:** Deep integration with **OpenTelemetry** for full-stack observability (HTTP requests, Npgsql database queries, and runtime metrics).
- **Health Checks:** Automated ASP.NET Core Health Checks to continuously monitor the PostgreSQL database and API availability.

---

## 🏗️ System Architecture
- **Mobile Client:** React Native app with real-time listeners.
- **Security Layer:** Cloudflare WAF protection.
- **Backend API (.NET):** Business logic, RAG processing, and 3rd-party integrations.
- **Storage Layer:** PostgreSQL (Primary), Redis (Cache), Cloudinary (Images).
- **Realtime Layer:** Firebase Firestore sync.

<img width="1000" height="731" alt="diagram-export" src="https://github.com/user-attachments/assets/e18116d9-2913-4a67-ab4f-e4f983a985f2" />

---

---

## ⚙️ Setup & Run


### 1. Backend
The backend system is fully automated and deployed on **Azure App Service** via **GitHub Actions (CI/CD)**. No manual setup is required for the production environment.

**Run Backend Locally (Development):**
```bash
cd code/be/School_Management.API/School_Management.API
dotnet run
```

### 2. Monitoring & Observability (Local Stack)
To monitor the system locally, we provide a complete observability stack using Docker (Prometheus, Grafana, Jaeger, and OTel Collector).

**Prerequisites:** Docker & Docker Compose installed.

```bash
cd code/be
docker-compose up -d
```
- **Grafana UI**: [http://localhost:3000](http://localhost:3000) (Credentials: `admin` / `admin`)
- **Prometheus UI**: [http://localhost:9090](http://localhost:9090)
- **Jaeger Tracing UI**: [http://localhost:16686](http://localhost:16686)


### 3. Mobile (Frontend)
Follow these steps to run the mobile application on your local machine:


#### **Prerequisites**
- **Node.js** (LTS version recommended)
- **Expo Go** app installed on your physical device (iOS/Android)
- **Git** installed on your machine


#### **Environment Setup**
1. Create a `.env` file in the root directory: `code/fe/.env`
2. Configure the following environment variables (Contact the administrator for the actual keys):


```bash
# Backend API URL
API_URL=[https://api.tuan-minh-dev-soc.io.vn/api](https://api.tuan-minh-dev-soc.io.vn/api)

# Payment Integration
SEPAY_API_KEY=YOUR_SEPAY_API_KEY_HERE

# Firebase Configuration (Real-time Chat & Notifications)
EXPO_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
```


#### **Installation & Execution**
- Clone the repository
git clone [https://github.com/minh10m/School-Management-Mobile.git](https://github.com/minh10m/School-Management-Mobile.git)

- Navigate to the frontend directory
`cd School-Management-Mobile/code/fe`

- Install dependencies
`npm install`

- Start the Expo server
`npx expo start`


#### **How to View the App**
- Once the Metro Bundler starts, a QR Code will appear in your terminal.

- iOS: Open the default Camera app and scan the QR code.

- Android: Open the Expo Go app and select "Scan QR Code".

- Ensure your mobile device and computer are connected to the same Wi-Fi network (or use --tunnel if needed).


## 👥 Team & Roles
- Le Anh Tuan (Backend Developer) 
- Nguyen Xuan Nhat Minh (Frontend Developer)
