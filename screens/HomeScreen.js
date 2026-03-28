import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Navbar from "../components/Navbar";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useDashboard } from "../hooks/useDashboard";
import { useMyProfile } from "../hooks/useAuth";
import { useMyRounds } from "../hooks/useRound";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [currentTab, setCurrentTab] = useState("home");
  const [period, setPeriod] = useState(getTimePeriod());
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    refetch: refetchDashboard,
  } = useDashboard({ retry: false });
  const { data: profileData, refetch: refetchProfile } = useMyProfile({ retry: false });
  const { data: roundsData, refetch: refetchRounds } = useMyRounds({ retry: false });

  function getTimePeriod() {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    if (hour < 20) return "evening";
    return "night";
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const newPeriod = getTimePeriod();
      if (newPeriod !== period) {
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
        setPeriod(newPeriod);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [period]);

  const dashboard = dashboardData?.data?.data ?? dashboardData?.data ?? null;
  const profile = profileData?.data?.data ?? profileData?.data ?? {};
  const avatarSource = profile?.profile_img
    ? { uri: profile.profile_img }
    : require("../assets/images/Avatar.png");
  const isAdmin = profile?.role === "COURSE_ADMIN" || profile?.role === "SUPER_ADMIN";
  const rounds = Array.isArray(roundsData?.data?.data)
    ? roundsData.data.data
    : Array.isArray(roundsData?.data)
    ? roundsData.data
    : [];
  const recentRounds = rounds.slice(0, 3);
  const recentBookings = Array.isArray(dashboard?.recentBookings) ? dashboard.recentBookings.slice(0, 5) : [];
  const dashboardSubtitle =
    dashboard?.summary_text ||
    dashboard?.message ||
    dashboard?.subtitle;
  const userName = profile?.full_name || "GOLFER";

  const ui = {
    morning: { text: `GOOD MORNING,\n${userName.toUpperCase()}!`, sub: "Welcome back" },
    afternoon: { text: `GOOD AFTERNOON,\n${userName.toUpperCase()}!`, sub: "Hope your day is going well" },
    evening: { text: `GOOD EVENING,\n${userName.toUpperCase()}!`, sub: "Relax and continue learning" },
    night: { text: `GOOD NIGHT,\n${userName.toUpperCase()}!`, sub: "Unwind with a quick lesson" },
  }[period];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchDashboard(), refetchProfile(), refetchRounds()]);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingHorizontal: width * 0.06 }]}>
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

      <TouchableOpacity
        style={[
          styles.searchContainer,
          { top: height * 0.055, right: width * 0.18 },
        ]}
        onPress={() => navigation.navigate("SearchScreen")}
      >
        <Ionicons name="search" size={22} color="#000" />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: height * 0.2 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#333" />
        }
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[styles.title, { fontSize: width * 0.12, marginTop: height * 0.1 }]}>
            {ui.text}
          </Text>

          <Text style={[styles.subtitle, { fontSize: width * 0.04 }]}>
            {dashboardLoading ? "Loading dashboard..." : dashboardSubtitle || ui.sub}
          </Text>

          <Text style={[styles.sectionTitle, { fontSize: width * 0.06, marginTop: height * 0.05 }]}>
            {isAdmin ? "RECENT BOOKINGS" : "RECENT LESSONS"}
          </Text>

          <View style={[styles.lessonCard, { borderRadius: width * 0.07 }]}>
            {isAdmin
              ? recentBookings.map((booking, index) => {
                  const subjectName =
                    booking?.booking_type === "TEE_TIME"
                      ? booking?.course_id?.name || "Course tee time"
                      : booking?.booking_type === "COACH"
                      ? booking?.coach_id?.full_name || "Coach lesson"
                      : booking?.caddie_id?.full_name || "Caddie booking";

                  return (
                    <View key={`${booking?._id ?? index}`} style={styles.lessonRow}>
                      <View style={styles.lessonTextBlock}>
                        <Text style={styles.lessonText}>
                          {booking?.user_id?.full_name || "User"} - {subjectName}
                        </Text>
                        <Text style={styles.lessonMeta}>
                          {(booking?.booking_type || "").replace("_", " ")} - {booking?.status || "CONFIRMED"}
                        </Text>
                      </View>
                      <Text style={styles.lessonScore}>
                        {booking?.slot ? new Date(booking.slot).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "-"}
                      </Text>
                    </View>
                  );
                })
              : recentRounds.map((round, index) => (
                  <View key={`${round?.id ?? round?._id ?? index}`} style={styles.lessonRow}>
                    <Text style={styles.lessonText}>{round?.date || round?.played_at || "Round"}</Text>
                    <Text style={styles.lessonScore}>{round?.score ?? round?.total_score ?? "-"}</Text>
                  </View>
                ))}
            {isAdmin && recentBookings.length === 0 ? (
              <Text style={styles.lessonEmpty}>No recent bookings found.</Text>
            ) : null}
            {!isAdmin && recentRounds.length === 0 ? (
              <Text style={styles.lessonEmpty}>No recent rounds found.</Text>
            ) : null}
          </View>

          <Text style={[styles.sectionTitle, { fontSize: width * 0.06, marginTop: height * 0.05 }]}>
            COURSE LAYOUT
          </Text>
        </Animated.View>
      </ScrollView>

      <Navbar
        currentTab={currentTab}
        onTabPress={(tab) => navigation.navigate(tab)}
        onPressMiddle={() => navigation.navigate("CourseScreen")}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E7E2D3",
  },

  profileContainer: {
    position: "absolute",
    width: 45,
    height: 45,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "#ccc",
    zIndex: 10,
  },

  searchContainer: {
    position: "absolute",
    width: 45,
    height: 45,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  profileImage: {
    width: "100%",
    height: "100%",
  },

  title: {
    color: "#222",
    fontFamily: "Bebas",
  },

  subtitle: {
    color: "#000",
    marginTop: 4,
    fontFamily: "Abel",
  },

  sectionTitle: {
    color: "#000",
    fontFamily: "Bebas",
  },

  lessonCard: {
    width: "100%",
    backgroundColor: "#575757",
    marginTop: 12,
    minHeight: 120,
    padding: 14,
    justifyContent: "center",
  },
  lessonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  lessonText: {
    color: "#fff",
    fontFamily: "Abel",
    fontSize: 16,
  },
  lessonTextBlock: {
    flex: 1,
    marginRight: 12,
  },
  lessonMeta: {
    color: "#d7d7d7",
    fontFamily: "Abel",
    fontSize: 13,
    marginTop: 2,
  },
  lessonScore: {
    color: "#d5e4b2",
    fontFamily: "Bebas",
    fontSize: 24,
  },
  lessonEmpty: {
    color: "#ddd",
    fontFamily: "Abel",
    fontSize: 15,
  },
});
