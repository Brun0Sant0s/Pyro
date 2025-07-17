const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// DB connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Middleware de autenticação
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function authorizeRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) return res.sendStatus(403);
    next();
  };
}

// Multer (uploads)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Serve ficheiros da pasta uploads
app.use('/uploads', express.static(uploadDir));

// --- LOGIN ---
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(401).send('User not found');

    const user = results[0];
    if (String(password).trim() !== String(user.password).trim()) {
      return res.status(401).send('Password incorrect');
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, role: user.role });
  });
});

// --- PRODUCTS ---
app.get('/products', authenticateToken, (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.post('/products', authenticateToken, authorizeRole('boss'), (req, res) => {
  const { name, quantity, storage_location, type } = req.body;
  if (!name || quantity == null) return res.status(400).send('Nome e quantidade são obrigatórios');

  db.query(
    'INSERT INTO products (name, quantity, storage_location, type) VALUES (?, ?, ?, ?)',
    [name, quantity, storage_location || null, type || null],
    err => {
      if (err) return res.status(500).send('Erro ao adicionar produto');
      res.sendStatus(201);
    }
  );
});

app.put('/products/:id', authenticateToken, authorizeRole('boss'), (req, res) => {
  const { quantity } = req.body;
  db.query('UPDATE products SET quantity = ? WHERE id = ?', [quantity, req.params.id], err => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});

app.delete('/products/:id', authenticateToken, authorizeRole('boss'), (req, res) => {
  db.query('DELETE FROM products WHERE id = ?', [req.params.id], err => {
    if (err) return res.status(500).send(err);
    res.sendStatus(204);
  });
});

// --- INVENTORY ---
app.get('/inventory', authenticateToken, (req, res) => {
  db.query('SELECT * FROM inventory', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.post('/inventory', authenticateToken, authorizeRole('boss'), (req, res) => {
  const { name, type, local } = req.body;
  db.query('INSERT INTO inventory (name, type, local) VALUES (?, ?, ?)', [name, type, local], err => {
    if (err) return res.status(500).send(err);
    res.sendStatus(201);
  });
});

app.put('/inventory/:id', authenticateToken, (req, res) => {
  const { local, observation } = req.body; 
  db.query(
    'UPDATE inventory SET local = ?, observation = ? WHERE id = ?',
    [local, observation, req.params.id],
    err => {
      if (err) return res.status(500).send(err);
      res.sendStatus(200);
    }
  );
});

app.delete('/inventory/:id', authenticateToken, authorizeRole('boss'), (req, res) => {
  db.query('DELETE FROM inventory WHERE id = ?', [req.params.id], err => {
    if (err) return res.status(500).send(err);
    res.sendStatus(204);
  });
});

// --- DOCUMENTOS ---
app.post('/documents', authenticateToken, authorizeRole('boss'), upload.single('document'), (req, res) => {
  if (!req.file) return res.status(400).send('Nenhum ficheiro carregado');

  const { filename, originalname } = req.file;
  const { observation } = req.body;

  db.query(
    'INSERT INTO documents (filename, originalname, observation) VALUES (?, ?, ?)',
    [filename, originalname, observation || null],
    err => {
      if (err) {
        console.error('Erro ao guardar documento:', err);
        return res.status(500).send('Erro ao guardar');
      }
      res.sendStatus(201);
    }
  );
});

app.get('/documents', authenticateToken, (req, res) => {
  db.query(
    'SELECT filename, originalname, observation FROM documents ORDER BY uploaded_at DESC',
    (err, results) => {
      if (err) return res.status(500).send('Erro ao buscar documentos');
      res.json(results);
    }
  );
});

app.delete('/documents/:filename', authenticateToken, authorizeRole('boss'), (req, res) => {
  const filename = req.params.filename;
  db.query('DELETE FROM documents WHERE filename = ?', [filename], err => {
    if (err) return res.status(500).send('Erro ao eliminar do BD');
    fs.unlink(path.join(uploadDir, filename), err => {
      if (err) return res.status(500).send('Erro ao eliminar ficheiro');
      res.sendStatus(200);
    });
  });
});

// GET tipos de produto
app.get('/product-types', authenticateToken, (req, res) => {
  db.query('SELECT name FROM product_types', (err, results) => {
    if (err) return res.status(500).send('Erro ao obter tipos');
    res.json(results.map(r => r.name));
  });
});

// GET locais de armazenamento
app.get('/storage-locations', authenticateToken, (req, res) => {
  db.query('SELECT name FROM storage_locations', (err, results) => {
    if (err) return res.status(500).send('Erro ao obter locais');
    res.json(results.map(r => r.name));
  });
});

// --- START ---
app.listen(3001, () => console.log('🚀 Server running on port 3001'));
