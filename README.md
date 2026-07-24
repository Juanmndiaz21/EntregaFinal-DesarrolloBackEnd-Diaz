# Entrega Final - Backend

Proyecto de backend con Express, Handlebars, Socket.io y MongoDB.

## Requisitos

- Node.js
- MongoDB ejecutándose en `mongodb://127.0.0.1:27017/ecommerce`

## Instalación

```bash
npm install
```

## Ejecutar el proyecto

```bash
npm start
```

## Vistas principales

- `/` Home de bienvenida
- `/products` Listado de productos con paginación
- `/realtimeproducts` Gestión de productos en tiempo real
- `/carts/:cid` Vista de un carrito específico

## API principal

- `GET /api/products`
- `GET /api/products/:pid`
- `POST /api/products`
- `PUT /api/products/:pid`
- `DELETE /api/products/:pid`
- `POST /api/carts`
- `GET /api/carts/:cid`
- `POST /api/carts/:cid/product/:pid`
- `DELETE /api/carts/:cid/products/:pid`
- `PUT /api/carts/:cid`
- `PUT /api/carts/:cid/products/:pid`
- `DELETE /api/carts/:cid`

## Notas

- La vista home solo muestra la bienvenida y un botón para explorar productos.
- Los productos y carritos usan persistencia en MongoDB.
