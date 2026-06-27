import * as SQLite from 'expo-sqlite';

// ============================================
// PERSISTENCIA LOCAL ESTRUCTURADA - SQLite
// Base de datos relacional embebida
// Para carrito, favoritos, operaciones CRUD
// ============================================

let db = null;
let initialized = false;
// Promesa compartida de inicialización: evita que dos llamadas
// concurrentes a init() (p.ej. desde CartProvider y desde
// app/_layout.js al montar la app casi al mismo tiempo) abran
// la base de datos nativa dos veces en paralelo. Abrir el mismo
// archivo .db dos veces a la vez es justamente lo que provoca
// el NullPointerException nativo en
// "NativeDatabase.prepareAsync".
let initPromise = null;

const DatabaseService = {
    // --- INICIALIZAR base de datos ---
    async init() {
        if (initialized && db) return;

        // Si ya hay una inicialización en curso, espera a que
        // termine en vez de lanzar una nueva en paralelo.
        if (initPromise) {
            return initPromise;
        }

        initPromise = (async () => {
            try {
                const database = await SQLite.openDatabaseAsync(
                    'naturapp.db'
                );

                // Crear tabla del carrito de compras
                await database.execAsync(`
                    CREATE TABLE IF NOT EXISTS cart (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        product_id TEXT NOT NULL UNIQUE,
                        name TEXT NOT NULL,
                        price REAL NOT NULL,
                        image TEXT,
                        quantity INTEGER DEFAULT 1
                    );
                `);

                // Crear tabla de favoritos
                await database.execAsync(`
                    CREATE TABLE IF NOT EXISTS favorites (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        product_id TEXT NOT NULL UNIQUE,
                        name TEXT NOT NULL,
                        price REAL NOT NULL,
                        image TEXT,
                        added_date TEXT DEFAULT (datetime('now'))
                    );
                `);

                // Solo se publican db/initialized si TODO el
                // bloque anterior tuvo éxito.
                db = database;
                initialized = true;
                console.log('SQLite inicializada correctamente');
            } catch (error) {
                console.warn('Error inicializando SQLite:', error);
                db = null;
                initialized = false;
                // Se relanza para que _ensureDB() y quien llamó
                // a una operación CRUD se entere del fallo real,
                // en vez de continuar con una "db" inválida.
                throw error;
            } finally {
                initPromise = null;
            }
        })();

        return initPromise;
    },

    // Helper: asegurar que DB está lista antes de operar
    async _ensureDB() {
        if (!db || !initialized) {
            await this.init();
        }
        if (!db) {
            throw new Error(
                'No se pudo abrir la base de datos local. ' +
                'Cierra y vuelve a abrir la app e intenta de nuevo.'
            );
        }
    },

    // === OPERACIONES CRUD DEL CARRITO ===

    // CREATE: Agregar producto al carrito
    async addToCart(product) {
        await this._ensureDB();
        const result = await db.runAsync(
            `INSERT OR REPLACE INTO cart
       (product_id, name, price, image, quantity)
       VALUES (?, ?, ?, ?, 
         COALESCE(
           (SELECT quantity + 1 FROM cart
            WHERE product_id = ?), 1))`,
            [product.id, product.name,
            product.price, product.image, product.id]
        );
        return result.lastInsertRowId;
    },

    // READ: Obtener todos los items del carrito
    async getCartItems() {
        await this._ensureDB();
        const rows = await db.getAllAsync(
            'SELECT * FROM cart ORDER BY id DESC'
        );
        return rows;
    },

    // UPDATE: Cambiar cantidad de un item
    async updateCartQuantity(productId, quantity) {
        await this._ensureDB();
        if (quantity <= 0) {
            return this.removeFromCart(productId);
        }
        await db.runAsync(
            'UPDATE cart SET quantity = ? WHERE product_id = ?',
            [quantity, productId]
        );
    },

    // DELETE: Eliminar un item del carrito
    async removeFromCart(productId) {
        await this._ensureDB();
        await db.runAsync(
            'DELETE FROM cart WHERE product_id = ?',
            [productId]
        );
    },

    // READ: Obtener total del carrito
    async getCartTotal() {
        await this._ensureDB();
        const result = await db.getFirstAsync(
            'SELECT SUM(price * quantity) as total FROM cart'
        );
        return result?.total || 0;
    },

    // DELETE: Vaciar el carrito completo
    async clearCart() {
        await this._ensureDB();
        await db.runAsync('DELETE FROM cart');
    },

    // READ: Contar items en el carrito
    async getCartCount() {
        await this._ensureDB();
        const result = await db.getFirstAsync(
            'SELECT SUM(quantity) as count FROM cart'
        );
        return result?.count || 0;
    },

    // === OPERACIONES CRUD DE FAVORITOS ===

    async addFavorite(product) {
        await this._ensureDB();
        await db.runAsync(
            `INSERT OR IGNORE INTO favorites
       (product_id, name, price, image)
       VALUES (?, ?, ?, ?)`,
            [product.id, product.name,
            product.price, product.image]
        );
    },

    async removeFavorite(productId) {
        await this._ensureDB();
        await db.runAsync(
            'DELETE FROM favorites WHERE product_id = ?',
            [productId]
        );
    },

    async isFavorite(productId) {
        await this._ensureDB();
        const row = await db.getFirstAsync(
            'SELECT id FROM favorites WHERE product_id = ?',
            [productId]
        );
        return !!row;
    },

    async getFavorites() {
        await this._ensureDB();
        return await db.getAllAsync(
            'SELECT * FROM favorites ORDER BY added_date DESC'
        );
    },
};

export default DatabaseService;
