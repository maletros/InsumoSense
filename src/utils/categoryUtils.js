// src/utils/categoryUtils.js

export const normalizeString = (str) => {
  if (!str) return '';
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

export const formatCategory = (category) => {
  if (!category || !category.trim()) return "Vazio";
  
  const normalizedCategory = normalizeString(category);
  if (normalizedCategory === 'armario') return "Armario";
  
  if (category.includes('/')) {
    return category.split('/').map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join('/');
  }
  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
};

const customCategoryOrder = [
  'Todos', 'Em Estoque', 'Sem Estoque', 'Expirados', 'Armario', 'S/E', 'Vazio',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'X'
];

export const sortCategories = (a, b) => {
  const indexA = customCategoryOrder.indexOf(a);
  const indexB = customCategoryOrder.indexOf(b);
  if (indexA !== -1 && indexB !== -1) return indexA - indexB;
  if (indexA !== -1) return -1;
  if (indexB !== -1) return 1;
  return a.localeCompare(b);
};