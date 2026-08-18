import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db, { initDB } from './db.js';

const uuidv4 = () => crypto.randomUUID();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializar esquemas de la DB
initDB();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'colores-dayam-secret-key-change-in-prod-2026';

app.use(cors());
app.use(express.json());

// Middleware de autenticación JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso no autorizado: Token requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    req.user = user;
    next();
  });
};

// --- RUTAS DE AUTENTICACIÓN ---

// Registro de usuario
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña requeridos' });
    }

    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya se encuentra registrado.' });
    }

    const userId = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const passwordHash = bcrypt.hashSync(password, 10);
    const userName = name || email.split('@')[0];

    db.prepare(`
      INSERT INTO users (id, email, password_hash, name)
      VALUES (?, ?, ?, ?)
    `).run(userId, email.toLowerCase(), passwordHash, userName);

    const userPayload = { id: userId, email: email.toLowerCase(), name: userName };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      user: userPayload,
      token: token,
      message: 'Usuario registrado exitosamente'
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

// Inicio de sesión
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña requeridos' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(400).json({ error: 'Credenciales inválidas. Revisa tu correo y contraseña.' });
    }

    const userPayload = { id: user.id, email: user.email, name: user.name };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      user: userPayload,
      token: token,
      message: 'Inicio de sesión exitoso'
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

// Obtener usuario actual
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(444).json({ error: 'Usuario no encontrado' });
  }
  res.json({ user });
});

// --- RUTAS DE PALETAS DE COLOR ---

