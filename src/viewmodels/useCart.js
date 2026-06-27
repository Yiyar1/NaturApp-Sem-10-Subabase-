// ============================================
// VIEWMODEL: Carrito de compras
//
// NOTA DE ARQUITECTURA:
// Este hook se reexporta desde CartContext para que el
// carrito sea un ÚNICO estado compartido por toda la app
// (Home, Carrito, Detalle de producto). Antes, cada pantalla
// llamaba useCart() y creaba su propio estado de React
// aislado: agregar un producto en Home no se reflejaba en la
// pestaña Carrito hasta volver a montarla. Con el Context,
// todas las pantallas leen/escriben la misma fuente de verdad.
// ============================================
export { useCart } from '../context/CartContext';
