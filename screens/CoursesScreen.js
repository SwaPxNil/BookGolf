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
import { useCourses } from "../hooks/useCourse";
import { useMyProfile } from "../hooks/useAuth";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const ITEM_WIDTH = SCREEN_WIDTH * 0.75;
const ITEM_SPACING = (SCREEN_WIDTH - ITEM_WIDTH) / 2;

export default function CoursesScreen() {
  const navigation = useNavigation();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentTab, setCurrentTab] = useState("courses");
  const { width, height } = useWindowDimensions();
  const { data: coursesResponse, refetch: refetchCourses } = useCourses({ retry: false });
  const { data: profileData } = useMyProfile({ retry: false });
  const [refreshing, setRefreshing] = useState(false);
  const profile = profileData?.data?.data ?? profileData?.data ?? {};
  const avatarSource = profile?.profile_img
    ? { uri: profile.profile_img }
    : require("../assets/images/Avatar.png");

  const courses = Array.isArray(coursesResponse?.data?.data)
    ? coursesResponse.data.data
    : [];

  const uiCourses = courses.map((course, index) => ({
    id: course?._id ?? String(index),
    name: course?.name ?? "Unnamed Course",
    description:
      course?.description ||
      course?.location ||
      "Course details are currently unavailable.",
    location: course?.location || "Location unavailable",
    imageUrl: course?.image_url || null,
    raw: course,
  }));

  const fallbackCourses = [
    {
      id: "fallback-1",
      name: "COURSE DATA UNAVAILABLE",
      description: "Unable to load courses from server right now.",
      location: "Please try again",
      imageUrl: null,
      raw: null,
    },
  ];

  const coursesToRender = uiCourses.length > 0 ? uiCourses : fallbackCourses;

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleStartRound = () => {
    const selectedCourse = coursesToRender[activeIndex] || coursesToRender[0];
    navigation.navigate("ReservationScreen", { course: selectedCourse?.raw || selectedCourse });
  };

  const onTabPress = (tab) => {
    setCurrentTab(tab);
    navigation.navigate(tab);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchCourses();
    } finally {
      setRefreshing(false);
    }
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
          <Image
            source={
              item.imageUrl
                ? { uri: item.imageUrl }
                : require("../assets/images/course1.png")
            }
            style={styles.cardImage}
          />

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

      <TouchableOpacity
        style={[
          styles.profileContainer,
          { top: height * 0.055, right: width * 0.05 },
        ]}
        onPress={() => navigation.navigate("profile")}
      >
        <Image
          source={avatarSource}
          style={styles.profileImage}
        />
      </TouchableOpacity>

      <Header
        title="COURSES"
        subtitle="Choose a course to begin your round."
      />

      <View style={styles.locationRow}>
        <Ionicons name="globe-outline" size={14} color="#333" />
        <Text style={styles.locationText}>
          {coursesToRender[activeIndex]?.location || "Location unavailable"}
        </Text>
      </View>

      <View style={styles.contentBody}>
        <View style={styles.carouselContainer}>
          <Animated.FlatList
            data={coursesToRender}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={handleRefresh}
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

        <TouchableOpacity style={styles.startBtn} onPress={handleStartRound}>
          <Ionicons name="flag" size={20} color="#FFF" style={styles.flagIcon} />
          <Text style={styles.startBtnText}>START ROUND</Text>
        </TouchableOpacity>
      </View>

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
    marginTop: 30,
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
