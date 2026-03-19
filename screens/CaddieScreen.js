import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import Header from "../components/Header";
import Navbar from "../components/Navbar";

export default function CaddieScreen({ navigation }) {
  const [currentTab, setCurrentTab] = useState("caddie");
  const [searchQuery, setSearchQuery] = useState("");
  const { width, height } = useWindowDimensions();

  const caddies = [
    {
      id: 1,
      name: "Deepak Adhikari",
      matches: "430+ matches",
      rating: 4.3,
      status: "available",
      image: require("../assets/images/caddie1.png"),
      experience: "5 years",
      speciality: "Wind and Green Reading"
    },
    {
      id: 2,
      name: "Ramesh Karki",
      matches: "430+ matches",
      rating: 4.3,
      status: "available",
      image: require("../assets/images/caddie2.png"),
      experience: "5 years",
      speciality: "Wind and Green Reading"


    },
    {
      id: 3,
      name: "Roshan Rai",
      matches: "430+ matches",
      rating: 4.3,
      status: "available",
      image: require("../assets/images/caddie3.png"),
      experience: "5 years",
      speciality: "Wind and Green Reading"
    },
    {
      id: 4,
      name: "Manoj Acharya",
      matches: "430+ matches",
      rating: 4.3,
      status: "available",
      image: require("../assets/images/caddie4.png"),
      experience: "5 years",
      speciality: "Wind and Green Reading"

    },
  ];

  const filtered = caddies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topRated = [...filtered].slice(0, 4);
  const available = filtered.filter((c) => c.status === "available");

  const onTabPress = (tab) => navigation.navigate(tab);

  const handleCaddiePress = (caddie) => {
    navigation.navigate("CaddieBooking", { caddie });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* PROFILE */}
      <TouchableOpacity
        style={[
          styles.profileContainer,
          { top: height * 0.055, right: width * 0.05 },
        ]}
        onPress={() => navigation.navigate("profile")}
      >
        <Image
          source={require("../assets/images/Avatar.png")}
          style={styles.profileImage}
        />
      </TouchableOpacity>

      {/* HEADER */}
      <Header
        title="HIRE A CADDIE"
        subtitle="Support that elevates every shot."
      />

      {/* SEARCH */}
      <View style={[styles.searchRow, { marginHorizontal: width * 0.05 }]}>
        <Ionicons name="search-outline" size={20} color="#333" />
        <TextInput
          placeholder="Search"
          placeholderTextColor="#555"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchInput, { width: width * 0.7 }]}
        />
      </View>

      {/* CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: height * 0.18 }}
      >
        {/* TOP RATED */}
        <CaddieSection
          title="TOP RATED"
          caddies={topRated}
          width={width}
          onPress={handleCaddiePress}
        />

        {/* AVAILABLE */}
        <CaddieSection
          title="AVAILABLE NOW"
          caddies={available}
          width={width}
          onPress={handleCaddiePress}
        />
      </ScrollView>

      {/* NAVBAR */}
      <Navbar
        currentTab={currentTab}
        onTabPress={onTabPress}
        onPressMiddle={() => navigation.navigate("CourseScreen")}
      />
    </SafeAreaView>
  );
}


const CaddieSection = ({ title, caddies, width, onPress }) => (
  <View style={styles.sectionContainer}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.viewAll}>view all</Text>
    </View>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {caddies.map((caddie, index) => (
        <CaddieCard
          key={caddie.id}
          caddie={caddie}
          width={width}
          isFirst={index === 0}
          onPress={() => onPress(caddie)}
        />
      ))}
    </ScrollView>
  </View>
);

const CaddieCard = ({ caddie, width, isFirst, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.card,
        {
          width: width * 0.4,
          marginLeft: isFirst ? 0 : 10,
        },
      ]}
    >
      <Image source={caddie.image} style={styles.cardImage} />

      {/* Rating */}
      <View style={styles.rating}>
        <Ionicons name="star" size={14} color="#FFD700" />
        <Text style={styles.ratingText}>{caddie.rating}</Text>
      </View>

      {/* Overlay */}
      <View style={styles.overlay}>
        <Text style={styles.name}>{caddie.name}</Text>
        <Text style={styles.exp}>{caddie.matches}</Text>
      </View>
    </TouchableOpacity>
  );
};

//////////////// STYLES //////////////////

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E1D3",
  },
  profileContainer: {
    position: "absolute",
    width: 45,
    height: 45,
    borderRadius: 25,
    overflow: "hidden",
    zIndex: 10,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#333",
    marginTop: 10,
    paddingBottom: 6,
  },
  searchInput: {
    fontSize: 16,
    marginLeft: 10,
    fontFamily: "Abel",
  },
  sectionContainer: {
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Bebas",
  },
  viewAll: {
    fontSize: 16,
    textDecorationLine: "underline",
    fontFamily: "Abel",
  },
  scrollContent: {
    paddingHorizontal: 20, 
  },
  card: {
    height: 190,
    borderRadius: 30,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  rating: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ratingText: {
    color: "#fff",
    marginLeft: 4,
    fontSize: 12,
  },
  overlay: {
    position: "absolute",
    bottom: 15,
    left: 12,
  },
  name: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Bebas",
    letterSpacing: 1,
  },
  exp: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Abel",
  },
});