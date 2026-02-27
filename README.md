# 🏭 IndustrialHub — TradeConnect/B2C Marketplace (MERN Stack)

A full-featured industrial marketplace platform with customer, supplier, and admin portals, AI-powered suggestions, real-time deal management, and complete profit & loss analytics.

---

## 📁 Project Structure

```
marketplace/
├── backend/          # Node.js + Express + MongoDB
│   ├── models/       # User, Product, Order, Deal
│   ├── routes/       # Auth, Products, Orders, Deals, Admin, Suggestions
│   ├── middleware/   # JWT Auth middleware
│   ├── server.js     # Main server entry
│   └── seed.js       # Demo data seeder
└── frontend/         # React.js
    └── src/
        ├── pages/
        │   ├── admin/      # Dashboard, Users, Orders, Deals, P&L
        │   ├── supplier/   # Dashboard, Products, Deals, Orders
        │   └── customer/   # Dashboard, Products, Cart, Orders, Suggestions
        ├── components/
        │   └── layout/     # Sidebar layout
        ├── context/        # Auth Context
        └── utils/          # Axios API instance
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)

### 1. Clone / Extract the project

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### 3. Seed Demo Data (Optional but recommended)

```bash
cd backend
node seed.js
```

This creates demo accounts:
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | demo1234 |
| Supplier | supplier@demo.com | demo1234 |
| Customer | customer@demo.com | demo1234 |

### 4. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on: **http://localhost:3000**  
Backend API runs on: **http://localhost:5000**

---

## 🎯 Key Features

### 👤 Customer Portal
- Register/Login with JWT auth
- Browse & filter products by category, price, rating
- Product detail with supplier info
- Add to cart & place orders with shipping address
- Track orders with real-time status timeline
- **AI-powered suggestions** based on search history & viewed products
- Open TradeConnect discovery
- Startup guide for onboarding

### 🏭 Supplier Portal
- Dashboard with revenue, orders, deal stats
- Full product CRUD (create, edit, delete)
- Mark products as "Defence Grade" (restricted)
- Create TradeConnect proposals with contract terms
- Track deal status: proposed → negotiating → agreed → in-progress → completed
- Manage and update order status
- Platform commission auto-calculated (1.5% on deals, 2% on orders)

### ⚡ Admin Portal
- Full platform dashboard with KPI cards
- Monthly revenue trend charts (Recharts)
- **Profit & Loss module** — gross revenue, platform fees, supplier payouts, net profit
- Month-by-month P&L table
- User management — enable/disable, verify suppliers
- Order management — update status, view full records
- Deal management — view all TradeConnects with platform earnings

### 🤖 Smart Suggestion Engine
- Category-based recommendations from viewed products
- Keyword-based suggestions from search history
- Trending/popular products
- Open deal matching for companies/startups
- Verified supplier directory

### 🗃️ Database (MongoDB)
- **Users**: Customers, Suppliers, Admins with role-based access
- **Products**: Full catalogue with stock, specs, images
- **Orders**: Complete order lifecycle with timeline tracking
- **Deals**: TradeConnect management with negotiation workflow
- All financial transactions saved with platform fee calculations

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/products | List products (filters) |
| GET | /api/products/:id | Product detail |
| POST | /api/orders | Place order |
| GET | /api/orders/my | Customer's orders |
| GET | /api/orders/supplier | Supplier's orders |
| POST | /api/deals | Create deal |
| GET | /api/deals | List deals |
| GET | /api/suggestions/products | AI recommendations |
| GET | /api/suggestions/deals | Deal suggestions |
| GET | /api/admin/dashboard | Admin stats |
| GET | /api/admin/profit-loss | P&L report |
| GET | /api/users/search | Search people |

---

## 💡 Business Logic Highlights

- **Platform Fee**: 2% on orders, 1.5% on TradeConnects (auto-calculated)
- **Stock Management**: Auto-deducted on order, prevents over-ordering
- **Search Tracking**: Each search is saved for better suggestions
- **View Tracking**: Viewed products improve category recommendations
- **Supplier Verification**: Admin can verify suppliers → builds trust
- **Deal Workflow**: proposed → negotiating → agreed → in-progress → completed
- **Order Timeline**: Every status change is logged with timestamp

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Recharts, React Toastify |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (JSON Web Tokens), bcryptjs |
| Styling | Custom CSS with CSS variables |
| Icons | React Icons (Feather) |
