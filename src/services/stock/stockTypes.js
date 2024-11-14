// src/services/stock/stockTypes.js

export const SPECIAL_DATES = {
  INDETERMINATE: "INDETERMINADO",
  MANUFACTURING: "FAB.",
};

export const DATE_FORMATS = {
  FULL: /(\d{2})\/(\d{2})\/(\d{4})/, // dd/mm/yyyy
  SHORT_YEAR: /(\d{2})\/(\d{2})/, // mm/yy
  LONG_YEAR: /(\d{2})\/(\d{4})/, // mm/yyyy
};

export const CATEGORIES = {
  DEFAULT: "SEM CATEGORIA",
  OUT_OF_STOCK: "SEM ESTOQUE",
  ALL: "TODOS",
};

export const ITEM_STATUS = {
  IN_STOCK: "IN_STOCK",
  OUT_OF_STOCK: "OUT_OF_STOCK",
  EXPIRED: "EXPIRED",
  NEAR_EXPIRATION: "NEAR_EXPIRATION",
};

export const categoriesList = [
  { id: "TODOS", name: "Todos os Itens" },
  { id: "EM_ESTOQUE", name: "Em Estoque" },
  { id: "SEM_ESTOQUE", name: "Sem Estoque" },
  { id: "EXPIRADOS", name: "Itens Expirados" },
  { id: "A", name: "Categoria A" },
  { id: "B", name: "Categoria B" },
  { id: "C", name: "Categoria C" },
  { id: "D", name: "Categoria D" },
  { id: "E", name: "Categoria E" },
  { id: "F", name: "Categoria F" },
  { id: "G", name: "Categoria G" },
  { id: "H", name: "Categoria H" },
  { id: "I", name: "Categoria I" },
  { id: "K", name: "Categoria K" },
  { id: "X", name: "Categoria X" },
  { id: "S/E", name: "Sem Estoque" },
  { id: "ARMARIO", name: "Armário" },
];
