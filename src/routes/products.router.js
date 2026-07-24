const { Router } = require("express");
const ProductManager = require("../managers/ProductManager");

const router = Router();
const manager = new ProductManager();

router.get("/", async (req, res) => {
  try {
    const { limit = 10, page = 1, query = "", sort = "" } = req.query;
    const result = await manager.getProductsPaginated(page, limit, query, sort);

    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
    const queryParam = query !== undefined && query !== null && String(query).trim() !== "" ? `&query=${encodeURIComponent(query)}` : "";
    const sortParam = sort === "asc" || sort === "desc" ? `&sort=${encodeURIComponent(sort)}` : "";
    const prevLink = result.prevPage ? `${baseUrl}?limit=${limit}&page=${result.prevPage}${queryParam}${sortParam}` : null;
    const nextLink = result.nextPage ? `${baseUrl}?limit=${limit}&page=${result.nextPage}${queryParam}${sortParam}` : null;

    res.status(200).json({
      status: "success",
      payload: result.products,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink,
      nextLink,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los productos" });
  }
});

router.get("/:pid", async (req, res) => {
  try {
    const product = await manager.getProductById(req.params.pid);

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el producto" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;
    const newProduct = await manager.addProduct({ title, description, code, price, status, stock, category, thumbnails });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el producto" });
  }
});

router.put("/:pid", async (req, res) => {
  try {
    const updated = await manager.updateProduct(req.params.pid, req.body);

    if (!updated) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    const deleted = await manager.deleteProduct(req.params.pid);

    if (!deleted) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(200).json({ message: "Producto eliminado", product: deleted });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
});

module.exports = router;