# NaturApp

NaturApp es una aplicación móvil híbrida desarrollada con **React Native** y
**Expo** para la venta y distribución de productos naturales y orgánicos.
Incluye catálogo con búsqueda y filtros por categoría, carrito de compras
persistente, registro de pedidos contra un backend en la nube (Supabase) y
modo oscuro completo.

---

## ✨ Funcionalidades

- 🛒 **Carrito de compras**: agregar, quitar y cambiar cantidades de
  productos, con persistencia local (SQLite) y sincronizado en toda la app
  mediante un Context global.
- 📦 **Pedidos**: al hacer checkout, el pedido y sus productos se registran
  en Supabase (PostgreSQL) y aparecen de inmediato en el historial de la
  pestaña "Pedidos".
- 🔍 **Catálogo**: búsqueda por nombre y filtro por categoría
  (superfoods, aceites, cápsulas, infusiones, miel).
- 👤 **Perfil**: datos del usuario, preferencia de notificaciones y
  preferencia de tema, persistidos localmente.
- 🌗 **Modo oscuro**: tema claro/oscuro/automático (según el sistema),
  aplicado de forma consistente en toda la app mediante un `ThemeContext`.

---

## 🛠️ Arquitectura

### Frontend (móvil)
- **Framework**: React Native + Expo (v54.x).
- **Enrutamiento**: `expo-router`, basado en carpetas (`app/`).
- **Patrón**: MVVM —
  - `src/models`: entidades de dominio (`Product`, `CartItem`, `Order`).
  - `src/viewmodels`: hooks que conectan las pantallas con los servicios
    (`useProducts`, `useCart`, `useOrders`, `useProfile`).
  - `src/services`: acceso a datos (Supabase, SQLite, AsyncStorage).
  - `src/context`: estado global compartido entre pantallas
    (`CartContext`, `ThemeContext`).
- **Persistencia local**:
  - `expo-sqlite` para el carrito de compras (offline-first).
  - `@react-native-async-storage/async-storage` para preferencias,
    sesión y tema.

### Backend (datos y autenticación)
Soportado por **Supabase** (PostgreSQL + Auth como BaaS):
- `products`: inventario (nombre, precio, categoría, descripción, imagen,
  stock, rating).
- `orders`: pedidos (total, dirección, estado).
- `order_items`: detalle de productos por pedido (FK a `orders` y
  `products`).
- Autenticación de usuarios vía Supabase Auth.

> La clave usada en `src/services/supabaseClient.js` es la clave **anon**
> (pública) de Supabase, diseñada para usarse directamente desde el
> cliente; el acceso real a los datos se controla con políticas RLS en el
> proyecto de Supabase, no ocultando esta clave.

---

## 📂 Estructura del proyecto

```text
NaturApp/
├── app/                        # Rutas (Expo Router)
│   ├── (tabs)/
│   │   ├── _layout.js          # Tabs + theming + badge del carrito
│   │   ├── home.js             # Catálogo, búsqueda y filtros
│   │   ├── cart.js             # Carrito y checkout
│   │   ├── orders.js           # Historial de pedidos
│   │   └── profile.js          # Perfil y preferencias (tema, notif.)
│   ├── product/
│   │   └── [id].js             # Detalle de producto
│   └── _layout.js              # Root layout: ThemeProvider + CartProvider
├── src/
│   ├── components/
│   │   ├── ProductCard.js
│   │   ├── CategoryChip.js
│   │   └── CartItemRow.js
│   ├── context/
│   │   ├── ThemeContext.js     # Tema global (claro/oscuro/automático)
│   │   └── CartContext.js      # Carrito global (estado compartido)
│   ├── models/
│   │   ├── Product.js
│   │   ├── CartItem.js
│   │   └── Order.js
│   ├── viewmodels/
│   │   ├── useProducts.js
│   │   ├── useCart.js          # Re-exporta CartContext
│   │   ├── useOrders.js
│   │   └── useProfile.js
│   └── services/
│       ├── apiService.js       # Consultas a Supabase
│       ├── databaseService.js  # SQLite (carrito, favoritos)
│       ├── storageService.js   # AsyncStorage (perfil, tema, sesión)
│       └── supabaseClient.js   # Cliente de Supabase
├── app.json
└── package.json
```

---

## ⚡ Cómo ejecutarlo

### Prerrequisitos
- [Node.js](https://nodejs.org/) 18 o superior.
- La app **Expo Go** en tu celular (Android/iOS), o un emulador/simulador
  configurado.

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar el servidor de Expo
```bash
npx expo start
```

### 3. Abrir la app
Con el servidor corriendo:
- **Android**: escanea el QR con la app **Expo Go**.
- **iOS**: escanea el QR con la app de **Cámara**.
- **Emulador/simulador**: presiona `a` (Android) o `i` (iOS) en la
  terminal.
- **Web**: presiona `w`.

---

## 🐞 Problemas conocidos / notas

- Si ves un error de tipo `NativeDatabase.prepareAsync ... NullPointerException`
  al usar el carrito por primera vez después de instalar la app, cierra y
  vuelve a abrirla; suele deberse a un archivo de SQLite que quedó a medio
  crear en una ejecución anterior.
- Si el catálogo aparece vacío o el pedido no se registra, verifica que
  los nombres de columnas en tu proyecto de Supabase coincidan con los que
  usa `src/services/apiService.js` (`name`, `price`, `image`, `category`,
  `stock`, `rating`, `benefits` en `products`; `total`, `address`,
  `status` en `orders`).