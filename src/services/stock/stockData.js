// src/services/stock/stockData.js
import { stockItemsData } from "./stockItemsData";
import { SPECIAL_DATES, categoriesList } from "./stockTypes";
import {
  formatDate,
  formatQuantity,
  formatCategory,
  formatId,
} from "./stockFormatters";
import { stockUtils } from "./stockUtils";

export const stockData = stockItemsData
  .map((item) => ({
    id: formatId(item.id),
    name: item.name?.trim() || "",
    quantity: formatQuantity(item.quantity),
    expirationDate: formatDate(item.expirationDate),
    category: formatCategory(item.category),
    observacao: item.observacao?.trim() || "",
    status: stockUtils.getStatus(item),
  }))
  .filter((item) => item.id && item.name);

export const debugStock = {
  countByCategory: () => {
    const counts = {};
    stockData.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  },

  findDuplicateIds: () => {
    const ids = {};
    const duplicates = [];
    stockData.forEach((item) => {
      if (ids[item.id]) {
        duplicates.push(item.id);
      }
      ids[item.id] = true;
    });
    return duplicates;
  },

  findInvalidDates: () => {
    return stockData.filter((item) => {
      if (item.expirationDate === SPECIAL_DATES.INDETERMINATE) return false;
      const date = new Date(item.expirationDate);
      return isNaN(date.getTime());
    });
  },

  validateStock: () => {
    return {
      total: stockData.length,
      categoryCounts: debugStock.countByCategory(),
      duplicateIds: debugStock.findDuplicateIds(),
      invalidDates: debugStock.findInvalidDates(),
      itemsWithoutCategory: stockData.filter((item) => !item.category).length,
      itemsWithZeroQuantity: stockData.filter((item) => item.quantity === "0")
        .length,
    };
  },
};

export { categoriesList, stockUtils };
