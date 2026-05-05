SmartBill – Invoice Creation System

🚀 A full-stack MERN application for creating, managing, and exporting professional invoices.

---

##  Overview

**SmartBill** is a modern invoice management system built using the MERN stack.
It allows freelancers, students, and small businesses to:

* Create professional invoices
* Export invoices as PDF
* Store and manage invoice history securely
* Access data from anywhere

Designed to be simple, fast, and completely free.

---

## 🛠 Tech Stack

* **Frontend:** React.js
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas
* **Authentication:** JWT + bcrypt
* **PDF Generation:** jsPDF / html2pdf.js
* **Styling:** Tailwind CSS / Bootstrap
* **Deployment:** Vercel (Frontend), Render (Backend)

---

## ✨ Features

*  User Authentication (Login/Register)
* Create, Edit, Delete Invoices
*  Dynamic Line Items (auto calculations)
* One-click PDF Export
*  Dashboard (Revenue, Invoice Stats)
*  Invoice History Management
*  Responsive Design (Mobile + Desktop)

---

## System Architecture

This project follows a **3-tier architecture**:

* **Frontend (React)** → UI & user interaction
* **Backend (Express)** → API & business logic
* **Database (MongoDB)** → Data storage

All protected routes use JWT authentication.

---

##  API Endpoints

### Auth

* `POST /api/auth/register` → Register user
* `POST /api/auth/login` → Login & get token

### Invoices

* `GET /api/invoices` → Get all invoices
* `POST /api/invoices` → Create invoice
* `GET /api/invoices/:id` → Get single invoice
* `PUT /api/invoices/:id` → Update invoice
* `DELETE /api/invoices/:id` → Delete invoice

### User

* `GET /api/users/profile`
* `PUT /api/users/profile`

---

##  Database Design

### User Schema

* name, email, password (hashed)
* company, logo
* createdAt

### Invoice Schema

* client details
* items (name, quantity, price)
* subtotal, tax, total
* status, dueDate
* createdAt

---

## Installation & Setup

```bash
# Clone repository
git clone https://github.com/your-username/Digital-Invoice-Creation-system

# Install dependencies
cd server
npm install

cd ../client
npm install

# Run project
npm run dev
```

---

##  Live Demo

👉 Coming Soon (Deployment in progress)

---

## Project Objective

* Build a **real-world MERN application**
* Provide a **free invoicing solution**
* Demonstrate **full-stack development skills**

---

## Future Enhancements

* Custom branding & logos
* Multi-currency support
* Email invoices to clients
* Analytics dashboard
* Mobile app (React Native)

---

##  Screenshots

add will be soon here.

---

## Learning Outcomes

* Full-stack MERN development
* REST API design
* MongoDB schema modeling
* JWT authentication
* PDF generation
* Deployment workflow

---

##  Author

**Atif Khalil**
MERN Stack Developer

---

⭐ If you like this project, consider giving it a star!
