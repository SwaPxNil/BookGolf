import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../theme/ThemeContext";

export default function CaddiesListScreen({ navigation, route }) {
  const { theme, mode } = useTheme();
  const { width } = useWindowDimensions();
  const [searchQuery, setSearchQuery] = useState("");

  const title = route?.params?.title || "ALL CADDIES";
  const caddies = Array.isArray(route?.params?.caddies) ? route.params.caddies : [];

  const filteredCaddies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return caddies;
    }

    return caddies.filter((caddie) => String(caddie?.name || "").toLowerCase().includes(query));
  }, [caddies, searchQuery]);

  const renderCaddieItem = ({ item }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.rowCard, { backgroundColor: theme.card }]}
        onPress={() => navigation.navigate("CaddieBooking", { caddieId: item.id, caddie: item })}
      >
        <Image
          source={item.imageUrl ? { uri: item.imageUrl } : require("../assets/images/caddie1.png")}
          style={[styles.caddieImage, { width: width * 0.28, height: width * 0.28 }]}
        />

        <View style={styles.contentBlock}>
          <View style={styles.topRow}>
            <Text numberOfLines={1} style={[styles.caddieName, { color: theme.textPrimary }]}>
              {item.name}
            </Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{Number(item.rating || 0).toFixed(1)}</Text>
            </View>
          </View>

          <Text numberOfLines={1} style={[styles.metaLine, { color: theme.accent }]}>
            {item.courseName}
          </Text>

          <Text numberOfLines={1} style={[styles.metaLine, { color: "#FAFF5D" }]}>
            {item.matches} • {item.experience}
          </Text>

          <Text numberOfLines={3} style={[styles.description, { color: theme.textSecondary }]}>
            {item.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}> 
      <StatusBar style={mode === "dark" ? "light" : "dark"} />

      <View style={styles.headerRow}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.goBack()}>
          <Image
            source={require("../assets/icons/Back.png")}
            style={[styles.backIcon, { tintColor: theme.icon }]}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{title}</Text>
      </View>

      <View style={[styles.searchRow, { borderColor: theme.line }]}> 
        <Ionicons name="search-outline" size={20} color={theme.textSecondary} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search caddie"
          placeholderTextColor={theme.textSecondary}
          style={[styles.searchInput, { color: theme.textPrimary }]}
        />
      </View>

      <FlatList
        data={filteredCaddies}
        keyExtractor={(item, index) => item?.id || String(index)}
        renderItem={renderCaddieItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No caddies found.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  backIcon: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    marginLeft: 14,
    fontFamily: "Bebas",
    fontSize: 30,
    letterSpacing: 0.6,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 14,
    borderBottomWidth: 1,
    paddingBottom: 6,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: "Abel",
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  rowCard: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 10,
    marginBottom: 12,
    overflow: "hidden",
  },
  caddieImage: {
    borderRadius: 14,
  },
  contentBlock: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  caddieName: {
    flex: 1,
    fontFamily: "Bebas",
    fontSize: 24,
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ratingText: {
    marginLeft: 4,
    color: "#FFFFFF",
    fontFamily: "Abel",
    fontSize: 14,
  },
  metaLine: {
    marginTop: 2,
    fontFamily: "Abel",
    fontSize: 15,
  },
  description: {
    marginTop: 6,
    fontFamily: "Abel",
    fontSize: 15,
    lineHeight: 20,
  },
  emptyText: {
    marginTop: 28,
    textAlign: "center",
    fontFamily: "Abel",
    fontSize: 16,
  },
});
