import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db, { initDB, userDB } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializar esquemas de la DB
initDB();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'colores-dayam-secret-key-change-in-prod-2026';

app.use(cors());
app.use(express.json());

// Desactivar almacenamiento en caché para index.html y assets
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});


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

// Generador de código aleatorio de 6 dígitos
const generate6DigitCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// --- RUTAS DE AUTENTICACIÓN PROFESIONAL ---

// 1. Registro de usuario con generación de código de confirmación de 6 dígitos
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Nombre completo, correo electrónico y contraseña son requeridos.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const existingUser = userDB.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'El correo electrónico ya se encuentra registrado.' });
    }

    const userId = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const passwordHash = bcrypt.hashSync(password, 10);
    const verificationCode = generate6DigitCode();

    userDB.create({
      id: userId,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      name: name.trim(),
      is_verified: 0,
      verification_code: verificationCode
    });

    res.json({
      message: `Código de confirmación generado para ${email}.`,
      email: email.toLowerCase(),
      code: verificationCode // Para facilitar pruebas y confirmación sin servidor SMTP externo
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

// 2. Verificación de código de confirmación de 6 dígitos
app.post('/api/auth/verify-code', (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Correo y código de 6 dígitos requeridos.' });
    }

    const user = userDB.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    if (user.verification_code !== code.trim()) {
      return res.status(400).json({ error: 'El código de confirmación de 6 dígitos es incorrecto.' });
    }

    // Activar usuario
    userDB.update(user.id, {
      is_verified: 1,
      verification_code: null
    });

    const userPayload = { id: user.id, email: user.email, name: user.name };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      user: userPayload,
      token: token,
      message: '¡Cuenta confirmada y activada con éxito!'
    });
  } catch (error) {
    console.error('Error en verificación:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

// 3. Inicio de sesión
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña requeridos.' });
    }

    const user = userDB.findByEmail(email);
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

// 4. Solicitar recuperación de contraseña (Forgot Password)
app.post('/api/auth/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Correo electrónico requerido.' });
    }

    const user = userDB.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'No existe ninguna cuenta asociada a este correo electrónico.' });
    }

    const resetCode = generate6DigitCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // Expira en 15 minutos

    userDB.update(user.id, {
      reset_code: resetCode,
      reset_expires: expiresAt
    });

    res.json({
      message: `Código de recuperación generado para ${email}.`,
      email: email.toLowerCase(),
      code: resetCode // Para pruebas locales
    });
  } catch (error) {
    console.error('Error en forgot-password:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. Restablecer contraseña con código (Reset Password)
app.post('/api/auth/reset-password', (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    const user = userDB.findByEmail(email);
    if (!user || user.reset_code !== code.trim()) {
      return res.status(400).json({ error: 'El código de restablecimiento es incorrecto.' });
    }

    if (user.reset_expires && new Date() > new Date(user.reset_expires)) {
      return res.status(400).json({ error: 'El código de restablecimiento ha expirado. Solicita uno nuevo.' });
    }

    const passwordHash = bcrypt.hashSync(newPassword, 10);
    userDB.update(user.id, {
      password_hash: passwordHash,
      reset_code: null,
      reset_expires: null
    });

    res.json({ message: '¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.' });
  } catch (error) {
    console.error('Error en reset-password:', error);
    res.status(500).json({ error: error.message });
  }
});

// 6. Obtener usuario actual
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = userDB.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at
    }
  });
});

// 7. Actualizar nombre de perfil
app.put('/api/auth/profile', authenticateToken, (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre completo es requerido.' });
    }

    const updated = userDB.update(req.user.id, { name: name.trim() });
    res.json({
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        created_at: updated.created_at
      },
      message: '¡Perfil actualizado correctamente!'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Cambiar contraseña desde sesión activa
app.put('/api/auth/change-password', authenticateToken, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'La contraseña actual y la nueva contraseña son requeridas.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    const user = userDB.findById(req.user.id);
    if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) {
      return res.status(400).json({ error: 'La contraseña actual es incorrecta.' });
    }

    const passwordHash = bcrypt.hashSync(newPassword, 10);
    userDB.update(req.user.id, { password_hash: passwordHash });

    res.json({ message: '¡Contraseña modificada con éxito!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- RUTAS DE PALETAS DE COLOR ---
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

app.post('/api/palettes', authenticateToken, (req, res) => {
  try {
    const {
      name, description, project_id, collection_id,
      colors, brand_color, gray_color, is_gray_auto,
      locked_colors, main_colors, style_tags, is_public
    } = req.body;

    const paletteId = 'pal_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

    db.prepare(`
      INSERT INTO user_palettes (
        id, user_id, name, description, project_id, collection_id,
        colors, brand_color, gray_color, is_gray_auto,
        locked_colors, main_colors, style_tags, is_public, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(
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

    db.prepare(`
      UPDATE user_palettes
      SET name = ?, description = ?, project_id = ?, collection_id = ?,
          colors = ?, brand_color = ?, gray_color = ?, is_gray_auto = ?,
          locked_colors = ?, main_colors = ?, style_tags = ?, is_public = ?,
          updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `).run(
      name !== undefined ? name : existing.name,
      description !== undefined ? description : existing.description,
      project_id !== undefined ? project_id : existing.project_id,
      collection_id !== undefined ? collection_id : existing.collection_id,
      colors ? JSON.stringify(colors) : existing.colors,
      brand_color !== undefined ? brand_color : existing.brand_color,
      gray_color !== undefined ? gray_color : existing.gray_color,
      is_gray_auto !== undefined ? (is_gray_auto ? 1 : 0) : existing.is_gray_auto,
      locked_colors ? JSON.stringify(locked_colors) : existing.locked_colors,
      main_colors ? JSON.stringify(main_colors) : existing.main_colors,
      style_tags ? JSON.stringify(style_tags) : existing.style_tags,
      is_public !== undefined ? (is_public ? 1 : 0) : existing.is_public,
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

// --- SERVICIO ESTÁTICO DE FRONTEND ---
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Servidor Colores Dayam listo.');
  });
}

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Servidor Colores Dayam listo en http://localhost:${PORT}`);
  console.log(`====================================================`);
});
