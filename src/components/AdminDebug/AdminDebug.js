// src/components/AdminDebug/AdminDebug.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { authService } from "../../services";
import PropTypes from "prop-types";

const UserCard = React.memo(({ user, onDelete }) => (
  <View style={styles.userCard}>
    <View style={styles.userInfo}>
      <Text style={styles.userName}>{user.name}</Text>
      <Text style={styles.userEmail}>{user.email}</Text>
      <View style={styles.roleContainer}>
        <Text
          style={[
            styles.userRole,
            { color: user.role === "admin" ? "#007AFF" : "#666" },
          ]}
        >
          {user.role === "admin" ? "Administrador" : "Usuário"}
        </Text>
        <Text style={styles.userId}>ID: {user.id}</Text>
      </View>
    </View>
    <TouchableOpacity
      style={[
        styles.deleteButton,
        user.email === "admin@admin.com" && styles.deleteButtonDisabled,
      ]}
      onPress={() => onDelete(user.id, user.email)}
      disabled={user.email === "admin@admin.com"}
    >
      <Ionicons name="trash-outline" size={20} color="#fff" />
    </TouchableOpacity>
  </View>
));

const AdminDebug = ({ isVisible, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await authService.getAllUsers();
      // Adicione o ID do documento como um campo 'id' para cada usuário
      const usersWithId = allUsers.map((user) => ({
        ...user,
        id: user.id || user.uid, // Dependendo de como o Firebase retorna o ID
      }));
      setUsers(usersWithId);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      Alert.alert("Erro", "Não foi possível carregar os usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      loadUsers();
    }
  }, [isVisible]);

  const handleDeleteUser = (userId, userEmail) => {
    console.log("Tentando deletar usuário:", userId, userEmail);
    if (userEmail === "admin@admin.com") {
      Alert.alert(
        "Ação não permitida",
        "Não é possível excluir o administrador principal"
      );
      return;
    }

    Alert.alert(
      "Confirmar exclusão",
      `Deseja realmente excluir a conta:\n${userEmail}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("Iniciando processo de exclusão para:", userId);
              setLoading(true);
              console.log("Chamando authService.deleteUser");
              const result = await authService.deleteUser(userId);
              console.log("Resultado de authService.deleteUser:", result);
              console.log("Recarregando lista de usuários");
              await loadUsers();
              console.log("Lista de usuários recarregada");
              Alert.alert("Sucesso", "Usuário excluído com sucesso");
            } catch (error) {
              console.error("Erro ao excluir usuário:", error);
              Alert.alert(
                "Erro",
                "Não foi possível excluir o usuário: " + error.message
              );
            } finally {
              setLoading(false);
              console.log("Processo de exclusão finalizado");
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Gerenciamento de Usuários</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Carregando usuários...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.userList}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.subtitle}>
              {users.length} usuário{users.length !== 1 ? "s" : ""} registrado
              {users.length !== 1 ? "s" : ""}
            </Text>
            {users.map((user) => (
              <UserCard key={user.id} user={user} onDelete={handleDeleteUser} />
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  userList: {
    flex: 1,
    padding: 16,
  },
  userCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userRole: {
    fontSize: 14,
    fontWeight: "500",
  },
  userId: {
    fontSize: 12,
    color: "#999",
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  deleteButtonDisabled: {
    backgroundColor: "#ccc",
  },
});

AdminDebug.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

UserCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default AdminDebug;
