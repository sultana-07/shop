const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const itemRoutes = require('./routes/itemRoutes');
const Item = require('./models/Item');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initial sample data seeder if database is empty
const initialSeedItems = [
  {
    bikeCompany: 'Hero',
    bikeModel: 'Splendor Plus',
    partName: 'Visor',
    category: 'Visor',
    colour: 'Black',
    quantity: 12,
    boxNumber: 'B01',
    purchasePrice: 450,
    displayPrice: '384 - 450',
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500&auto=format&fit=crop&q=60',
    createdAt: new Date().toISOString()
  },
  {
    bikeCompany: 'Honda',
    bikeModel: 'Activa 6G',
    partName: 'Headlight',
    category: 'Headlight',
    colour: 'Clear / Chrome',
    quantity: 8,
    boxNumber: 'B02',
    purchasePrice: 1200,
    displayPrice: '821 - 1200',
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=500&auto=format&fit=crop&q=60',
    createdAt: new Date().toISOString()
  },
  {
    bikeCompany: 'TVS',
    bikeModel: 'Apache RTR 160',
    partName: 'Side Panel',
    category: 'Side Panel',
    colour: 'Red',
    quantity: 3,
    boxNumber: 'Drawer-1',
    purchasePrice: 750,
    displayPrice: '519 - 750',
    imageUrl: 'https://images.unsplash.com/photo-1609630928812-d195d36c2510?w=500&auto=format&fit=crop&q=60',
    createdAt: new Date().toISOString()
  },
  {
    bikeCompany: 'Bajaj',
    bikeModel: 'Pulsar 150',
    partName: 'Engine Gasket Set',
    category: 'Engine Parts',
    colour: 'Black / Metallic',
    quantity: 15,
    boxNumber: 'B05',
    purchasePrice: 320,
    displayPrice: '942 - 320',
    imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=500&auto=format&fit=crop&q=60',
    createdAt: new Date().toISOString()
  },
  {
    bikeCompany: 'Yamaha',
    bikeModel: 'FZ-S V3',
    partName: 'Front Brake Pad',
    category: 'Brake Pad / Shoe',
    colour: 'Gold / Black',
    quantity: 2,
    boxNumber: 'Drawer-3',
    purchasePrice: 280,
    displayPrice: '713 - 280',
    imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=500&auto=format&fit=crop&q=60',
    createdAt: new Date().toISOString()
  },
  {
    bikeCompany: 'Hero',
    bikeModel: 'HF Deluxe',
    partName: 'M6 Flange Bolt Set',
    category: 'Bolt',
    colour: 'Silver',
    quantity: 45,
    boxNumber: 'B10',
    purchasePrice: 25,
    displayPrice: '624 - 25',
    imageUrl: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=500&auto=format&fit=crop&q=60',
    createdAt: new Date().toISOString()
  }
];

const seedDataIfNeeded = async (isMongo) => {
  try {
    if (isMongo) {
      const count = await Item.countDocuments();
      if (count === 0) {
        await Item.insertMany(initialSeedItems);
        console.log('Database seeded with initial sample inventory items.');
      }
    } else {
      const DATA_FILE = path.join(__dirname, 'data', 'items.json');
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      
      let items = [];
      if (fs.existsSync(DATA_FILE)) {
        try {
          items = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8') || '[]');
        } catch {
          items = [];
        }
      }
      if (items.length === 0) {
        const seeded = initialSeedItems.map((item, idx) => ({
          _id: 'seed_' + idx + '_' + Date.now(),
          ...item
        }));
        fs.writeFileSync(DATA_FILE, JSON.stringify(seeded, null, 2), 'utf-8');
        console.log('Local JSON storage seeded with sample inventory items.');
      }
    }
  } catch (err) {
    console.warn('Seeding warning:', err.message);
  }
};

// API Routes
app.use('/api/items', itemRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Root API Server route
app.get('/', (req, res, next) => {
  const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
  if (fs.existsSync(clientDistPath)) {
    return res.sendFile(path.join(clientDistPath, 'index.html'));
  }
  res.json({
    status: 'online',
    message: 'Bike Spare Parts Inventory Backend API is Live',
    endpoints: {
      health: '/api/health',
      items: '/api/items'
    }
  });
});

// Serve static React client build if present
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    }
  });
}

const PORT = process.env.PORT || 5000;

// Render Self-Ping Keep-Alive service (Active between 8:00 AM and 10:00 PM)
const startRenderKeepAlive = (port) => {
  const http = require('http');
  const https = require('https');
  const PING_INTERVAL_MS = 10 * 60 * 1000; // Ping every 10 minutes to prevent 15-min Render idle sleep

  console.log('Keep-Alive Service initialized (Active: 8 AM to 10 PM IST).');

  setInterval(() => {
    const renderUrl = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL || `http://localhost:${port}`;
    const healthUrl = `${renderUrl.replace(/\/$/, '')}/api/health`;

    const timeZone = process.env.TIMEZONE || 'Asia/Kolkata'; // Default to IST (+05:30)
    let currentHour;

    try {
      const dateStr = new Date().toLocaleString('en-US', { timeZone, hour: '2-digit', hour12: false });
      currentHour = parseInt(dateStr, 10);
    } catch {
      currentHour = new Date().getHours();
    }

    // Active window: 8 AM (8:00) to 10 PM (22:00)
    if (currentHour >= 8 && currentHour < 22) {
      const client = healthUrl.startsWith('https') ? https : http;

      client.get(healthUrl, (res) => {
        console.log(`[Keep-Alive Ping] (${new Date().toLocaleTimeString('en-US', { timeZone })}) Pinged ${healthUrl} [Status ${res.statusCode}] - Render active`);
      }).on('error', (err) => {
        console.warn(`[Keep-Alive Ping Error] ${err.message}`);
      });
    } else {
      console.log(`[Keep-Alive Sleeping] (${new Date().toLocaleTimeString('en-US', { timeZone })}) Hour ${currentHour}:00 is outside 8 AM - 10 PM window. Render allowed to sleep.`);
    }
  }, PING_INTERVAL_MS);
};

// Connect DB & Start Server
connectDB().then((isMongo) => {
  seedDataIfNeeded(isMongo);
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    startRenderKeepAlive(PORT);
  });
});
