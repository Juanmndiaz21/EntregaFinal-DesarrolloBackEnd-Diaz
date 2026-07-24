const { Router } = require("express");
const CartManager = require("../managers/CartManager");

const router = Router();
const manager = new CartManager();

router.post("/", async (req, res) => {
    try {
        const newCart = await manager.createCart();
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: "Error al crear el carrito" });
    }
});

router.get("/:cid", async (req, res) => {
    try {
        const cart = await manager.getCartById(req.params.cid);

        if (!cart) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el carrito" });
    }
});

router.post("/:cid/product/:pid", async (req, res) => {
    try {
        const updatedCart = await manager.addProductToCart(req.params.cid, req.params.pid);

        if (!updatedCart) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).json({ error: "Error al agregar producto al carrito" });
    }
});

router.delete("/:cid/products/:pid", async (req, res) => {
    try {
        const updatedCart = await manager.deleteProductFromCart(req.params.cid, req.params.pid);

        if (!updatedCart) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el producto del carrito" });
    }
});

router.put("/:cid", async (req, res) => {
    try {
        const updatedCart = await manager.updateCartProducts(req.params.cid, req.body.products);

        if (!updatedCart) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el carrito" });
    }
});

router.put("/:cid/products/:pid", async (req, res) => {
    try {
        const { quantity } = req.body;
        const updatedCart = await manager.updateProductQuantity(req.params.cid, req.params.pid, quantity);

        if (!updatedCart) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar la cantidad del producto" });
    }
});

router.delete("/:cid", async (req, res) => {
    try {
        const updatedCart = await manager.clearCart(req.params.cid);

        if (!updatedCart) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).json({ error: "Error al vaciar el carrito" });
    }
});

module.exports = router;