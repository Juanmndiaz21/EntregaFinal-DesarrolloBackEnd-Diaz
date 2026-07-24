# Proyecto Desarrollo Backend - Entrega N.º 2

Este proyecto corresponde a la segunda pre-entrega del curso de Desarrollo Backend. Se ha migrado la estructura inicial basada en endpoints puramente de API hacia una arquitectura visual utilizando el motor de plantillas **Handlebars** y comunicación bidireccional en tiempo real mediante **WebSockets (Socket.io)**.

---

## Funcionalidades Implementadas

1. **Motor de Plantillas Handlebars:** Configurado en el servidor para renderizar vistas dinámicas del lado del servidor.
2. **Servidor con WebSockets:** Configuración integral de `Socket.io` corriendo en paralelo con el servidor HTTP Express en el puerto `8080`.
3. **Vista Home (`/`):** Renderiza un listado estático que lee todos los productos almacenados en la persistencia local de datos.
4. **Vista RealTimeProducts (`/realtimeproducts`):** Renderiza la misma lista de productos pero conectada mediante WebSockets. 
5. **Acciones en Tiempo Real:** 
   * Formulario simple para **agregar** un producto nuevo que notifica e impacta al instante a todos los clientes conectados.
   * Formulario simple para **eliminar** un producto mediante su identificador ID único, actualizando la grilla en tiempo real.
6. **Separación de Rutas:** De acuerdo a la rúbrica oficial, las rutas de la API (`/api/products` y `/api/carts`) se mantienen independientes de las rutas visuales, las cuales fueron aisladas dentro de su propio enrutador dedicado (`views.router.js`).

---

## Estructura del Proyecto

El árbol de directorios está organizado de la siguiente manera:

```text
├── public/
│   └── styles.css          # Estilos CSS de las vistas e interfaz
├── src/
│   ├── data/
│   │   ├── carts.json      # Persistencia de carritos de compra
│   │   └── products.json   # Persistencia del catálogo de productos
│   ├── managers/
│   │   ├── CartManager.js   # Lógica del manejo de persistencia de carritos
│   │   └── ProductManager.js# Lógica del manejo de persistencia de productos
│   ├── routes/
│   │   ├── carts.router.js # Endpoints API para operaciones del carrito
│   │   ├── products.router.js# Endpoints API para operaciones del catálogo
│   │   └── views.router.js  # Router exclusivo para el renderizado de vistas
│   └── views/
│       ├── layouts/
│       │   └── main.handlebars # Plantilla base del layout (HTML general)
│       ├── home.handlebars     # Vista estática del catálogo
│       └── realTimeProducts.handlebars # Vista dinámica conectada a sockets
├── index.js                # Archivo principal de inicio del servidor
├── package.json            # Dependencias y scripts del proyecto
└── README.md               # Documentación general del proyecto# EntregaFinal-DesarrolloBackEnd-Diaz
