import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import Header from "../components/Header";
import Navbar from "../components/Navbar";
import { useCoaches } from "../hooks/useCoach";
import { useMyProfile } from "../hooks/useAuth";
import { useTheme } from "../theme/ThemeContext";

export default function CoachesScreen({ navigation }) {
  const { theme, mode } = useTheme();
  const [currentTab, setCurrentTab] = useState("coach");
  const [searchQuery, setSearchQuery] = useState("");
  // Destructure height here as well
  const { width, height } = useWindowDimensions();
  const { data: coachesResponse, refetch: refetchCoaches } = useCoaches({ retry: false });
  const { data: profileData } = useMyProfile({ retry: false });
  const [refreshing, setRefreshing] = useState(false);
  const profile = profileData?.data?.data ?? profileData?.data ?? {};
  const avatarSource = profile?.profile_img
    ? { uri: profile.profile_img }
    : require("../assets/images/Avatar.png");

  const coaches = Array.isArray(coachesResponse?.data?.data)
    ? coachesResponse.data.data.map((coach) => {
        const numericRating = Number(
          coach?.rating ?? coach?.average_rating ?? coach?.avg_rating ?? 0
        );

        return {
        id: coach?._id,
        name: coach?.full_name || "Unnamed Coach",
        experience: `${coach?.experience_years ?? 0} years experience`,
        rating: Number.isFinite(numericRating) ? numericRating : 0,
        status:
          Array.isArray(coach?.availability_slots) && coach.availability_slots.length > 0
            ? "available"
            : "busy",
        imageUrl: coach?.profile_img || coach?.image_url || null,
      };
    })
    : [];

  const filtered = coaches.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topRated = [...filtered]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);
  const available = filtered.filter((c) => c.status === "available");

  const onTabPress = (tab) => navigation.navigate(tab);

  const handleCoachPress = (coach) => {
    navigation.navigate("CoachDetails", { coachId: coach.id, coach });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchCoaches();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}> 
      <StatusBar style={mode === "dark" ? "light" : "dark"} />

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
        title="COACHES"
        subtitle="Expert Mentors Behind Every Swing"
      />

      <View style={[styles.searchRow, { marginHorizontal: width * 0.05 }]}>
        <Ionicons name="search-outline" size={20} color={theme.textSecondary} />
        <TextInput
          placeholder="Search"
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchInput, { width: width * 0.7, color: theme.textPrimary }]}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: height * 0.18 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#333" />
        }
      >
        {/* Pass height down here */}
        <CoachSection
          title="TOP RATED"
          coaches={topRated}
          width={width}
          height={height}
          theme={theme}
          onPress={handleCoachPress}
        />

        <CoachSection
          title="AVAILABLE NOW"
          coaches={available}
          width={width}
          height={height}
          theme={theme}
          onPress={handleCoachPress}
        />
      </ScrollView>

      <Navbar
        currentTab={currentTab}
        onTabPress={onTabPress}
        onPressMiddle={() => navigation.navigate("CourseScreen")}
      />
    </SafeAreaView>
  );
}

// Receive height in props
const CoachSection = ({ title, coaches, width, height, onPress, theme }) => (
  <View style={styles.sectionContainer}>
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{title}</Text>
      <Text style={[styles.viewAll, { color: theme.accent }]}>view all</Text>
    </View>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {coaches.map((coach, index) => (
        <CoachCard
          key={coach.id}
          coach={coach}
          width={width}
          height={height} // Pass height down to the card
          isFirst={index === 0}
          onPress={() => onPress(coach)}
        />
      ))}
    </ScrollView>
  </View>
);

// Receive height in props and apply it to the card styles
const CoachCard = ({ coach, width, height, isFirst, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.card,
        {
          width: width * 0.40,
          height: height * 0.23, 
          marginLeft: isFirst ? 0 : 10,
        },
      ]}
    >
      <Image
        source={
          coach.imageUrl
            ? { uri: coach.imageUrl }
            : require("../assets/images/coach1.png")
        }
        style={styles.cardImage}
      />

      <View style={styles.rating}>
        <Ionicons name="star" size={14} color="#FFD700" />
        <Text style={styles.ratingText}>{coach.rating.toFixed(1)}</Text>
      </View>

      <View style={styles.overlay}>
        <Text style={styles.name}>{coach.name}</Text>
        <Text style={styles.exp}>{coach.experience}</Text>
      </View>
    </TouchableOpacity>
  );
};

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
    fontSize: 22,
    fontFamily: "Bebas",
    letterSpacing: 0.5,
  },
  exp: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Abel",
  },
});