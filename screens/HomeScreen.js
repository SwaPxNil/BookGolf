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
import { useCourses } from "../hooks/useCourse";
import { useCoaches } from "../hooks/useCoach";
import { useCaddies } from "../hooks/useCaddie";

const cardFallbacks = {
  course: require("../assets/images/course1.png"),
  coach: require("../assets/images/coach1.png"),
  caddie: require("../assets/images/caddie1.png"),
};

const resolveImageSource = (imageUrl, type) => {
  if (imageUrl) {
    return { uri: imageUrl };
  }

  return cardFallbacks[type] || cardFallbacks.course;
};

const ShortcutRow = ({ title, actionLabel, onActionPress, items, renderCard }) => (
  <View style={styles.quickSectionBlock}>
    <View style={styles.quickSectionHeader}>
      <Text style={styles.quickSectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onActionPress} activeOpacity={0.8}>
        <Text style={styles.quickSectionLink}>{actionLabel}</Text>
      </TouchableOpacity>
    </View>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.quickHorizontalList}
    >
      {items.map(renderCard)}
    </ScrollView>
  </View>
);

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
  const { data: coursesData, refetch: refetchCourses } = useCourses({ retry: false });
  const { data: coachesData, refetch: refetchCoaches } = useCoaches({ retry: false });
  const { data: caddiesData, refetch: refetchCaddies } = useCaddies({ retry: false });

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
  const courses = Array.isArray(coursesData?.data?.data) ? coursesData.data.data : [];
  const coaches = Array.isArray(coachesData?.data?.data) ? coachesData.data.data : [];
  const caddies = Array.isArray(caddiesData?.data?.data) ? caddiesData.data.data : [];
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
      await Promise.all([
        refetchDashboard(),
        refetchProfile(),
        refetchRounds(),
        refetchCourses(),
        refetchCoaches(),
        refetchCaddies(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const featuredCourses = courses.slice(0, 4).map((course, index) => ({
    id: course?._id ?? `course-${index}`,
    name: course?.name ?? "Unnamed Course",
    location: course?.location || "Location unavailable",
    imageUrl: course?.image_url || null,
    raw: course,
  }));

  const topCoaches = [...coaches]
    .sort((first, second) => Number(second?.rating ?? 0) - Number(first?.rating ?? 0))
    .slice(0, 4)
    .map((coach, index) => ({
      id: coach?._id ?? `coach-${index}`,
      name: coach?.full_name || "Coach",
      rating: Number(coach?.rating ?? 0).toFixed(1),
      secondaryText: `${coach?.experience_years ?? 0} years experience`,
      imageUrl: coach?.profile_img || coach?.image_url || null,
      raw: coach,
    }));

  const topCaddies = [...caddies]
    .sort((first, second) => Number(second?.rating ?? 0) - Number(first?.rating ?? 0))
    .slice(0, 4)
    .map((caddie, index) => ({
      id: caddie?._id ?? `caddie-${index}`,
      name: caddie?.full_name || "Caddie",
      rating: Number(caddie?.rating ?? 0).toFixed(1),
      secondaryText: `${caddie?.matches_caddied ?? 0} matches`,
      imageUrl: caddie?.profile_img || caddie?.image_url || null,
      raw: caddie,
    }));

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
            HANDICAP CALCULATION
          </Text>

          <View style={styles.quickPanelWrapper}>
            <View style={styles.handicapBanner}>
              <View style={styles.handicapCopy}>
                <Text style={styles.handicapEyebrow}>QUICK ACCESS</Text>
                <Text style={styles.handicapTitle}>Check your handicap</Text>
                <Text style={styles.handicapText}>
                  Open your handicap tools and recent round insights in one tap.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.handicapButton}
                onPress={() => navigation.navigate("MatchHistory")}
                activeOpacity={0.9}
              >
                <Ionicons name="analytics" size={18} color="#FFF" />
                <Text style={styles.handicapButtonText}>OPEN</Text>
              </TouchableOpacity>
            </View>

            <ShortcutRow
              title="FEATURED COURSES"
              actionLabel="See all"
              onActionPress={() => navigation.navigate("CourseScreen")}
              items={featuredCourses}
              renderCard={(course, index) => (
                <TouchableOpacity
                  key={course.id || `course-${index}`}
                  style={[styles.featureCard, index > 0 && styles.featureCardSpacing]}
                  onPress={() =>
                    navigation.navigate("ReservationScreen", {
                      course: course?.raw || course,
                      courseId: course?.id,
                    })
                  }
                  activeOpacity={0.9}
                >
                  <Image source={resolveImageSource(course.imageUrl, "course")} style={styles.cardImage} />
                  <View style={styles.cardOverlay} />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{course.name}</Text>
                    <Text style={styles.cardMeta} numberOfLines={2}>
                      {course.location}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />

            <ShortcutRow
              title="TOP-RATED COACHES"
              actionLabel="See all"
              onActionPress={() => navigation.navigate("coach")}
              items={topCoaches}
              renderCard={(coach, index) => (
                <TouchableOpacity
                  key={coach.id || `coach-${index}`}
                  style={[styles.personCard, index > 0 && styles.personCardSpacing]}
                  onPress={() =>
                    navigation.navigate("CoachDetails", {
                      coachId: coach?.id,
                      coach: coach?.raw || coach,
                    })
                  }
                  activeOpacity={0.9}
                >
                  <Image source={resolveImageSource(coach.imageUrl, "coach")} style={styles.personImage} />
                  <View style={styles.personInfo}>
                    <Text style={styles.personName} numberOfLines={1}>
                      {coach.name}
                    </Text>
                    <Text style={styles.personMeta}>{coach.secondaryText}</Text>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={12} color="#E4C95B" />
                      <Text style={styles.ratingText}>{coach.rating}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />

            <ShortcutRow
              title="TOP CADDIES"
              actionLabel="See all"
              onActionPress={() => navigation.navigate("caddie")}
              items={topCaddies}
              renderCard={(caddie, index) => (
                <TouchableOpacity
                  key={caddie.id || `caddie-${index}`}
                  style={[styles.personCard, index > 0 && styles.personCardSpacing]}
                  onPress={() =>
                    navigation.navigate("CaddieBooking", {
                      caddieId: caddie?.id,
                      caddie: caddie?.raw || caddie,
                    })
                  }
                  activeOpacity={0.9}
                >
                  <Image source={resolveImageSource(caddie.imageUrl, "caddie")} style={styles.personImage} />
                  <View style={styles.personInfo}>
                    <Text style={styles.personName} numberOfLines={1}>
                      {caddie.name}
                    </Text>
                    <Text style={styles.personMeta}>{caddie.secondaryText}</Text>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={12} color="#E4C95B" />
                      <Text style={styles.ratingText}>{caddie.rating}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
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
  quickPanelWrapper: {
    marginTop: 24,
  },
  handicapBanner: {
    backgroundColor: "#2E4A37",
    borderRadius: 28,
    padding: 18,
    marginBottom: 24,
  },
  handicapCopy: {
    paddingRight: 12,
  },
  handicapEyebrow: {
    color: "#C9D9A8",
    fontFamily: "Bebas",
    fontSize: 18,
    letterSpacing: 1,
  },
  handicapTitle: {
    color: "#FFF8E7",
    fontFamily: "Bebas",
    fontSize: 30,
    marginTop: 4,
  },
  handicapText: {
    color: "#E6E1D3",
    fontFamily: "Abel",
    fontSize: 16,
    lineHeight: 20,
    marginTop: 4,
  },
  handicapButton: {
    marginTop: 16,
    alignSelf: "flex-start",
    backgroundColor: "#798D3D",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  handicapButtonText: {
    color: "#FFF",
    fontFamily: "Bebas",
    fontSize: 18,
    marginLeft: 8,
    letterSpacing: 1,
  },
  quickSectionBlock: {
    marginBottom: 24,
  },
  quickSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quickSectionTitle: {
    color: "#000",
    fontFamily: "Bebas",
    fontSize: 24,
  },
  quickSectionLink: {
    color: "#2E4A37",
    fontFamily: "Abel",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  quickHorizontalList: {
    paddingRight: 4,
  },
  featureCard: {
    width: 220,
    height: 180,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#B9B29E",
  },
  featureCardSpacing: {
    marginLeft: 14,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(12, 22, 17, 0.24)",
  },
  cardContent: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
  },
  cardTitle: {
    color: "#FFF",
    fontFamily: "Bebas",
    fontSize: 24,
    letterSpacing: 0.5,
  },
  cardMeta: {
    color: "#F4EFE4",
    fontFamily: "Abel",
    fontSize: 15,
    lineHeight: 18,
  },
  personCard: {
    width: 156,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#FFF8E7",
    borderWidth: 1,
    borderColor: "rgba(46, 74, 55, 0.12)",
  },
  personCardSpacing: {
    marginLeft: 12,
  },
  personImage: {
    width: "100%",
    height: 130,
    backgroundColor: "#D3CABB",
  },
  personInfo: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  personName: {
    color: "#1E211C",
    fontFamily: "Bebas",
    fontSize: 20,
    letterSpacing: 0.4,
  },
  personMeta: {
    color: "#50544C",
    fontFamily: "Abel",
    fontSize: 14,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  ratingText: {
    color: "#2E4A37",
    fontFamily: "Abel",
    fontSize: 14,
    marginLeft: 4,
  },
});
