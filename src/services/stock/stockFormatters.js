// src/services/stock/stockFormatters.js
import { SPECIAL_DATES, DATE_FORMATS, CATEGORIES } from "./stockTypes";

export const formatDate = (date) => {
  if (!date) return SPECIAL_DATES.INDETERMINATE;

  const cleanDate = date.trim().toUpperCase();

  if (["X", "INDETERMINADO", "IND"].includes(cleanDate)) {
    return SPECIAL_DATES.INDETERMINATE;
  }

  if (cleanDate.includes(SPECIAL_DATES.MANUFACTURING)) {
    return SPECIAL_DATES.INDETERMINATE;
  }

  try {
    if (DATE_FORMATS.FULL.test(cleanDate)) {
      const [day, month, year] = cleanDate.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    if (DATE_FORMATS.SHORT_YEAR.test(cleanDate)) {
      const [month, year] = cleanDate.split("/");
      return `20${year}-${month.padStart(2, "0")}-01`;
    }

    if (DATE_FORMATS.LONG_YEAR.test(cleanDate)) {
      const [month, year] = cleanDate.split("/");
      return `${year}-${month.padStart(2, "0")}-01`;
    }
  } catch {
    return SPECIAL_DATES.INDETERMINATE;
  }

  return SPECIAL_DATES.INDETERMINATE;
};

export const formatQuantity = (quantity) => {
  if (!quantity) return "0";

  const cleanQuantity = quantity
    .toString()
    .toLowerCase()
    .replace(/cx/g, "")
    .replace(/pares?/g, "")
    .trim();

  const numericValue = parseInt(cleanQuantity);
  return isNaN(numericValue) ? "0" : numericValue.toString();
};

export const formatCategory = (category) => {
  if (!category) return CATEGORIES.DEFAULT;

  const cleanCategory = category.trim().toUpperCase();
  return cleanCategory || CATEGORIES.DEFAULT;
};

export const formatId = (id) => {
  if (!id) return "SEM ID";
  return id.replace(/\s+/g, "").trim() || "SEM ID";
};
