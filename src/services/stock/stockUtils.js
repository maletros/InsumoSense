// src/services/stock/stockUtils.js
import { SPECIAL_DATES, ITEM_STATUS, CATEGORIES } from "./stockTypes";

export const stockUtils = {
  isExpired: (item) => {
    if (
      !item?.expirationDate ||
      item.expirationDate === SPECIAL_DATES.INDETERMINATE
    ) {
      return false;
    }
    return new Date(item.expirationDate) < new Date();
  },

  isInStock: (item) => {
    return parseInt(item?.quantity || 0) > 0;
  },

  isNearExpiration: (item, days = 30) => {
    if (
      !item?.expirationDate ||
      item.expirationDate === SPECIAL_DATES.INDETERMINATE
    ) {
      return false;
    }
    const expirationDate = new Date(item.expirationDate);
    const today = new Date();
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= days;
  },

  filterByCategory: (items = [], category) => {
    if (!items.length) return [];
    if (category === CATEGORIES.ALL) return items;

    switch (category) {
      case "EM_ESTOQUE":
        return items.filter((item) => stockUtils.isInStock(item));
      case "SEM_ESTOQUE":
        return items.filter((item) => !stockUtils.isInStock(item));
      case "EXPIRADOS":
        return items.filter((item) => stockUtils.isExpired(item));
      default:
        return items.filter((item) => item.category === category);
    }
  },

  sortItems: (items = [], sortBy = "name") => {
    if (!items.length) return [];

    return [...items].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "quantity":
          return (parseInt(b.quantity) || 0) - (parseInt(a.quantity) || 0);
        case "expirationDate":
          if (a.expirationDate === SPECIAL_DATES.INDETERMINATE) return 1;
          if (b.expirationDate === SPECIAL_DATES.INDETERMINATE) return -1;
          return new Date(a.expirationDate) - new Date(b.expirationDate);
        default:
          return 0;
      }
    });
  },

  searchItems: (items = [], searchTerm = "") => {
    if (!items.length || !searchTerm) return items;

    const normalizedSearch = searchTerm.toLowerCase().trim();
    return items.filter(
      (item) =>
        (item.name || "").toLowerCase().includes(normalizedSearch) ||
        (item.id || "").toLowerCase().includes(normalizedSearch) ||
        (item.category || "").toLowerCase().includes(normalizedSearch)
    );
  },

  getStatus: (item) => {
    if (!stockUtils.isInStock(item)) return ITEM_STATUS.OUT_OF_STOCK;
    if (stockUtils.isExpired(item)) return ITEM_STATUS.EXPIRED;
    if (stockUtils.isNearExpiration(item)) return ITEM_STATUS.NEAR_EXPIRATION;
    return ITEM_STATUS.IN_STOCK;
  },
};
