const { Router } = require("express");
const ProductManager = require("../managers/ProductManager");
const CartManager = require("../managers/CartManager");

const router = Router();
const manager = new ProductManager();
const cartManager = new CartManager();

function buildPaginationLink(req, page) {
    const params = new URLSearchParams();

    Object.entries(req.query).forEach(([key, value]) => {
        if (key !== "page" && value !== undefined && value !== null && String(value).trim() !== "") {
            params.set(key, String(value));
        }
    });

    params.set("page", String(page));
    return `${req.protocol}://${req.get("host")}${req.baseUrl}/products?${params.toString()}`;
}

async function renderProductsView(req, res) {
    const result = await manager.getProductsPaginated(req.query);
    const carts = await cartManager.getCarts();
    const cartId = carts.length > 0 ? carts[0]._id.toString() : (await cartManager.createCart())._id.toString();

    return res.render("index", {
        products: result.products,
        totalPages: result.totalPages,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink: result.prevPage ? buildPaginationLink(req, result.prevPage) : null,
        nextLink: result.nextPage ? buildPaginationLink(req, result.nextPage) : null,
        cartId,
    });
}

function renderHomeView(req, res) {
    return res.render("home");
}

// vista home.handlebars
router.get("/", async (req, res) => {
    try {
        renderHomeView(req, res);
    } catch (error) {
        res.status(500).send("Error al cargar la vista Home");
    }
});

router.get("/products", async (req, res) => {
    try {
        await renderProductsView(req, res);
    } catch (error) {
        res.status(500).send("Error al cargar la vista Home");
    }
});

// endpoint /realtimeproducts
router.get("/realtimeproducts", async (req, res) => {
    try {
        res.render("realTimeProducts");
    } catch (error) {
        res.status(500).send("Error al cargar la vista en tiempo real");
    }
});

router.get("/carts/:cid", async (req, res) => {
    try {
        const cart = await cartManager.getCartById(req.params.cid);

        if (!cart) {
            return res.status(404).send("Carrito no encontrado");
        }

        res.render("cart", { cart });
    } catch (error) {
        res.status(500).send("Error al cargar la vista del carrito");
    }
});

module.exports = router;