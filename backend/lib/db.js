const fs = require('fs');
const path = require('path');

const databaseDir = path.join(__dirname, '..', 'database');

function ensureFile(fileName, defaultValue) {
  const filePath = path.join(databaseDir, fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
  }
  return filePath;
}

function readJson(fileName, defaultValue = []) {
  const filePath = ensureFile(fileName, defaultValue);
  const raw = fs.readFileSync(filePath, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Failed to parse ${fileName}:`, error);
    return defaultValue;
  }
}

function writeJson(fileName, value) {
  const filePath = ensureFile(fileName, []);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf-8');
}

function getUsers() {
  return readJson('users.json', []);
}

function saveUsers(users) {
  writeJson('users.json', users);
}

function getProducts() {
  return readJson('products.json', []);
}

function saveProducts(products) {
  writeJson('products.json', products);
}

function getPurchases() {
  return readJson('purchases.json', []);
}

function savePurchases(purchases) {
  writeJson('purchases.json', purchases);
}

module.exports = {
  getUsers,
  saveUsers,
  getProducts,
  saveProducts,
  getPurchases,
  savePurchases,
};
