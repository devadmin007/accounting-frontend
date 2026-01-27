// This file is kept for backward compatibility but now uses API
// All localStorage operations have been replaced with API calls in DataContext
// You can safely remove this file after confirming everything works with the backend

export const storage = {
  // Deprecated - now handled by API
  getProducts: () => [],
  setProducts: () => {},
  getSales: () => [],
  setSales: () => {},
  getPurchases: () => [],
  setPurchases: () => {},
};