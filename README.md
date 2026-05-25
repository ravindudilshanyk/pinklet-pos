# 🎀 Pinklet POS System

## A modern offline Point-of-Sale system

Built for small retail businesses in Sri Lanka 🇱🇰

[🎬 Demo Video](#-demo-video) • [✨ Features](#-features) • [🛠 Tech Stack](#-tech-stack) • [🚀 Getting Started](#-getting-started) • [🏗 Architecture](#-architecture)

---

# 🎬 Demo Video

👉 https://youtu.be/9OQDSeCV_Wo?si=W1FTDNghLtTYC-VY

---

# ⚡ Highlights

* 📴 Fully Offline Desktop POS System
* ⚡ Fast billing workflow
* 📦 Real-time inventory management
* 🎯 Loyalty rewards system
* 📲 WhatsApp receipt sharing
* 📊 Business analytics dashboard
* 👥 Owner & Cashier role system
* 🧾 80mm thermal receipt support
* 💾 Automatic database backup system

---

# 🧩 What is Pinklet POS?

Pinklet POS is a production-ready desktop Point-of-Sale application designed specifically for small specialty retail businesses in Sri Lanka - cake shops, flower boutiques, gift stores, and similar businesses.

Most POS systems used by small businesses are:

* Expensive
* Internet dependent
* Difficult to use
* Built with outdated interfaces

Pinklet POS solves this with a clean, modern, offline-first experience built for real business workflows.

This system was fully designed and developed as a solo full-stack engineering project using Electron, React, Node.js, Prisma, and SQLite.

---

# 💡 Why Pinklet POS?

Many small businesses in Sri Lanka still rely on:

* Manual billing books
* Excel sheets
* Traditional table-heavy POS systems
* Expensive cloud software

These systems are often:
❌ Slow
❌ Confusing
❌ Hard to maintain
❌ Internet dependent

Pinklet POS was built with one simple goal:

👉 Make billing and shop management fast, modern, and easy for everyone.

---

# ✨ Features

## 🧾 Smart Billing Engine

* Quick Sale billing mode
* Pre-order billing support
* Multi-layer discount system
* Loyalty coin redemption
* Cash change calculator
* Hold and resume bills
* Market price comparison
* Fast cashier workflow

---

## 📦 Inventory Management

* Real-time stock tracking
* Low stock alerts
* Waste and damage logging
* Supplier management
* Barcode scanner support
* Stock movement history

---

## 📋 Pre-Order Management

* Deposit tracking
* Delivery scheduling
* Order status workflow
* Balance payment support
* Urgency indicators

---

## 👥 Customer Management

* Customer profiles
* Loyalty reward system
* Purchase history tracking
* Birthday reminders
* WhatsApp integrations

---

## 📊 Business Analytics

* Revenue dashboard
* Profit analytics
* Sales trend charts
* Cashier performance tracking
* Category revenue analysis
* Exportable reports

---

## 🔔 Smart Notifications

* Low stock alerts
* Upcoming pre-order reminders
* Customer birthday notifications
* Auto-refreshing updates

---

## 🖨 Receipt Generation

* 80mm thermal receipt PDF
* WhatsApp receipt sharing
* Itemized pricing breakdown
* Customizable receipt layout

---

## 🔐 Authentication & Security

* JWT Authentication
* Email OTP verification
* Role-based access control
* Session persistence
* Password recovery flow

---

## 💾 Backup & Restore

* Automatic database backup
* Manual backup support
* Restore from backup
* Safety restore checkpoints

---

# 🛠 Tech Stack

| Layer               | Technology            |
| ------------------- | --------------------- |
| 🖥 Desktop App      | Electron              |
| ⚛ Frontend          | React 18 + TypeScript |
| ⚡ Build Tool        | Vite                  |
| 🎨 Styling          | Tailwind CSS          |
| 🗃 State Management | Zustand               |
| 🔄 Server State     | TanStack Query        |
| 🛣 Backend          | Node.js + Express     |
| 🗄 Database         | SQLite                |
| 🔷 ORM              | Prisma                |
| 🔑 Authentication   | JWT + bcrypt          |
| 📧 Email Service    | Nodemailer            |
| 📄 PDF Generation   | jsPDF                 |
| 📦 Monorepo         | pnpm workspaces       |

---

# 📁 Project Structure

```bash
pinklet-pos/
├── electron/        # Electron desktop shell
├── renderer/        # React frontend
├── server/          # Express backend
├── shared/          # Shared TypeScript types
└── pnpm-workspace.yaml
```

---

# 🗄 Database Models

The system includes 12 interconnected database models:

* User
* Supplier
* Category
* Item
* Customer
* Bill
* BillLine
* StockMovement
* DiscountPreset
* LoyaltyTransaction
* HeldBill
* WasteLog

---

# 🚀 Getting Started

## Prerequisites

```bash
Node.js 18+
pnpm 8+
```

---

## Installation

```bash
# Clone repository
git clone https://github.com/ravindudilshanyk/pinklet-pos

# Enter project
cd pinklet-pos

# Install dependencies
pnpm install
```

---

# ⚙ Environment Variables

Create:

```bash
server/.env
```

Add:

```env
DATABASE_URL="file:./prisma/pinklet.db"

JWT_SECRET="your-secret-key"

PORT=3001

EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Pinklet POS <your.email@gmail.com>
```

---

# 🗄 Database Setup

```bash
cd server

# Run migrations
npx prisma migrate dev

# Seed database
pnpm seed
```

---

# 💻 Running Development Environment

Open 3 terminals:

## Terminal 1 — Backend

```bash
cd server
pnpm dev
```

---

## Terminal 2 — Frontend

```bash
cd renderer
pnpm dev
```

---

## Terminal 3 — Electron App

```bash
cd electron
pnpm build
npx electron dist/main.js
```

---

# 🔑 Demo Accounts

| Role       | Email                                       | Password   |
| ---------- | ------------------------------------------- | ---------- |
| 👑 Owner   | [owner@pinklet.lk](mailto:owner@pinklet.lk) | owner123   |
| 👤 Cashier | [amaya@pinklet.lk](mailto:amaya@pinklet.lk) | cashier123 |
| 👤 Cashier | [sahan@pinklet.lk](mailto:sahan@pinklet.lk) | cashier123 |

---

# 🏗 Architecture

```text
Electron Shell
      ↓
React Renderer
      ↓
Express API Server
      ↓
Prisma ORM
      ↓
SQLite Database
```

---

# 🧠 Key Engineering Challenges Solved

## 🧮 Multi-layer Discount Engine

Supports multiple discount calculations simultaneously with accurate pricing logic.

## 📋 Pre-order Lifecycle Management

Handles full order workflows from deposit collection to delivery tracking.

## 📄 Dynamic Thermal Receipt Generation

80mm PDF receipts generated dynamically with content-based sizing.

## 🔐 Multi-role Authentication System

Secure JWT authentication with role-based access and OTP verification.

## 📴 Offline-first Architecture

Entire system works without internet connectivity.

---

# 🗺 Roadmap

* [x] Billing system
* [x] Inventory management
* [x] Loyalty rewards
* [x] Analytics dashboard
* [x] Offline desktop app
* [x] Receipt generation
* [x] Backup & restore system
* [ ] PayHere payment integration
* [ ] Windows installer (.exe)
* [ ] Multi-branch support
* [ ] Mobile companion app

---

# 👨‍💻 Author

## Ravindu Dilshan

Computer Science Undergraduate at Uva Wellassa University
Full-Stack Developer

🔗 LinkedIn:  [Ravindu Dilshan Karunathilaka | LinkedIn](https://www.linkedin.com/in/ravindudilshany/)  
🐙 GitHub: [Ravindu Dilshan Karunathilaka | GitHub](https://github.com/ravindudilshanyk/)
📧 Email: [karunathilakad39@gmail.com](mailto:karunathilakad39@gmail.com)

---

# 📄 License

MIT License

Copyright (c) 2025 Ravindu Dilshan

---

⭐ If you found this project interesting, consider giving it a star.

Built with ❤️ in Sri Lanka 🇱🇰