// Obtener paletas del usuario
app.get('/api/palettes', authenticateToken, (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM user_palettes WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    
    const formattedPalettes = rows.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      projectId: r.project_id,
      collectionId: r.collection_id,
      colors: JSON.parse(r.colors || '[]'),
      brandColor: r.brand_color,
      grayColor: r.gray_color,
      isGrayAuto: Boolean(r.is_gray_auto),
      lockedColors: JSON.parse(r.locked_colors || '[]'),
      mainColors: JSON.parse(r.main_colors || '[]'),
      styleTags: JSON.parse(r.style_tags || '[]'),
      isPublic: Boolean(r.is_public),
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    res.json({ data: formattedPalettes });
  } catch (error) {
    console.error('Error al consultar paletas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Guardar nueva paleta
app.post('/api/palettes', authenticateToken, (req, res) => {
  try {
    const {
      name, description, project_id, collection_id,
      colors, brand_color, gray_color, is_gray_auto,
      locked_colors, main_colors, style_tags, is_public
    } = req.body;

    const paletteId = 'pal_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

    const stmt = db.prepare(`
      INSERT INTO user_palettes (
        id, user_id, name, description, project_id, collection_id,
        colors, brand_color, gray_color, is_gray_auto,
        locked_colors, main_colors, style_tags, is_public, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    stmt.run(
      paletteId,
      req.user.id,
      name || 'Paleta sin título',
      description || '',
      project_id || null,
      collection_id || null,
      JSON.stringify(colors || []),
      brand_color || '#009fdb',
      gray_color || '#808080',
      is_gray_auto !== false ? 1 : 0,
      JSON.stringify(locked_colors || []),
      JSON.stringify(main_colors || []),
      JSON.stringify(style_tags || []),
      is_public ? 1 : 0
    );

    const inserted = db.prepare('SELECT * FROM user_palettes WHERE id = ?').get(paletteId);

    res.json({
      data: {
        id: inserted.id,
        name: inserted.name,
        description: inserted.description,
        project_id: inserted.project_id,
        collection_id: inserted.collection_id,
        colors: JSON.parse(inserted.colors || '[]'),
        brand_color: inserted.brand_color,
        gray_color: inserted.gray_color,
        is_gray_auto: Boolean(inserted.is_gray_auto),
        locked_colors: JSON.parse(inserted.locked_colors || '[]'),
        main_colors: JSON.parse(inserted.main_colors || '[]'),
        style_tags: JSON.parse(inserted.style_tags || '[]'),
        is_public: Boolean(inserted.is_public)
      }
    });
  } catch (error) {
    console.error('Error al insertar paleta:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar paleta
app.put('/api/palettes/:id', authenticateToken, (req, res) => {
  try {
    const paletteId = req.params.id;
    const existing = db.prepare('SELECT * FROM user_palettes WHERE id = ? AND user_id = ?').get(paletteId, req.user.id);
    
    if (!existing) {
      return res.status(404).json({ error: 'Paleta no encontrada' });
    }

    const {
      name, description, project_id, collection_id,
      colors, brand_color, gray_color, is_gray_auto,
      locked_colors, main_colors, style_tags, is_public
    } = req.body;

    const newName = name !== undefined ? name : existing.name;
    const newDesc = description !== undefined ? description : existing.description;
    const newProject = project_id !== undefined ? project_id : existing.project_id;
    const newCollection = collection_id !== undefined ? collection_id : existing.collection_id;
    const newColors = colors ? JSON.stringify(colors) : existing.colors;
    const newBrand = brand_color !== undefined ? brand_color : existing.brand_color;
    const newGray = gray_color !== undefined ? gray_color : existing.gray_color;
    const newIsGrayAuto = is_gray_auto !== undefined ? (is_gray_auto ? 1 : 0) : existing.is_gray_auto;
    const newLocked = locked_colors ? JSON.stringify(locked_colors) : existing.locked_colors;
    const newMain = main_colors ? JSON.stringify(main_colors) : existing.main_colors;
    const newStyle = style_tags ? JSON.stringify(style_tags) : existing.style_tags;
    const newPublic = is_public !== undefined ? (is_public ? 1 : 0) : existing.is_public;

    db.prepare(`
      UPDATE user_palettes
      SET name = ?, description = ?, project_id = ?, collection_id = ?,
          colors = ?, brand_color = ?, gray_color = ?, is_gray_auto = ?,
          locked_colors = ?, main_colors = ?, style_tags = ?, is_public = ?,
          updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `).run(
      newName, newDesc, newProject, newCollection,
      newColors, newBrand, newGray, newIsGrayAuto,
      newLocked, newMain, newStyle, newPublic,
      paletteId, req.user.id
    );

    const updated = db.prepare('SELECT * FROM user_palettes WHERE id = ?').get(paletteId);

    res.json({
      data: {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        project_id: updated.project_id,
        collection_id: updated.collection_id,
        colors: JSON.parse(updated.colors || '[]'),
        brand_color: updated.brand_color,
        gray_color: updated.gray_color,
        is_gray_auto: Boolean(updated.is_gray_auto),
        locked_colors: JSON.parse(updated.locked_colors || '[]'),
        main_colors: JSON.parse(updated.main_colors || '[]'),
        style_tags: JSON.parse(updated.style_tags || '[]'),
        is_public: Boolean(updated.is_public)
      }
    });
  } catch (error) {
    console.error('Error al actualizar paleta:', error);
    res.status(500).json({ error: error.message });
  }
});

// Borrar paleta
app.delete('/api/palettes/:id', authenticateToken, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM user_palettes WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Paleta no encontrada' });
    }
    res.json({ success: true, message: 'Paleta eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- RUTAS DE PROYECTOS ---
app.get('/api/projects', authenticateToken, (req, res) => {
  const rows = db.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json({ data: rows });
});

app.post('/api/projects', authenticateToken, (req, res) => {
  const { name } = req.body;
  const id = 'proj_' + Date.now().toString(36);
  db.prepare('INSERT INTO projects (id, user_id, name) VALUES (?, ?, ?)').run(id, req.user.id, name);
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  res.json({ data: row });
});

app.delete('/api/projects/:id', authenticateToken, (req, res) => {
  db.prepare('DELETE FROM projects WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

// --- RUTAS DE COLECCIONES ---
app.get('/api/collections', authenticateToken, (req, res) => {
  const rows = db.prepare('SELECT * FROM collections WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json({ data: rows });
});

app.post('/api/collections', authenticateToken, (req, res) => {
  const { name } = req.body;
  const id = 'col_' + Date.now().toString(36);
  db.prepare('INSERT INTO collections (id, user_id, name) VALUES (?, ?, ?)').run(id, req.user.id, name);
  const row = db.prepare('SELECT * FROM collections WHERE id = ?').get(id);
  res.json({ data: row });
});

app.delete('/api/collections/:id', authenticateToken, (req, res) => {
  db.prepare('DELETE FROM collections WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

// --- SERVICIO DE ARCHIVOS ESTÁTICOS Y FALLBACK SPA ---
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Servidor Colores Dayam ejecutándose. Ejecuta "npm run build" para servir el frontend estático.');
  });
}

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Servidor Colores Dayam listo en http://localhost:${PORT}`);
  console.log(`====================================================`);
});
