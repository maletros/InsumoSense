// src/services/index.js

// Exportações do serviço de autenticação
export { authService } from "./auth/authService";

// Exportações dos serviços de estoque
export { stockService } from "./stock/stockService";
export { stockData, debugStock } from "./stock/stockData";
export * from "./stock/stockTypes";
export { stockUtils } from "./stock/stockUtils";
export * from "./stock/stockFormatters";

// Se você quiser exportar stockItemsData, descomente a linha abaixo
// export { stockItemsData } from './stock/stockItemsData';
