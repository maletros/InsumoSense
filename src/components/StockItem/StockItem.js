// src/components/StockItem/StockItem.js
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Animated,
  Vibration,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { stockUtils } from "../../services";

const COLORS = {
  IN_STOCK: {
    background: "#e8f5e9",
    border: "#81c784",
    text: "#2e7d32",
    icon: "#43a047",
  },
  LOW_STOCK: {
    background: "#fff3e0",
    border: "#ffb74d",
    text: "#ef6c00",
    icon: "#f57c00",
  },
  OUT_OF_STOCK: {
    background: "#ffebee",
    border: "#e57373",
    text: "#c62828",
    icon: "#d32f2f",
  },
  EXPIRED: {
    background: "#fce4ec",
    border: "#f48fb1",
    text: "#c2185b",
    icon: "#d81b60",
  },
  NEAR_EXPIRATION: {
    background: "#fff8e1",
    border: "#ffd54f",
    text: "#ff8f00",
    icon: "#ffa000",
  },
};

const ActionButton = ({ onPress, icon, label, color = "#007AFF" }) => (
  <TouchableOpacity
    style={[styles.actionButton, { borderColor: color }]}
    onPress={onPress}
  >
    <Ionicons name={icon} size={24} color={color} />
    <Text style={[styles.actionButtonText, { color }]}>{label}</Text>
  </TouchableOpacity>
);

const StockItem = React.memo(function StockItem({
  item,
  onUpdate,
  onDelete,
  showDetails = true,
  onLayout,
}) {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const scaleValue = new Animated.Value(1);

  const { colors, statusText, statusIcon } = useMemo(() => {
    const quantity = parseInt(item.quantity, 10);
    const isExpired = stockUtils.isExpired(item);
    const isNearExpiration = stockUtils.isNearExpiration(item);
    const isLowStock = quantity > 0 && quantity <= 5;

    if (quantity === 0) {
      return {
        colors: COLORS.OUT_OF_STOCK,
        statusText: "Sem Estoque",
        statusIcon: "alert-circle",
      };
    }

    if (isExpired) {
      return {
        colors: COLORS.EXPIRED,
        statusText: "Expirado",
        statusIcon: "warning",
      };
    }

    if (isNearExpiration) {
      return {
        colors: COLORS.NEAR_EXPIRATION,
        statusText: "Próximo ao Vencimento",
        statusIcon: "time",
      };
    }

    if (isLowStock) {
      return {
        colors: COLORS.LOW_STOCK,
        statusText: "Estoque Baixo",
        statusIcon: "alert",
      };
    }

    return {
      colors: COLORS.IN_STOCK,
      statusText: "Em Estoque",
      statusIcon: "checkmark-circle",
    };
  }, [item]);

  const formattedDate = useMemo(() => {
    if (item.expirationDate === "INDETERMINADO") return "Indeterminado";
    try {
      const date = new Date(item.expirationDate);
      return date.toLocaleDateString("pt-BR");
    } catch {
      return item.expirationDate;
    }
  }, [item.expirationDate]);

  const handlePress = () => {
    setIsExpanded(!isExpanded);
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLongPress = () => {
    Vibration.vibrate(50);
    setModalVisible(true);
  };

  const handleUpdateQuantity = (increment) => {
    const newQuantity = parseInt(item.quantity) + increment;
    if (newQuantity >= 0) {
      onUpdate &&
        onUpdate({
          ...item,
          quantity: newQuantity.toString(),
        });
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Confirmar exclusão",
      `Deseja realmente excluir ${item.name}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            setModalVisible(false);
            onDelete && onDelete(item);
          },
        },
      ]
    );
  };

  return (
    <React.Fragment>
      <Animated.View
        style={{ transform: [{ scale: scaleValue }] }}
        onLayout={(event) => onLayout && onLayout(event, item.id)}
      >
        <TouchableOpacity
          style={[
            styles.container,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
          onPress={handlePress}
          onLongPress={handleLongPress}
          activeOpacity={0.7}
        >
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text
                style={[styles.name, { color: colors.text }]}
                numberOfLines={2}
              >
                {item.name}
              </Text>
              <Text style={[styles.id, { color: colors.text }]}>
                ID: {item.id}
              </Text>
            </View>
            <Ionicons
              name={statusIcon}
              size={24}
              color={colors.icon}
              style={styles.statusIcon}
            />
          </View>

          {(showDetails || isExpanded) && (
            <View
              style={[
                styles.infoContainer,
                isExpanded && styles.expandedContent,
              ]}
            >
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colors.text }]}>
                    Quantidade
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {item.quantity}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colors.text }]}>
                    Categoria
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {item.category}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colors.text }]}>
                    Validade
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {formattedDate}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colors.text }]}>
                    Status
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {statusText}
                  </Text>
                </View>
              </View>

              {item.observacao ? (
                <View style={styles.observationContainer}>
                  <Text
                    style={[styles.observationLabel, { color: colors.text }]}
                  >
                    Observação:
                  </Text>
                  <Text
                    style={[styles.observationText, { color: colors.text }]}
                  >
                    {item.observacao}
                  </Text>
                </View>
              ) : null}
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{item.name}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.quantityControls}>
              <ActionButton
                icon="remove-circle"
                label="Diminuir"
                color="#FF3B30"
                onPress={() => handleUpdateQuantity(-1)}
              />
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <ActionButton
                icon="add-circle"
                label="Aumentar"
                color="#34C759"
                onPress={() => handleUpdateQuantity(1)}
              />
            </View>

            <View style={styles.actionButtons}>
              <ActionButton
                icon="create"
                label="Editar"
                onPress={() => {
                  setModalVisible(false);
                  // Adicionar lógica de edição
                }}
              />
              <ActionButton
                icon="trash"
                label="Excluir"
                color="#FF3B30"
                onPress={handleDelete}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </React.Fragment>
  );
});

const styles = StyleSheet.create({
  container: {
    minHeight: 150,
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  id: {
    fontSize: 12,
    opacity: 0.8,
  },
  statusIcon: {
    marginTop: 2,
  },
  infoContainer: {
    marginTop: 12,
  },
  expandedContent: {
    marginTop: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  observationContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 4,
  },
  observationLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
  },
  observationText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    marginRight: 10,
  },
  modalCloseButton: {
    padding: 5,
  },
  quantityControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  quantityText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  actionButton: {
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 100,
  },
  actionButtonText: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: "500",
  },
});

export default StockItem;
