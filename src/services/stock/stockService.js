// src/services/stock/stockService.js

import { db } from "../../firebase";
import {
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  getDoc,
  addDoc,
} from "firebase/firestore";
import { stockItemsData } from "./stockItemsData";

class StockService {
  constructor() {
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    try {
      console.log("Inicializando o estoque...");
      await this.updateExistingItems();
      this.initialized = true;
      console.log("Inicialização do estoque concluída.");
    } catch (error) {
      console.error("Erro na inicialização do estoque:", error);
      throw new Error("Não foi possível inicializar o serviço de estoque");
    }
  }

  async updateExistingItems() {
    try {
      console.log("Iniciando atualização dos itens existentes...");
      const existingItems = await this.getAllItems();
      const existingItemsMap = new Map(
        existingItems.map((item) => [item.id, item])
      );
      console.log(`Número de itens existentes: ${existingItems.length}`);
      console.log(
        `Número de itens em stockItemsData: ${stockItemsData.length}`
      );

      let updatedCount = 0;
      let addedCount = 0;

      for (const item of stockItemsData) {
        if (existingItemsMap.has(item.id)) {
          await this.updateItem(item.id, item);
          updatedCount++;
          console.log(`Item atualizado: ${item.id}`);
        } else {
          await this.addItem(item);
          addedCount++;
          console.log(`Item adicionado: ${item.id}`);
        }
      }

      console.log(`Itens atualizados: ${updatedCount}`);
      console.log(`Itens adicionados: ${addedCount}`);
      console.log("Atualização concluída.");
    } catch (error) {
      console.error("Erro ao atualizar itens existentes:", error);
      throw error;
    }
  }

  async getAllItems() {
    try {
      const stockSnapshot = await getDocs(collection(db, "stock"));
      return stockSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Erro ao buscar itens:", error);
      throw error;
    }
  }

  async getItemById(itemId) {
    try {
      const itemDoc = await getDoc(doc(db, "stock", itemId));
      if (itemDoc.exists()) {
        return { id: itemDoc.id, ...itemDoc.data() };
      } else {
        throw new Error("Item não encontrado");
      }
    } catch (error) {
      console.error("Erro ao buscar item por ID:", error);
      throw error;
    }
  }

  async addItem(newItem) {
    try {
      const docRef = doc(db, "stock", newItem.id);
      await setDoc(docRef, {
        ...newItem,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { id: newItem.id, ...newItem };
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
      throw error;
    }
  }

  async updateItem(itemId, updates) {
    try {
      const itemRef = doc(db, "stock", itemId);
      await updateDoc(itemRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return { id: itemId, ...updates };
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      throw error;
    }
  }

  async deleteItem(itemId) {
    try {
      await deleteDoc(doc(db, "stock", itemId));
      return true;
    } catch (error) {
      console.error("Erro ao deletar item:", error);
      throw error;
    }
  }

  async registerMovement(itemId, quantity, type, userId) {
    try {
      const movementRef = await addDoc(collection(db, "stockMovements"), {
        itemId,
        quantity,
        type, // 'entrada' ou 'saída'
        userId,
        timestamp: serverTimestamp(),
      });

      const itemRef = doc(db, "stock", itemId);
      const itemDoc = await getDoc(itemRef);
      if (itemDoc.exists()) {
        const currentQuantity = itemDoc.data().quantity || 0;
        const newQuantity =
          type === "entrada"
            ? currentQuantity + quantity
            : currentQuantity - quantity;

        await updateDoc(itemRef, {
          quantity: newQuantity,
          updatedAt: serverTimestamp(),
        });
      }

      return { id: movementRef.id, itemId, quantity, type, userId };
    } catch (error) {
      console.error("Erro ao registrar movimento:", error);
      throw error;
    }
  }

  async getMovements(itemId = null, limit = 50) {
    try {
      let movementsQuery;
      if (itemId) {
        movementsQuery = query(
          collection(db, "stockMovements"),
          where("itemId", "==", itemId),
          orderBy("timestamp", "desc"),
          limit(limit)
        );
      } else {
        movementsQuery = query(
          collection(db, "stockMovements"),
          orderBy("timestamp", "desc"),
          limit(limit)
        );
      }

      const movementsSnapshot = await getDocs(movementsQuery);
      return movementsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Erro ao buscar movimentos:", error);
      throw error;
    }
  }

  async checkStockAlerts() {
    try {
      const alertsQuery = query(
        collection(db, "stock"),
        where("quantity", "<", "minQuantity")
      );
      const alertsSnapshot = await getDocs(alertsQuery);
      return alertsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Erro ao verificar alertas de estoque:", error);
      throw error;
    }
  }

  async searchItems(searchTerm) {
    try {
      // Nota: Firestore não suporta pesquisa de texto completo nativamente.
      // Esta é uma implementação básica que pesquisa apenas pelo início do nome.
      const searchQuery = query(
        collection(db, "stock"),
        where("name", ">=", searchTerm),
        where("name", "<=", searchTerm + "\uf8ff"),
        limit(20)
      );
      const searchSnapshot = await getDocs(searchQuery);
      return searchSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Erro na pesquisa de itens:", error);
      throw error;
    }
  }

  async getItemsByCategory(category) {
    try {
      const categoryQuery = query(
        collection(db, "stock"),
        where("category", "==", category)
      );
      const categorySnapshot = await getDocs(categoryQuery);
      return categorySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Erro ao buscar itens por categoria:", error);
      throw error;
    }
  }

  // Método para debug - verificar itens atuais
  async debugStock() {
    try {
      const items = await this.getAllItems();
      console.log("Itens em estoque:", items);
      return items;
    } catch (error) {
      console.error("Erro ao debugar estoque:", error);
      return [];
    }
  }
}

export const stockService = new StockService();
