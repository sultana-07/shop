# 🏍️ Bike Spare Parts Inventory Web App

A clean, modern, mobile-friendly **MERN Stack** (MongoDB, Express.js, React.js, Node.js) inventory management web application designed specifically for bike repair shops to quickly find spare parts, track quantities, locate storage boxes, and protect purchase costs with secret display codes.

---

## ✨ Features

- 🔍 **Google-Style Instant Search**: Multi-term search across Bike Company, Bike Model, Part Name, Category, and Colour while typing (e.g. `Splendor black visor`, `Activa headlight`, `Hero red visor`, `Bolt`).
- 🔐 **Secret Price Encoding**: Purchase prices are never shown directly in the UI. When you enter a price (e.g. `500`), a 3-digit random prefix is generated (e.g. `#347500` or `#8211200`) to keep purchase costs secret from customers while keeping the actual price stored securely in the database.
- 📦 **Inventory Box Tracking**: Assign parts to physical boxes or drawers (`B01`, `B02`, `Drawer-1`) for instant retrieval in your shop.
- ⚡ **Quantity Management**: Add stock or use items with 1-click (`+ Add Qty`, `- Use Item`). Quantity is prevented from dropping below zero.
- 🚨 **Low Stock Alerts & Dashboard**: Live stats for total unique parts, total stock quantity, and items running low (< 5 units).
- ☁️ **Cloudinary Image Upload**: Upload part photos directly to Cloudinary with automatic local fallback support.
- 🔔 **Toast Feedback**: Real-time feedback messages when adding, editing, deleting, or adjusting part quantities.
- 📱 **Mobile-Friendly UI**: Built with Tailwind CSS and responsive design for phone, tablet, or desktop shop use.

---

## 📁 Project Structure

```
shop/
├── server/                    # Node.js + Express Backend
│   ├── config/                # MongoDB & Cloudinary configuration
│   ├── controllers/           # Item CRUD & Secret Price logic
│   ├── middleware/            # Multer upload handler
│   ├── models/                # Mongoose Item model
│   ├── routes/                # API Endpoints (/api/items)
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── client/                    # React + Vite + Tailwind CSS Frontend
    ├── src/
    │   ├── components/        # Navbar, DashboardStats, SearchBar, ItemCard, ItemFormModal, Toast
    │   ├── App.jsx            # Main App container & state
    │   ├── index.css          # Tailwind CSS styles
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB (Local instance or MongoDB Atlas URI)

### 1. Install Dependencies

In the root directory, run:

```bash
# Install root, server, and client dependencies
npm run install-all
```

Alternatively, install individually:

```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

---

### 2. Environment Configuration

Copy `.env.example` inside the `server/` directory to create `.env`:

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/bike-parts-inventory

# Optional Cloudinary credentials for cloud image uploads:
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> **Note**: If Cloudinary credentials are not set, the app gracefully falls back to local data buffer image handling so you can test immediately out-of-the-box.

---

### 3. Running the Application

Open two terminal windows:

**Terminal 1 (Backend Server):**
```bash
npm run server
```
*Server will start on `http://localhost:5000`.*

**Terminal 2 (Frontend Client):**
```bash
npm run client
```
*Client will start on `http://localhost:3000`.*

Open `http://localhost:3000` in your web browser.

---

## 🔑 Secret Price Display Formula

When creating or editing a spare part:
- You enter the **Actual Purchase Price** (e.g. `500`).
- The backend generates a **Display Price Code**:
  $$\text{Display Price Code} = \text{Random 3 Digits} + \text{Actual Price}$$
- Examples:
  - Price: `500` $\rightarrow$ Display Code: `347500`
  - Price: `1200` $\rightarrow$ Display Code: `8211200`
- Only the **Display Price Code** (`#347500`) is shown on cards and UI screens so shop mechanics can quickly decode it without revealing cost prices to walk-in customers.

---

## 🗄️ Database Schema (`items`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `bikeCompany` | String | Manufacturer (Hero, Honda, TVS, Bajaj, Yamaha, etc.) |
| `bikeModel` | String | Model name (e.g. Splendor Plus, Activa 6G) |
| `partName` | String | Part title (e.g. Visor, Headlight, Brake Pad) |
| `category` | String | Classification (Visor, Side Panel, Bolt, etc.) |
| `colour` | String | Part colour (e.g. Black, Red, Silver) |
| `quantity` | Number | Quantity in stock (min: 0) |
| `boxNumber` | String | Storage location code (e.g. B01, Drawer-1) |
| `purchasePrice`| Number | Actual purchase price stored in DB |
| `displayPrice` | String | Encoded secret price code displayed in UI |
| `imageUrl` | String | Cloudinary / Image URL |
| `createdAt` | Date | Record timestamp |

---

## 📝 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/items` | Fetch all items (supports `?q=query` multi-term search) |
| `GET` | `/api/items/:id` | Fetch single item by ID |
| `POST` | `/api/items` | Add new item with image upload |
| `PUT` | `/api/items/:id` | Update item details & price |
| `PATCH` | `/api/items/:id/quantity` | Update quantity (`{ action: "add" \| "use" }`) |
| `DELETE`| `/api/items/:id` | Delete item from inventory |

---

## 💡 Usage Tips

1. **Instant Search**: Type multiple terms separated by spaces into the search bar, such as `Hero Splendor visor` or `Black Activa`. The results update immediately.
2. **Reordering Low Stock**: Click the **Low Stock Alert** card in the dashboard to filter only parts with quantity below 5.
3. **Quick Stock Use**: Click **Use Item** on any part card whenever a mechanic takes a part for a repair job.
