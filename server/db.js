import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = process.env.DATA_DIR || path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbFilePath = process.env.DATABASE_PATH || path.join(dataDir, 'db.json');
console.log(`[DB] Usando base de datos en: ${dbFilePath}`);

const defaultData = {
  users: [],
  user_palettes: [],
  projects: [],
  collections: [],
  tags: [],
  palette_tags: []
};

let store = { ...defaultData };

function loadStore() {
  try {
    if (fs.existsSync(dbFilePath)) {
      const raw = fs.readFileSync(dbFilePath, 'utf8');
      store = { ...defaultData, ...JSON.parse(raw) };
    } else {
      saveStore();
    }
  } catch (e) {
    console.error('[DB] Error cargando db.json:', e);
    store = { ...defaultData };
    saveStore();
  }
}

export function saveStore() {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) {
    console.error('[DB] Error guardando db.json:', e);
  }
}

export function initDB() {
  loadStore();
  console.log('[DB] Base de datos local inicializada con éxito.');
}

// Métodos directos para gestión de usuarios
export const userDB = {
  findByEmail(email) {
    loadStore();
    if (!email) return null;
    return store.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  findById(id) {
    loadStore();
    if (!id) return null;
    return store.users.find(u => u.id === id) || null;
  },

  create(userObj) {
    loadStore();
    const newUser = {
      id: userObj.id,
      email: userObj.email.toLowerCase(),
      password_hash: userObj.password_hash,
      name: userObj.name || userObj.email.split('@')[0],
      is_verified: userObj.is_verified || 0,
      verification_code: userObj.verification_code || null,
      reset_code: null,
      reset_expires: null,
      created_at: new Date().toISOString()
    };
    store.users.push(newUser);
    saveStore();
    return newUser;
  },

  update(id, updates) {
    loadStore();
    const index = store.users.findIndex(u => u.id === id);
    if (index !== -1) {
      store.users[index] = { ...store.users[index], ...updates };
      saveStore();
      return store.users[index];
    }
    return null;
  }
};

// Adaptador de compatibilidad SQL simulado
class PreparedQuery {
  constructor(sql) {
    this.sql = sql;
  }

  get(...params) {
    loadStore();
    const sql = this.sql.trim();

    if (sql.includes('FROM users WHERE email =')) {
      const email = params[0];
      return userDB.findByEmail(email);
    }

    if (sql.includes('FROM users WHERE id =')) {
      const id = params[0];
      return userDB.findById(id);
    }

    if (sql.includes('FROM user_palettes WHERE id =')) {
      const id = params[0];
      const p = store.user_palettes.find(item => item.id === id);
      return p ? { ...p } : null;
    }

    if (sql.includes('FROM projects WHERE id =')) {
      const id = params[0];
      const p = store.projects.find(item => item.id === id);
      return p ? { ...p } : null;
    }

    if (sql.includes('FROM collections WHERE id =')) {
      const id = params[0];
      const c = store.collections.find(item => item.id === id);
      return c ? { ...c } : null;
    }

    return null;
  }

  all(...params) {
    loadStore();
    const sql = this.sql.trim();

    if (sql.includes('FROM user_palettes WHERE user_id =')) {
      const userId = params[0];
      return store.user_palettes
        .filter(p => p.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    if (sql.includes('FROM projects WHERE user_id =')) {
      const userId = params[0];
      return store.projects
        .filter(p => p.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    if (sql.includes('FROM collections WHERE user_id =')) {
      const userId = params[0];
      return store.collections
        .filter(c => c.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return [];
  }

  run(...params) {
    loadStore();
    const sql = this.sql.trim();
    let changes = 0;

    if (sql.includes('INSERT INTO users')) {
      const [id, email, password_hash, name] = params;
      userDB.create({ id, email, password_hash, name, is_verified: 1 });
      changes = 1;
    }

    else if (sql.includes('INSERT INTO user_palettes')) {
      const [
        id, user_id, name, description, project_id, collection_id,
        colors, brand_color, gray_color, is_gray_auto,
        locked_colors, main_colors, style_tags, is_public
      ] = params;

      const now = new Date().toISOString();
      const newPalette = {
        id, user_id, name, description, project_id, collection_id,
        colors, brand_color, gray_color, is_gray_auto,
        locked_colors, main_colors, style_tags, is_public,
        created_at: now, updated_at: now
      };

      store.user_palettes.push(newPalette);
      changes = 1;
      saveStore();
    }

    else if (sql.includes('UPDATE user_palettes')) {
      if (sql.includes('SET is_public = true') || sql.includes('is_public = 1')) {
        const id = params[0];
        const p = store.user_palettes.find(item => item.id === id);
        if (p) {
          p.is_public = 1;
          p.updated_at = new Date().toISOString();
          changes = 1;
          saveStore();
        }
      } else {
        const [
          name, description, project_id, collection_id,
          colors, brand_color, gray_color, is_gray_auto,
          locked_colors, main_colors, style_tags, is_public,
          id, user_id
        ] = params;

        const index = store.user_palettes.findIndex(item => item.id === id && item.user_id === user_id);
        if (index !== -1) {
          store.user_palettes[index] = {
            ...store.user_palettes[index],
            name, description, project_id, collection_id,
            colors, brand_color, gray_color, is_gray_auto,
            locked_colors, main_colors, style_tags, is_public,
            updated_at: new Date().toISOString()
          };
          changes = 1;
          saveStore();
        }
      }
    }

    else if (sql.includes('DELETE FROM user_palettes')) {
      const [id, user_id] = params;
      const initialCount = store.user_palettes.length;
      store.user_palettes = store.user_palettes.filter(item => !(item.id === id && item.user_id === user_id));
      changes = initialCount - store.user_palettes.length;
      if (changes > 0) saveStore();
    }

    else if (sql.includes('INSERT INTO projects')) {
      const [id, user_id, name] = params;
      store.projects.push({ id, user_id, name, created_at: new Date().toISOString() });
      changes = 1;
      saveStore();
    }

    else if (sql.includes('DELETE FROM projects')) {
      const [id, user_id] = params;
      const initialCount = store.projects.length;
      store.projects = store.projects.filter(item => !(item.id === id && item.user_id === user_id));
      changes = initialCount - store.projects.length;
      if (changes > 0) saveStore();
    }

    else if (sql.includes('INSERT INTO collections')) {
      const [id, user_id, name] = params;
      store.collections.push({ id, user_id, name, created_at: new Date().toISOString() });
      changes = 1;
      saveStore();
    }

    else if (sql.includes('DELETE FROM collections')) {
      const [id, user_id] = params;
      const initialCount = store.collections.length;
      store.collections = store.collections.filter(item => !(item.id === id && item.user_id === user_id));
      changes = initialCount - store.collections.length;
      if (changes > 0) saveStore();
    }

    return { changes };
  }
}

const db = {
  prepare(sql) {
    return new PreparedQuery(sql);
  }
};

export default db;
