const http = require('http');
const { URL } = require('url');
const { getUsers, saveUsers, getProducts, saveProducts, getPurchases, savePurchases } = require('./lib/db');
const { generateId, hashPassword, verifyPassword, createToken, verifyToken } = require('./lib/auth');
const { sendJson, sendError, parseBody } = require('./lib/http');

const PORT = 4000;

function normalizeProduct(product) {
  const comments = Array.isArray(product.comments) ? product.comments : [];
  const averageRating = comments.length
    ? Number((comments.reduce((sum, item) => sum + Number(item.rating || 0), 0) / comments.length).toFixed(2))
    : 0;

  return {
    ...product,
    comments,
    averageRating,
  };
}

function getAuthUser(req) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return verifyToken(token);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isValidRating(value) {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    // Health
    if (req.method === 'GET' && pathname === '/') {
      return sendJson(res, 200, { message: 'Hipsage backend is running' });
    }

    // Register
    if (req.method === 'POST' && pathname === '/auth/register') {
      const body = await parseBody(req);
      const username = String(body.username || '').trim();
      const password = String(body.password || '').trim();

      if (username.length < 3) {
        return sendError(res, 400, 'Username must be at least 3 characters long');
      }

      if (password.length < 6) {
        return sendError(res, 400, 'Password must be at least 6 characters long');
      }

      const users = getUsers();
      const existingUser = users.find((user) => user.username.toLowerCase() === username.toLowerCase());

      if (existingUser) {
        return sendError(res, 409, 'Username already exists');
      }

      const passwordHash = await hashPassword(password);

      const newUser = {
        id: generateId(),
        username,
        passwordHash,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      saveUsers(users);

      const token = createToken(newUser);

      return sendJson(res, 201, {
        message: 'Registration successful',
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
        },
      });
    }

    // Login
    if (req.method === 'POST' && pathname === '/auth/login') {
      const body = await parseBody(req);
      const username = String(body.username || '').trim();
      const password = String(body.password || '').trim();

      const users = getUsers();
      const user = users.find((item) => item.username.toLowerCase() === username.toLowerCase());

      if (!user) {
        return sendError(res, 401, 'Invalid username or password');
      }

      const validPassword = await verifyPassword(password, user.passwordHash);

      if (!validPassword) {
        return sendError(res, 401, 'Invalid username or password');
      }

      const token = createToken(user);

      return sendJson(res, 200, {
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
        },
      });
    }

    // Me
    if (req.method === 'GET' && pathname === '/me') {
      const authUser = getAuthUser(req);

      if (!authUser) {
        return sendError(res, 401, 'Unauthorized');
      }

      return sendJson(res, 200, {
        user: {
          id: authUser.id,
          username: authUser.username,
        },
      });
    }

    // Get all products
    if (req.method === 'GET' && pathname === '/products') {
      const products = getProducts().map(normalizeProduct);
      return sendJson(res, 200, products);
    }

    // Create product
    if (req.method === 'POST' && pathname === '/products') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Unauthorized');

      const body = await parseBody(req);
      const { name, description, price, image, quantity } = body;

      if (!isNonEmptyString(name)) return sendError(res, 400, 'Product name is required');
      if (!isNonEmptyString(description)) return sendError(res, 400, 'Description is required');
      if (!isPositiveNumber(price)) return sendError(res, 400, 'Price must be a positive number');
      if (!isNonEmptyString(image)) return sendError(res, 400, 'Image URL is required');
      if (!Number.isInteger(quantity) || quantity < 0) return sendError(res, 400, 'Quantity must be a non-negative integer');

      const products = getProducts();

      const newProduct = {
        id: generateId(),
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        image: image.trim(),
        quantity,
        sellerId: authUser.id,
        sellerUsername: authUser.username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: [],
      };

      products.push(newProduct);
      saveProducts(products);

      return sendJson(res, 201, normalizeProduct(newProduct));
    }

    // Single product routes
    const productMatch = pathname.match(/^\/products\/([^/]+)$/);
    const editMatch = pathname.match(/^\/products\/([^/]+)\/buy$/);
    const commentMatch = pathname.match(/^\/products\/([^/]+)\/comments$/);

    if (req.method === 'GET' && productMatch) {
      const productId = productMatch[1];
      const products = getProducts();
      const product = products.find((item) => item.id === productId);

      if (!product) return sendError(res, 404, 'Product not found');

      return sendJson(res, 200, normalizeProduct(product));
    }

    if (req.method === 'PUT' && productMatch) {
      const productId = productMatch[1];
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Unauthorized');

      const products = getProducts();
      const productIndex = products.findIndex((item) => item.id === productId);

      if (productIndex === -1) return sendError(res, 404, 'Product not found');
      if (products[productIndex].sellerId !== authUser.id) return sendError(res, 403, 'You can edit only your own products');

      const body = await parseBody(req);
      const { name, description, price, image, quantity } = body;

      if (!isNonEmptyString(name)) return sendError(res, 400, 'Product name is required');
      if (!isNonEmptyString(description)) return sendError(res, 400, 'Description is required');
      if (!isPositiveNumber(price)) return sendError(res, 400, 'Price must be a positive number');
      if (!isNonEmptyString(image)) return sendError(res, 400, 'Image URL is required');
      if (!Number.isInteger(quantity) || quantity < 0) return sendError(res, 400, 'Quantity must be a non-negative integer');

      products[productIndex] = {
        ...products[productIndex],
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        image: image.trim(),
        quantity,
        updatedAt: new Date().toISOString(),
      };

      saveProducts(products);
      return sendJson(res, 200, normalizeProduct(products[productIndex]));
    }

    if (req.method === 'DELETE' && productMatch) {
      const productId = productMatch[1];
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Unauthorized');

      const products = getProducts();
      const product = products.find((item) => item.id === productId);

      if (!product) return sendError(res, 404, 'Product not found');
      if (product.sellerId !== authUser.id) return sendError(res, 403, 'You can delete only your own products');

      const filteredProducts = products.filter((item) => item.id !== productId);
      saveProducts(filteredProducts);

      return sendJson(res, 200, { message: 'Product deleted successfully' });
    }

    // Add comment
    if (req.method === 'POST' && commentMatch) {
      const productId = commentMatch[1];
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Unauthorized');

      const body = await parseBody(req);
      const text = String(body.text || '').trim();
      const rating = Number(body.rating);

      if (!isNonEmptyString(text)) return sendError(res, 400, 'Comment text is required');
      if (!isValidRating(rating)) return sendError(res, 400, 'Rating must be an integer from 1 to 5');

      const products = getProducts();
      const productIndex = products.findIndex((item) => item.id === productId);

      if (productIndex === -1) return sendError(res, 404, 'Product not found');

      const newComment = {
        id: generateId(),
        userId: authUser.id,
        username: authUser.username,
        rating,
        text,
        createdAt: new Date().toISOString(),
      };

      products[productIndex].comments = Array.isArray(products[productIndex].comments)
        ? products[productIndex].comments
        : [];

      products[productIndex].comments.push(newComment);
      products[productIndex].updatedAt = new Date().toISOString();

      saveProducts(products);

      return sendJson(res, 201, normalizeProduct(products[productIndex]));
    }

    // Buy product
    if (req.method === 'POST' && editMatch) {
      const productId = editMatch[1];
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Unauthorized');

      const products = getProducts();
      const productIndex = products.findIndex((item) => item.id === productId);

      if (productIndex === -1) return sendError(res, 404, 'Product not found');

      const product = products[productIndex];

      if (product.quantity <= 0) {
        return sendError(res, 400, 'Product is out of stock');
      }

      products[productIndex].quantity -= 1;
      products[productIndex].updatedAt = new Date().toISOString();
      saveProducts(products);

      const purchases = getPurchases();
      const purchase = {
        id: generateId(),
        userId: authUser.id,
        productId: product.id,
        productName: product.name,
        price: product.price,
        purchaseDate: new Date().toISOString(),
      };

      purchases.push(purchase);
      savePurchases(purchases);

      return sendJson(res, 201, {
        message: 'Purchase successful',
        purchase,
        product: normalizeProduct(products[productIndex]),
      });
    }

    // History
    if (req.method === 'GET' && pathname === '/history') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Unauthorized');

      const purchases = getPurchases()
        .filter((item) => item.userId === authUser.id)
        .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));

      return sendJson(res, 200, purchases);
    }

    return sendError(res, 404, 'Route not found');
  } catch (error) {
    console.error(error);
    return sendError(res, 500, 'Internal server error');
  }
});

server.listen(PORT, () => {
  console.log(`Hipsage backend is running on http://localhost:${PORT}`);
});
