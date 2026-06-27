# Cambios realizados en NaturApp

## 1. Carrito de compras: ahora se sincroniza en toda la app

**Problema encontrado:** cada pantalla (`home.js`, `cart.js`, `product/[id].js`)
llamaba a `useCart()` por separado. Ese hook creaba un `useState` nuevo *por
cada pantalla*, así que aunque SQLite guardaba bien los datos, agregar un
producto desde Home no se reflejaba en la pestaña Carrito hasta volver a
entrar a ella.

**Solución:** se movió toda la lógica de `useCart` a un Context
(`src/context/CartContext.js`) que vive una sola vez en la raíz de la app
(`app/_layout.js`). Ahora todas las pantallas leen y escriben el mismo
estado, así que el carrito, el total y el contador (badge en la pestaña
"Carrito") se actualizan al instante sin importar desde dónde se agregue un
producto.

`src/viewmodels/useCart.js` se dejó como un simple re-export del Context, así
que no hubo que tocar los imports existentes en las pantallas.

## 2. Pedidos: ahora aparecen apenas se crean

**Problema encontrado:** `useOrders` cargaba el historial solo una vez,
dentro de un `useEffect(() => {...}, [])`. Como Expo Router mantiene las
pestañas montadas en memoria, si el usuario visitaba "Pedidos" y *después*
hacía un pedido nuevo desde el Carrito, al volver a la pestaña no lo veía
porque ese efecto ya no se volvía a ejecutar.

**Solución:** se cambió a `useFocusEffect` (de `@react-navigation/native`),
que recarga los pedidos cada vez que la pestaña vuelve a tener foco.

**Robustez adicional en `createOrder` (apiService.js):**
- Si falla la inserción de los productos del pedido (`order_items`) después
  de haber creado el pedido (`orders`), ahora se hace un rollback automático
  borrando ese pedido huérfano, en vez de dejar un "pedido fantasma" sin
  productos en el historial.
- Se valida que el pedido tenga al menos un producto antes de enviarlo.

## 3. Modo oscuro: implementado de punta a punta

**Problema encontrado:** ya existía un switch de "Tema Oscuro" en Perfil que
guardaba un valor en `AsyncStorage`, pero **ningún componente lo usaba** para
cambiar colores. Además, `app.json` tenía `"userInterfaceStyle": "light"`,
que fuerza el modo claro sin importar el sistema operativo del usuario.

**Solución:**
- Se creó `src/context/ThemeContext.js`: define una paleta de colores clara
  y otra oscura, detecta el modo del sistema operativo (`useColorScheme`) y
  permite forzar manualmente claro/oscuro/automático. Se persiste con
  `StorageService.setThemePreference` / `getThemePreference`.
- `useProfile` ahora conecta el switch existente con este Context global
  (antes el switch solo cambiaba un estado interno aislado).
- **Todas** las pantallas (`home`, `cart`, `orders`, `profile`,
  `product/[id]`) y componentes (`ProductCard`, `CategoryChip`,
  `CartItemRow`) se actualizaron para leer los colores desde `useTheme()`
  en vez de tener colores fijos (`#FFF`, `#F5F5F5`, etc.) escritos a mano.
- Los layouts (`app/_layout.js` y `app/(tabs)/_layout.js`) también
  cambian el color de la barra superior, las pestañas y el `StatusBar`
  según el tema activo.
- `app.json`: `userInterfaceStyle` se cambió de `"light"` a `"automatic"`
  para que la app pueda reaccionar al modo oscuro del sistema operativo.

## 4. Limpieza de archivos obsoletos

`App.js` e `index.js` (en la raíz) eran el placeholder por defecto que
genera Expo al crear el proyecto. No se usaban: el punto de entrada real es
`expo-router/entry`, declarado en `package.json`. Se eliminaron para evitar
confusión.

## 5. Modelos más robustos ante datos de Supabase/SQLite

- `Product.fromJSON`: ahora tolera nombres de columna alternativos
  (`image_url`/`imageUrl` además de `image`, `stock_quantity` además de
  `stock`, etc.) y convierte `price`, `stock` y `rating` a número de forma
  segura.
- `Order`: convierte `total` a número de forma segura (las columnas
  `numeric` de PostgreSQL a veces llegan como string vía la API).
- `CartItem`: mismo tratamiento defensivo con `price` y `quantity`.

Estos cambios evitan pantallas en blanco o crashes silenciosos
(`.toFixed is not a function`) si algún valor llega como texto o con un
nombre de columna levemente distinto al esperado.

## 6. Otros ajustes menores

- `keyExtractor` en las listas usa siempre `.toString()` para evitar
  advertencias si el `id` es numérico.
- Botones de "Agregar al carrito" / "Realizar Pedido" muestran un
  indicador de carga y se deshabilitan mientras se procesa la acción,
  para evitar pedidos duplicados por doble clic.
- `package.json`: se agregó `@react-navigation/native` como dependencia
  explícita (ya estaba instalada de forma transitiva por `expo-router`,
  pero ahora se importa directamente en `useOrders.js`).

---

## Nota importante sobre el backend (Supabase)

No tuve acceso a internet desde este entorno para conectarme a tu proyecto
real de Supabase y confirmar el esquema exacto de las tablas `products`,
`orders` y `order_items`. El código asume las columnas que sugiere tu propio
README (`name`, `price`, `image`, `category`, `stock`, etc. en `products`;
`total`, `address`, `status` en `orders`). Si al ejecutar la app ves que
**no aparecen productos** o que **el pedido no se guarda**, lo más probable
es que el nombre de alguna columna en tu tabla de Supabase no coincida
exactamente con el que espera `apiService.js`. Te dejé el modelo `Product`
preparado para tolerar las variantes más comunes, pero si tu tabla usa
nombres distintos, revisa `src/services/apiService.js` y ajusta los nombres
de columna en las consultas (`.select()`, `.eq()`, `.insert()`).

## Cómo probarlo

```bash
npm install
npx expo start
```

Luego presiona `a` (Android), `i` (iOS) o `w` (Web), o escanea el QR con
Expo Go.
