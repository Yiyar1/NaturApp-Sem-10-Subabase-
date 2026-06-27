// Modelo que representa un producto natural del catálogo
// Equivale al 'Model' del patrón MVVM
export class Product {
    constructor({ id, name, description, price, image,
        category, stock, rating, benefits }) {
        this.id = id;
        this.name = name;             // Nombre del producto
        this.description = description; // Descripción detallada
        this.price = Number(price) || 0; // Precio en soles (PEN)
        this.image = image;           // URL de la imagen
        this.category = category;     // Categoría: 'superfoods', 'aceites', etc.
        this.stock = Number(stock) || 0; // Cantidad disponible
        this.rating = Number(rating) || 0; // Calificación promedio
        this.benefits = benefits || []; // Lista de beneficios
    }

    // Factory method: crea instancia desde JSON de la API.
    // Tolera nombres de columna alternativos por si la tabla
    // de Supabase usa snake_case distinto (image_url, stock_quantity)
    // en vez de los nombres exactos esperados, para que un
    // desajuste de esquema no rompa silenciosamente la UI.
    static fromJSON(json = {}) {
        return new Product({
            id: json.id,
            name: json.name,
            description: json.description,
            price: json.price,
            image: json.image ?? json.image_url ??
                json.imageUrl ?? json.photo ?? null,
            category: json.category,
            stock: json.stock ?? json.stock_quantity ??
                json.stockQuantity ?? 0,
            rating: json.rating ?? json.avg_rating ?? 0,
            benefits: Array.isArray(json.benefits)
                ? json.benefits
                : (typeof json.benefits === 'string' && json.benefits
                    ? json.benefits.split(',').map(b => b.trim())
                    : []),
        });
    }

    // Verifica si hay stock disponible
    isAvailable() {
        return this.stock > 0;
    }

    // Formato de precio para mostrar en la UI
    getFormattedPrice() {
        return `S/ ${this.price.toFixed(2)}`;
    }
}
