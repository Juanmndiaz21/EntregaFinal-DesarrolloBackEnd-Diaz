const express = require("express");
const { engine } = require("express-handlebars");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const productsRouter = require("./src/routes/products.router");
const cartsRouter = require("./src/routes/carts.router");
const viewsRouter = require("./src/routes/views.router"); 
const ProductManager = require("./src/managers/ProductManager");

const app = express();
const PORT = 8080;
const manager = new ProductManager();
const MONGODB_URI = "mongodb://127.0.0.1:27017/ecommerce";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// configurar Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// conectar los routers
app.use("/", viewsRouter); 
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// configurar socket
async function startServer() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Conectado a MongoDB");

        const httpServer = app.listen(PORT, () => {
            console.log(`Servidor escuchando en http://localhost:${PORT}`);
        });

        const io = new Server(httpServer);

        io.on("connection", async (socket) => {
            console.log("Nuevo cliente conectado");

            try {
                const products = await manager.getProducts();
                socket.emit("updateProducts", products);
            } catch (error) {
                console.error("Error al enviar productos iniciales:", error);
            }

            socket.on("addProduct", async (productData) => {
                try {
                    await manager.addProduct(productData);
                    const products = await manager.getProducts();
                    io.emit("updateProducts", products);
                } catch (error) {
                    console.error("Error al agregar producto por socket:", error);
                }
            });

            socket.on("deleteProduct", async (id) => {
                try {
                    if (!mongoose.Types.ObjectId.isValid(id)) {
                        throw new Error(`ID de producto inválido: ${id}`);
                    }

                    await manager.deleteProduct(id);
                    const products = await manager.getProducts();
                    io.emit("updateProducts", products);
                } catch (error) {
                    console.error("Error al eliminar producto por socket:", error);
                }
            });
        });
    } catch (error) {
        console.error("Error al conectar con MongoDB:", error);
    }
}

startServer();