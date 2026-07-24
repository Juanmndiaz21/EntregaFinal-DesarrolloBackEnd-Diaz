const { Router } = require("express");
const mongoose = require("mongoose");
const CartManager = require("../managers/CartManager");

const router = Router();
const manager = new CartManager();

function isValidObjectId(value) {
    return mongoose.Types.ObjectId.isValid(value);
}

function validateCartProducts(products) {
    if (!Array.isArray(products)) {
        return ["products debe ser un arreglo"];
    }

    const errors = [];

    products.forEach((item, index) => {
        if (!item || typeof item !== "object") {
            errors.push(`products[${index}] debe ser un objeto`);
            return;
        }

        if (!isValidObjectId(item.product)) {
            errors.push(`products[${index}].product debe ser un ObjectId válido`);
        }

        const quantity = Number(item.quantity);

        if (!Number.isInteger(quantity) || quantity < 1) {
            errors.push(`products[${index}].quantity debe ser un entero mayor a cero`);
        }
    });

    return errors;
}

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
        if (!isValidObjectId(req.params.cid)) {
            return res.status(400).json({ error: "ID de carrito inválido" });
        }

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
        if (!isValidObjectId(req.params.cid) || !isValidObjectId(req.params.pid)) {
            return res.status(400).json({ error: "ID de carrito o producto inválido" });
        }

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
        if (!isValidObjectId(req.params.cid) || !isValidObjectId(req.params.pid)) {
            return res.status(400).json({ error: "ID de carrito o producto inválido" });
        }

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
        if (!isValidObjectId(req.params.cid)) {
            return res.status(400).json({ error: "ID de carrito inválido" });
        }

        const validationErrors = validateCartProducts(req.body.products);

        if (validationErrors.length > 0) {
            return res.status(400).json({ error: "Datos de carrito inválidos", details: validationErrors });
        }

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

        if (!isValidObjectId(req.params.cid) || !isValidObjectId(req.params.pid)) {
            return res.status(400).json({ error: "ID de carrito o producto inválido" });
        }

        if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
            return res.status(400).json({ error: "La cantidad debe ser un número entero mayor a cero" });
        }

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
        if (!isValidObjectId(req.params.cid)) {
            return res.status(400).json({ error: "ID de carrito inválido" });
        }

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