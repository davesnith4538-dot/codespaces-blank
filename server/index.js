import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { db, initializeDB } from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use('/uploads', express.static(uploadsDir));

// Initialize database
await initializeDB();

// ===== ROUTES =====

// Create/Register User
app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  const id = uuidv4();
  
  db.run(
    'INSERT INTO users (id, name, email) VALUES (?, ?, ?)',
    [id, name, email],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, name, email });
    }
  );
});

// Get User Profile
app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });
});

// Log Daily Pattern
app.post('/api/patterns', (req, res) => {
  const { userId, activityType, description, mood } = req.body;
  const id = uuidv4();
  
  db.run(
    'INSERT INTO patterns (id, userId, activityType, description, mood) VALUES (?, ?, ?, ?, ?)',
    [id, userId, activityType, description, mood],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, userId, activityType, description, mood });
    }
  );
});

// Get User Patterns
app.get('/api/patterns/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.all(
    'SELECT * FROM patterns WHERE userId = ? ORDER BY timestamp DESC LIMIT 100',
    [userId],
    (err, patterns) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(patterns);
    }
  );
});

// Save Memory
app.post('/api/memories', (req, res) => {
  const { userId, title, content, category } = req.body;
  const id = uuidv4();
  
  db.run(
    'INSERT INTO memories (id, userId, title, content, category) VALUES (?, ?, ?, ?, ?)',
    [id, userId, title, content, category],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, title, content, category });
    }
  );
});

// Get User Memories
app.get('/api/memories/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.all(
    'SELECT * FROM memories WHERE userId = ? ORDER BY timestamp DESC',
    [userId],
    (err, memories) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(memories);
    }
  );
});

// Add Personality Trait
app.post('/api/traits', (req, res) => {
  const { userId, trait, value } = req.body;
  const id = uuidv4();
  
  db.run(
    'INSERT INTO traits (id, userId, trait, value) VALUES (?, ?, ?, ?)',
    [id, userId, trait, value],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, trait, value });
    }
  );
});

// Get User Traits (for AI personality)
app.get('/api/traits/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.all(
    'SELECT trait, value FROM traits WHERE userId = ?',
    [userId],
    (err, traits) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(traits);
    }
  );
});

// AI Chat - respond based on user's personality & patterns
app.post('/api/chat', (req, res) => {
  const { userId, message } = req.body;
  
  // Get user traits to build personality
  db.all('SELECT trait, value FROM traits WHERE userId = ?', [userId], (err, traits) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Get recent memories for context
    db.all(
      'SELECT content FROM memories WHERE userId = ? ORDER BY timestamp DESC LIMIT 5',
      [userId],
      (err, memories) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Build personality context
        const personality = traits.map(t => `${t.trait}: ${t.value}`).join(', ');
        const memoryContext = memories.map(m => m.content).join('. ');
        
        // Simple AI response (in production, use OpenAI/Claude API)
        const responses = [
          `I remember that about me. ${memoryContext ? 'You know, ' + memoryContext.substring(0, 50) : ''}`,
          `That's interesting. I was always ${personality ? personality.split(',')[0] : 'thoughtful'}. What else do you remember?`,
          `Thanks for remembering me that way. I'd want you to know...`,
          `I would probably have said something like that. Do you have other memories to share?`,
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        res.json({ response, personality });
      }
    );
  });
});

// Mark user as deceased (switches to memorial mode)
app.put('/api/users/:id/deceased', (req, res) => {
  const { id } = req.params;
  
  db.run(
    'UPDATE users SET isDeceased = 1 WHERE id = ?',
    [id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Memorial activated' });
    }
  );
});

// ===== MEDIA ENDPOINTS =====

// Upload media (photo or voice)
app.post('/api/media', upload.single('file'), (req, res) => {
  const { userId, memoryId, type, caption } = req.body;
  
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  const id = uuidv4();
  const filepath = `/uploads/${req.file.filename}`;
  
  db.run(
    'INSERT INTO media (id, userId, memoryId, type, filename, filepath, caption) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, userId, memoryId || null, type, req.file.filename, filepath, caption],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, filepath, filename: req.file.filename });
    }
  );
});

// Get media for a memory
app.get('/api/media/:memoryId', (req, res) => {
  const { memoryId } = req.params;
  
  db.all(
    'SELECT * FROM media WHERE memoryId = ? ORDER BY timestamp DESC',
    [memoryId],
    (err, media) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(media || []);
    }
  );
});

// Get all media for a user
app.get('/api/media/user/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.all(
    'SELECT * FROM media WHERE userId = ? ORDER BY timestamp DESC LIMIT 50',
    [userId],
    (err, media) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(media || []);
    }
  );
});

// ===== FAMILY SHARING ENDPOINTS =====

// Add family member
app.post('/api/family', (req, res) => {
  const { userId, memberEmail, memberName } = req.body;
  const id = uuidv4();
  const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  db.run(
    'INSERT INTO family (id, userId, memberEmail, memberName, accessCode) VALUES (?, ?, ?, ?, ?)',
    [id, userId, memberEmail, memberName, accessCode],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, accessCode, message: `Share code: ${accessCode}` });
    }
  );
});

// Get family members
app.get('/api/family/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.all(
    'SELECT id, memberName, memberEmail, role, addedAt FROM family WHERE userId = ?',
    [userId],
    (err, family) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(family || []);
    }
  );
});

// Verify access with code
app.post('/api/verify-access', (req, res) => {
  const { accessCode } = req.body;
  
  db.get(
    'SELECT userId FROM family WHERE accessCode = ?',
    [accessCode],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(403).json({ error: 'Invalid access code' });
      res.json({ userId: row.userId, message: 'Access granted' });
    }
  );
});

// Serve memorial for family members
app.get('/api/memorial/:accessCode', (req, res) => {
  const { accessCode } = req.params;
  
  db.get(
    'SELECT u.id, u.name, u.isDeceased FROM family f JOIN users u ON f.userId = u.id WHERE f.accessCode = ?',
    [accessCode],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(403).json({ error: 'Invalid access code' });
      res.json(row);
    }
  );
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🕯️  Digital Legacy Server running on http://localhost:${PORT}`);
  console.log(`📱 Data Collection: http://localhost:${PORT}/collect`);
  console.log(`🪦  Digital Memorial: http://localhost:${PORT}/memorial`);
});
