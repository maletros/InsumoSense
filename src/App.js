// src/App.js

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { authService } from "./services/auth/authService";
import { stockService } from "./services/stock/stockService";
import LoginScreen from "./components/LoginScreen/LoginScreen";
import RegisterScreen from "./components/RegisterScreen/RegisterScreen";
import StockList from "./components/StockList/StockList";
import AdminDebug from "./components/AdminDebug/AdminDebug";

export default function App() {
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stockItems, setStockItems] = useState([]);
  const [error, setError] = useState(null);
  const [isAdminDebugVisible, setIsAdminDebugVisible] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState("");

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await Promise.all([authService.init(), stockService.init()]);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        const items = await stockService.getAllItems();
        setStockItems(items);
      }
      setInitialized(true);
    } catch (error) {
      console.error("Erro na inicialização:", error);
      setError(
        "Falha ao inicializar o aplicativo. Por favor, tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email, password) => {
    console.log("App: Iniciando handleLogin para email:", email);
    try {
      setIsLoading(true);
      setError(null);
      console.log("App: Chamando authService.login");
      const loggedInUser = await authService.login(email, password);
      console.log("App: Login bem-sucedido, usuário:", loggedInUser);
      setUser(loggedInUser);
      console.log("App: Buscando itens do estoque");
      const items = await stockService.getAllItems();
      setStockItems(items);
      return loggedInUser;
    } catch (error) {
      console.error("App: Erro no login:", error);
      throw error; // Propaga o erro para ser tratado no LoginScreen
    } finally {
      setIsLoading(false);
      console.log("App: handleLogin finalizado");
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      setStockItems([]);
    } catch (error) {
      console.error("Erro no logout:", error);
      setError("Falha ao fazer logout. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStockItems = async () => {
    try {
      setIsLoading(true);
      const items = await stockService.getAllItems();
      setStockItems(items);
    } catch (error) {
      console.error("Erro ao atualizar itens do estoque:", error);
      setError(
        "Falha ao atualizar itens do estoque. Por favor, tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterPress = (email) => {
    setRegistrationEmail(email);
    setShowRegister(true);
  };

  const handleRegister = async (userData) => {
    try {
      setIsLoading(true);
      const newUser = await authService.register(userData);
      setUser(newUser);
      const items = await stockService.getAllItems();
      setStockItems(items);
    } catch (error) {
      console.error("Erro no registro:", error);
      setError("Falha no registro. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
      setShowRegister(false);
    }
  };

  const handleBackToLogin = () => {
    setShowRegister(false);
  };

  if (!initialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Inicializando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!user) {
    if (showRegister) {
      return (
        <RegisterScreen
          onRegister={handleRegister}
          onBack={handleBackToLogin}
          initialEmail={registrationEmail}
          isLoading={isLoading}
        />
      );
    }
    return (
      <LoginScreen
        onLogin={handleLogin}
        onRegisterPress={handleRegisterPress}
        isLoading={isLoading}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StockList
        stock={stockItems}
        onLogout={handleLogout}
        user={user}
        onRefresh={refreshStockItems}
        onDebugPress={() => setIsAdminDebugVisible(true)}
        isLoading={isLoading}
      />
      {user.role === "admin" && (
        <AdminDebug
          isVisible={isAdminDebugVisible}
          onClose={() => setIsAdminDebugVisible(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
});
