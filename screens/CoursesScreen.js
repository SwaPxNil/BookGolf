import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import Header from "../components/Header"; 
import Navbar from "../components/Navbar"; 

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const ITEM_WIDTH = SCREEN_WIDTH * 0.75;
const ITEM_SPACING = (SCREEN_WIDTH - ITEM_WIDTH) / 2;

const COURSES = [
  {
    id: "1",
    name: "ROYAL NEPAL GOLF CLUB",
    description: "Historic 9-hole golf course located near Tribhuvan Airport in Kathmandu.",
    location: "Nepal, Asia",
    image: require("../assets/images/course1.png"), 
  },
  {
    id: "2",
    name: "GOKARNA FOREST RESORT",
    description: "18-hole championship golf course set within the serene Gokarna Forest.",
    location: "Nepal, Asia",
    image: require("../assets/images/course2.png"), 
  },
  {
    id: "3",
    name: "HIMALAYAN GOLF COURSE",
    description: "Spectacular gorge-side course offering unique challenges in Pokhara.",
    location: "Nepal, Asia",
    image: require("../assets/images/course1.png"), 
  },
];

export default function CoursesScreen() {
  const navigation = useNavigation();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);
const [currentTab, setCurrentTab] = useState("courses");
  const { width, height } = useWindowDimensions();

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleStartRound = () => {
    const selectedCourse = COURSES[activeIndex];
    navigation.navigate("ReservationScreen", { course: selectedCourse });
  };

  const onTabPress = (tab) => {
    setCurrentTab(tab);
    navigation.navigate(tab);
  };

  const renderItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * ITEM_WIDTH,
      index * ITEM_WIDTH,
      (index + 1) * ITEM_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.85, 1, 0.85], 
      extrapolate: "clamp",
    });

    return (
      <View style={{ width: ITEM_WIDTH }}>
        <Animated.View style={[styles.cardContainer, { transform: [{ scale }] }]}>
          <Image source={item.image} style={styles.cardImage} />
          
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </View>
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* PROFILE PIC (Absolutely positioned like your Caddie screen) */}
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

      {/* HEADER COMPONENT */}
      <Header
        title="COURSES"
        subtitle="Choose a course to begin your round."
      />

      {/* LOCATION ROW (Tucked right under the header) */}
      <View style={styles.locationRow}>
        <Ionicons name="globe-outline" size={14} color="#333" />
        <Text style={styles.locationText}>{COURSES[activeIndex].location}</Text>
      </View>

      {/* BODY */}
      <View style={styles.contentBody}>
        {/* HORIZONTAL CAROUSEL */}
        <View style={styles.carouselContainer}>
          <Animated.FlatList
            data={COURSES}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={ITEM_WIDTH}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: ITEM_SPACING }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            renderItem={renderItem}
          />
        </View>

        {/* START ROUND BUTTON */}
        <TouchableOpacity style={styles.startBtn} onPress={handleStartRound}>
          <Ionicons name="flag" size={20} color="#FFF" style={styles.flagIcon} />
          <Text style={styles.startBtnText}>START ROUND</Text>
        </TouchableOpacity>
      </View>

      {/* NAVBAR */}
      <Navbar
        currentTab={currentTab}
        onTabPress={onTabPress}
        onPressMiddle={() => {}} 
      />

    </SafeAreaView>
  );
}

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

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20, 
    marginTop: 8,
  },
  locationText: {
    fontSize: 14,
    fontFamily: "Abel",
    color: "#333",
    marginLeft: 5,
  },

  contentBody: {
    flex: 1,
    paddingBottom: 110, 
  },
  carouselContainer: {
    height: SCREEN_HEIGHT * 0.45, 
    marginTop: 25,
  },
  cardContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "#ccc",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cardTextContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 20,
    paddingTop: 60,
    backgroundColor: "rgba(0,0,0,0.4)", 
  },
  cardTitle: {
    color: "#FFF",
    fontSize: 26,
    fontFamily: "Bebas",
    marginBottom: 5,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  cardDescription: {
    color: "#FFF",
    fontSize: 15,
    fontFamily: "Abel",
    lineHeight: 20,
  },
  
  startBtn: {
    backgroundColor: "#798D3D", 
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginHorizontal: 40,
    borderRadius: 30,
    marginTop: 30
  },
  flagIcon: {
    marginRight: 10,
  },
  startBtnText: {
    color: "#FFF",
    fontSize: 22,
    fontFamily: "Bebas",
    letterSpacing: 1,
  },
});