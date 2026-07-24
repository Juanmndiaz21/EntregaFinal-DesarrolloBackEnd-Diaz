const { Router } = require("express");
const mongoose = require("mongoose");
const ProductManager = require("../managers/ProductManager");

const router = Router();
const manager = new ProductManager();

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function buildPaginationLink(req, page) {
  const params = new URLSearchParams();

  Object.entries(req.query).forEach(([key, value]) => {
    if (key !== "page" && value !== undefined && value !== null && String(value).trim() !== "") {
      params.set(key, String(value));
    }
  });

  params.set("page", String(page));
  return `${req.protocol}://${req.get("host")}${req.baseUrl}?${params.toString()}`;
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateProductPayload(payload, { partial = false } = {}) {
  const errors = [];
  const { title, description, code, price, status, stock, category, thumbnails } = payload;

  if (!partial || title !== undefined) {
    if (normalizeString(title) === "") errors.push("title es obligatorio");
  }

  if (!partial || description !== undefined) {
    if (normalizeString(description) === "") errors.push("description es obligatorio");
  }

  if (!partial || code !== undefined) {
    if (normalizeString(code) === "") errors.push("code es obligatorio");
  }

  if (!partial || price !== undefined) {
    const parsedPrice = Number(price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) errors.push("price debe ser un número válido mayor o igual a 0");
  }

  if (status !== undefined && typeof status !== "boolean") {
    errors.push("status debe ser booleano");
  }

  if (!partial || stock !== undefined) {
    const parsedStock = Number(stock);
    if (!Number.isInteger(parsedStock) || parsedStock < 0) errors.push("stock debe ser un entero mayor o igual a 0");
  }

  if (!partial || category !== undefined) {
    if (normalizeString(category) === "") errors.push("category es obligatorio");
  }

  if (thumbnails !== undefined && !Array.isArray(thumbnails)) {
    errors.push("thumbnails debe ser un arreglo");
  }

  return errors;
}

router.get("/", async (req, res) => {
  try {
    const result = await manager.getProductsPaginated(req.query);
    const prevLink = result.prevPage ? buildPaginationLink(req, result.prevPage) : null;
    const nextLink = result.nextPage ? buildPaginationLink(req, result.nextPage) : null;

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
    if (!isValidObjectId(req.params.pid)) {
      return res.status(400).json({ error: "ID de producto inválido" });
    }

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
    const validationErrors = validateProductPayload(req.body);

    if (validationErrors.length > 0) {
      return res.status(400).json({ error: "Datos de producto inválidos", details: validationErrors });
    }

    const newProduct = await manager.addProduct({ title, description, code, price, status, stock, category, thumbnails });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el producto" });
  }
});

router.put("/:pid", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.pid)) {
      return res.status(400).json({ error: "ID de producto inválido" });
    }

    const validationErrors = validateProductPayload(req.body, { partial: true });

    if (validationErrors.length > 0) {
      return res.status(400).json({ error: "Datos de producto inválidos", details: validationErrors });
    }

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
    if (!isValidObjectId(req.params.pid)) {
      return res.status(400).json({ error: "ID de producto inválido" });
    }

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