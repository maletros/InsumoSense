// src/components/StockList/StockList.js
import React, { useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { debounce } from "lodash";
import StockItem from "../StockItem/StockItem";
import AdminDebug from "../AdminDebug/AdminDebug";
import { formatCategory, sortCategories } from "../../utils/categoryUtils";

const MemoizedStockItem = React.memo(StockItem);

const StockList = React.memo(function StockList({
  stock,
  onLogout,
  user,
  onRefresh,
}) {
  const [filter, setFilter] = useState("Todos");
  const [sortOrder, setSortOrder] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isDebugVisible, setIsDebugVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [visibleItems, setVisibleItems] = useState(new Set());

  const viewabilityConfig = useMemo(
    () => ({
      viewAreaCoveragePercentThreshold: 50,
      minimumViewTime: 100,
    }),
    []
  );

  const handleViewableItemsChanged = useCallback(({ viewableItems }) => {
    setVisibleItems(new Set(viewableItems.map((item) => item.item.id)));
  }, []);

  const viewabilityConfigCallbackPairs = useMemo(
    () => [
      {
        viewabilityConfig,
        onViewableItemsChanged: handleViewableItemsChanged,
      },
    ],
    [handleViewableItemsChanged, viewabilityConfig]
  );

  const categories = useMemo(() => {
    const categorySet = new Set(
      stock.map((item) => formatCategory(item.category))
    );
    return [
      "Todos",
      "Em Estoque",
      "Sem Estoque",
      "Expirados",
      ...Array.from(categorySet),
    ].sort(sortCategories);
  }, [stock]);

  const filteredAndSortedStock = useMemo(() => {
    if (!stock.length) return [];

    const searchLower = searchTerm.toLowerCase();
    const currentFilter = filter;
    const currentSortOrder = sortOrder;

    const filterByCategory = (item) => {
      if (currentFilter === "Todos") return true;

      const quantity = parseInt(item.quantity);
      switch (currentFilter) {
        case "Em Estoque":
          return quantity > 0;
        case "Sem Estoque":
          return quantity === 0;
        case "Expirados":
          return new Date(item.expirationDate) < new Date();
        default:
          return formatCategory(item.category) === currentFilter;
      }
    };

    const filterBySearch = (item) => {
      if (!searchLower) return true;
      return (
        item.name.toLowerCase().includes(searchLower) ||
        item.id.toLowerCase().includes(searchLower)
      );
    };

    const filterItem = (item) => {
      return filterByCategory(item) && filterBySearch(item);
    };

    const sortItems = (a, b) => {
      switch (currentSortOrder) {
        case "name":
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        case "quantity":
          return (parseInt(a.quantity) || 0) - (parseInt(b.quantity) || 0);
        case "expirationDate":
          if (a.expirationDate === "INDETERMINADO") return 1;
          if (b.expirationDate === "INDETERMINADO") return -1;
          return new Date(a.expirationDate) - new Date(b.expirationDate);
        default:
          return 0;
      }
    };

    return stock.filter(filterItem).sort(sortItems);
  }, [stock, filter, sortOrder, searchTerm]);

  const itemCount = useMemo(() => {
    return filteredAndSortedStock.length;
  }, [filteredAndSortedStock]);

  const debouncedSearch = useMemo(
    () =>
      debounce((text) => {
        setSearchTerm(text);
      }, 300),
    []
  );

  const handleTextChange = useCallback(
    (text) => {
      setInputValue(text);
      debouncedSearch(text);
    },
    [debouncedSearch]
  );

  const handleFilterChange = useCallback((itemValue) => {
    setFilter(itemValue);
  }, []);

  const resetFilters = useCallback(() => {
    setFilter("Todos");
    setSortOrder("name");
    setSearchTerm("");
    setInputValue("");
  }, []);

  const handleScrollBegin = useCallback(() => {
    setIsScrolling(true);
  }, []);

  const handleScrollEnd = useCallback(() => {
    setIsScrolling(false);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  const renderItem = useCallback(
    ({ item, index }) => (
      <MemoizedStockItem
        item={item}
        isVisible={visibleItems.has(item.id)}
        isScrolling={isScrolling}
        index={index}
      />
    ),
    [isScrolling, visibleItems]
  );

  const keyExtractor = useCallback((item) => item.id, []);

  const renderContent = () => {
    if (filteredAndSortedStock.length > 0) {
      return (
        <FlatList
          data={filteredAndSortedStock}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={21}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onEndReachedThreshold={0.5}
          scrollEventThrottle={16}
          onMomentumScrollBegin={handleScrollBegin}
          onMomentumScrollEnd={handleScrollEnd}
          onScrollBeginDrag={handleScrollBegin}
          onScrollEndDrag={handleScrollEnd}
          viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs}
          contentContainerStyle={styles.flatListContent}
        />
      );
    }
    return (
      <View style={styles.noResultsContainer}>
        <Ionicons name="search-outline" size={48} color="#999" />
        <Text style={styles.noResultsText}>Nenhum item encontrado</Text>
        <Text style={styles.noResultsSubtext}>
          Tente ajustar os filtros de busca
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Monitoramento de Estoque</Text>
          <View style={styles.headerButtons}>
            {user?.role === "admin" && (
              <TouchableOpacity
                style={styles.debugButton}
                onPress={() => setIsDebugVisible(true)}
              >
                <Text style={styles.debugButtonText}>Debug</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nome ou ID"
              onChangeText={handleTextChange}
              value={inputValue}
              placeholderTextColor="#999"
            />
            {inputValue ? (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setInputValue("");
                  setSearchTerm("");
                }}
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
            <Text style={styles.resetButtonText}>Limpar Filtros</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filters}>
          <Picker
            selectedValue={filter}
            onValueChange={handleFilterChange}
            style={styles.picker}
          >
            {categories.map((category) => (
              <Picker.Item key={category} label={category} value={category} />
            ))}
          </Picker>
          <Picker
            selectedValue={sortOrder}
            onValueChange={setSortOrder}
            style={styles.picker}
          >
            <Picker.Item label="Nome" value="name" />
            <Picker.Item label="Quantidade" value="quantity" />
            <Picker.Item label="Data de Validade" value="expirationDate" />
          </Picker>
        </View>

        <View style={styles.resultInfo}>
          <Text style={styles.resultCount}>
            {itemCount} {itemCount === 1 ? "item" : "itens"} encontrado
            {itemCount === 1 ? "" : "s"}
          </Text>
        </View>

        {renderContent()}

        <AdminDebug
          isVisible={isDebugVisible}
          onClose={() => setIsDebugVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
});

StockList.propTypes = {
  stock: PropTypes.array,
  onLogout: PropTypes.func.isRequired,
  user: PropTypes.shape({
    role: PropTypes.string,
  }),
  onRefresh: PropTypes.func.isRequired,
};

StockList.defaultProps = {
  stock: [],
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  innerContainer: {
    flex: 1,
    alignSelf: "center",
    width: "100%",
    maxWidth: 600,
    padding: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  debugButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  debugButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  logoutButton: {
    padding: 5,
  },
  searchSection: {
    marginBottom: 10,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingLeft: 10,
    paddingRight: 30,
    fontSize: 14,
  },
  clearButton: {
    padding: 8,
    position: "absolute",
    right: 0,
  },
  resetButton: {
    alignSelf: "flex-end",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  resetButtonText: {
    color: "#007AFF",
    fontSize: 12,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  picker: {
    flex: 1,
    minWidth: 150,
    marginBottom: 10,
  },
  resultInfo: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginBottom: 10,
  },
  resultCount: {
    fontSize: 14,
    color: "#666",
  },
  flatListContent: {
    flexGrow: 1,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noResultsText: {
    fontSize: 18,
    color: "#666",
    marginTop: 10,
    fontWeight: "500",
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
  },
});

export default StockList;
