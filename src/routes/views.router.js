const { Router } = require("express");
const ProductManager = require("../managers/ProductManager");
const CartManager = require("../managers/CartManager");

const router = Router();
const manager = new ProductManager();
const cartManager = new CartManager();

async function renderProductsView(req, res) {
    const { limit = 10, page = 1, query = "", sort = "" } = req.query;
    const result = await manager.getProductsPaginated(page, limit, query, sort);
    const carts = await cartManager.getCarts();
    const cartId = carts.length > 0 ? carts[0]._id.toString() : (await cartManager.createCart())._id.toString();

    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}/products`;
    const queryParam = query !== undefined && query !== null && String(query).trim() !== "" ? `&query=${encodeURIComponent(query)}` : "";
    const sortParam = sort === "asc" || sort === "desc" ? `&sort=${encodeURIComponent(sort)}` : "";

    return res.render("home", {
        products: result.products,
        totalPages: result.totalPages,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink: result.prevPage ? `${baseUrl}?limit=${limit}&page=${result.prevPage}${queryParam}${sortParam}` : null,
        nextLink: result.nextPage ? `${baseUrl}?limit=${limit}&page=${result.nextPage}${queryParam}${sortParam}` : null,
        cartId,
    });
}

// vista home.handlebars
router.get("/", async (req, res) => {
    try {
        await renderProductsView(req, res);
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