const BASE_URL = 'https://dummyjson.com';

// Taux de conversion approximatif USD -> Dirham Marocain (MAD)
export const USD_TO_MAD = 10;

// Catégories électroniques : téléphones, PC/ordinateurs, tablettes et accessoires
export const TECH_CATEGORIES = [
  'smartphones',
  'laptops',
  'tablets',
  'mobile-accessories',
];

export const CATEGORY_LABELS = {
  smartphones: 'Téléphones',
  laptops: 'PC & Ordinateurs',
  tablets: 'Tablettes',
  'mobile-accessories': 'Accessoires Électroniques',
};

export function convertUsdToMad(usdPrice) {
  const numeric = Number(usdPrice);
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  return Math.round(numeric * USD_TO_MAD);
}

export function formatMAD(price) {
  const numeric = Number(price);
  if (!Number.isFinite(numeric)) return '0 MAD';
  return `${numeric.toLocaleString('fr-MA')} MAD`;
}

function normalizeProduct(product) {
  const stock = Number.isFinite(Number(product.stock))
    ? Math.max(0, Math.floor(Number(product.stock)))
    : 10;

  return {
    ...product,
    price: convertUsdToMad(product.price),
    stock,
    brand: product.brand || 'TechStore',
    categoryLabel: CATEGORY_LABELS[product.category] || product.category,
  };
}

async function getJson(url, errorMessage) {
  let response;

  try {
    response = await fetch(url);
  } catch {
    throw new Error('Impossible de contacter le service API');
  }

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch {
    throw new Error('Réponse API invalide');
  }
}

// Récupérer tous les produits (Téléphones, PC, Tablettes et Électronique)
export async function fetchProducts() {
  const responses = await Promise.all(
    TECH_CATEGORIES.map((category) =>
      getJson(
        `${BASE_URL}/products/category/${encodeURIComponent(category)}`,
        `Erreur lors de la récupération de la catégorie ${category}`,
      ),
    ),
  );

  const byId = new Map();
  for (const data of responses) {
    if (data && Array.isArray(data.products)) {
      for (const product of data.products) {
        if (!byId.has(product.id)) {
          byId.set(product.id, normalizeProduct(product));
        }
      }
    }
  }

  if (byId.size === 0) {
    throw new Error('Aucun produit électronique trouvé');
  }

  return Array.from(byId.values());
}

// Récupérer un produit par son ID
export async function fetchProductById(id) {
  if (id === undefined || id === null || String(id).trim() === '') {
    throw new Error('Identifiant produit invalide');
  }

  const product = await getJson(
    `${BASE_URL}/products/${encodeURIComponent(String(id))}`,
    'Produit introuvable',
  );

  return normalizeProduct(product);
}
