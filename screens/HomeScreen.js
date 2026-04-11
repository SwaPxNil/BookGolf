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
import { useMyBookings } from "../hooks/useBooking";
import { useTheme } from "../theme/ThemeContext";
import { syncBookingReminderNotifications } from "../utils/bookingReminders";

const cardFallbacks = {
  course: require("../assets/images/course1.png"),
  coach: require("../assets/images/coach1.png"),
  caddie: require("../assets/images/caddie1.png"),
  booking: require("../assets/images/course1.png"),
};

const resolveImageSource = (imageUrl, type) => {
  if (imageUrl) {
    return { uri: imageUrl };
  }

  return cardFallbacks[type] || cardFallbacks.course;
};

const ShortcutRow = ({ title, actionLabel, onActionPress, items, renderCard, theme }) => (
  <View style={styles.quickSectionBlock}>
    <View style={styles.quickSectionHeader}>
      <Text style={[styles.quickSectionTitle, { color: theme.textPrimary }]}>{title}</Text>
      <TouchableOpacity onPress={onActionPress} activeOpacity={0.8}>
        <Text style={[styles.quickSectionLink, { color: theme.accent }]}>{actionLabel}</Text>
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
  const { theme, mode } = useTheme();
  const { width, height } = useWindowDimensions();
  const iconTop = height * 0.055;

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
  const { data: myBookingsData, refetch: refetchMyBookings } = useMyBookings({ retry: false });

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
  const myBookings = Array.isArray(myBookingsData?.data?.data) ? myBookingsData.data.data : [];
  const userRecentBookings = myBookings.slice(0, 5);
  const dashboardSubtitle =
    dashboard?.summary_text ||
    dashboard?.message ||
    dashboard?.subtitle;
  const userName = profile?.full_name || "GOLFER";

  useEffect(() => {
    if (isAdmin || myBookings.length === 0) {
      return;
    }

    syncBookingReminderNotifications(myBookings).catch((error) => {
      console.warn("Booking reminder scheduling failed:", error?.message || error);
    });
  }, [myBookings, isAdmin]);

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
        refetchMyBookings(),
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

  const recentBookingCards = userRecentBookings.map((booking, index) => {
    const title =
      booking?.booking_type === "TEE_TIME"
        ? booking?.service_details?.course?.name || booking?.course_id?.name || "Course tee time"
        : booking?.booking_type === "COACH"
        ? booking?.service_details?.lesson?.title || booking?.lesson?.title || booking?.coach_id?.full_name || "Coach lesson"
        : booking?.service_details?.caddie?.full_name || booking?.caddie_id?.full_name || "Caddie booking";

    const dt = new Date(booking?.slot || booking?.booking_datetime || booking?.created_at);
    const dateLabel = Number.isNaN(dt.getTime())
      ? "Unknown date"
      : dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const imageUrl =
      booking?.booking_type === "TEE_TIME"
        ? booking?.service_details?.course?.image_url || booking?.course_id?.image_url || null
        : booking?.booking_type === "COACH"
        ? booking?.service_details?.coach?.profile_img
          || booking?.service_details?.coach?.image_url
          || booking?.coach_id?.profile_img
          || booking?.coach_id?.image_url
          || null
        : booking?.service_details?.caddie?.profile_img
          || booking?.service_details?.caddie?.image_url
          || booking?.caddie_id?.profile_img
          || booking?.caddie_id?.image_url
          || null;

    return {
      id: booking?._id ?? `booking-${index}`,
      title,
      status: booking?.status || "CONFIRMED",
      type: (booking?.booking_type || "BOOKING").replace("_", " "),
      dateLabel,
      imageUrl,
      raw: booking,
    };
  });

  return (
    <SafeAreaView style={[styles.container, { paddingHorizontal: width * 0.06, backgroundColor: theme.bg }]}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />

      <TouchableOpacity
        style={[
          styles.profileContainer,
          { top: iconTop, right: width * 0.05 },
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
          { top: iconTop, right: width * 0.18 },
        ]}
        onPress={() => navigation.navigate("SearchScreen")}
      >
        <Ionicons name="search" size={22} color={theme.icon} />
      </TouchableOpacity>

      {!isAdmin ? (
        <TouchableOpacity
          style={[
            styles.myBookingsIconContainer,
            { top: iconTop, right: width * 0.31 },
          ]}
          onPress={() => navigation.navigate("MyBookings")}
        >
          <Ionicons name="bookmarks" size={22} color={theme.icon} />
        </TouchableOpacity>
      ) : null}

      <View
        style={[
          styles.brandWordmark,
          { top: iconTop, left: width * 0.035 },
        ]}
      >
        <Text style={[styles.brandClubText, { color: mode === "dark" ? "#8AA77B" : "#355742", fontSize: width * 0.14 }]}>CLUB</Text>
        <Text style={[styles.brandYearText, { color: mode === "dark" ? "#D7C47C" : "#B79A2A", fontSize: width * 0.11 }]}>1917</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: height * 0.2 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#333" />
        }
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[styles.title, { fontSize: width * 0.12, marginTop: height * 0.1, color: theme.textPrimary }]}>
            {ui.text}
          </Text>

          <Text style={[styles.subtitle, { fontSize: width * 0.04, color: theme.textSecondary }]}> 
            {dashboardLoading ? "Loading dashboard..." : dashboardSubtitle || ui.sub}
          </Text>

          {isAdmin ? (
            <>
              <Text style={[styles.sectionTitle, { fontSize: width * 0.06, marginTop: 14, color: theme.textPrimary }]}> 
                RECENT BOOKINGS
              </Text>
            <View style={[styles.lessonCard, { borderRadius: width * 0.07 }]}>
              {recentBookings.map((booking, index) => {
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
              })}
              {recentBookings.length === 0 ? (
                <Text style={styles.lessonEmpty}>No recent bookings found.</Text>
              ) : null}
            </View>
            </>
          ) : (
            <View style={styles.recentBookingsBlock}>
              <View style={styles.sectionRowCompact}>
                <Text style={[styles.sectionTitle, { fontSize: width * 0.06, color: theme.textPrimary }]}>RECENT BOOKINGS</Text>
                <TouchableOpacity onPress={() => navigation.navigate("MyBookings")} activeOpacity={0.8}>
                  <Text style={[styles.quickSectionLink, { color: theme.accent }]}>See all</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickHorizontalList}
              >
                {recentBookingCards.map((bookingCard, index) => (
                  <TouchableOpacity
                    key={bookingCard.id}
                    style={[styles.personCard, index > 0 && styles.personCardSpacing]}
                    onPress={() =>
                      navigation.navigate("BookingDetails", {
                        bookingId: bookingCard.raw?._id,
                        booking: bookingCard.raw,
                      })
                    }
                    activeOpacity={0.9}
                  >
                    <Image
                      source={resolveImageSource(
                        bookingCard.imageUrl,
                        bookingCard.type.includes("COACH")
                          ? "coach"
                          : bookingCard.type.includes("CADDIE")
                          ? "caddie"
                          : "course"
                      )}
                      style={styles.personImage}
                    />
                    <View style={styles.personInfo}>
                      <Text style={styles.personName} numberOfLines={1}>
                        {bookingCard.title}
                      </Text>
                      <Text style={styles.personMeta}>{bookingCard.type}</Text>
                      <Text style={styles.personMeta}>{bookingCard.status}</Text>
                      <Text style={styles.bookingCardDateInline}>{bookingCard.dateLabel}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                {recentBookingCards.length === 0 ? (
                  <Text style={styles.lessonEmpty}>No recent bookings found.</Text>
                ) : null}
              </ScrollView>
            </View>
          )}

          <Text style={[styles.sectionTitle, { fontSize: width * 0.06, marginTop: 30, color: theme.textPrimary }]}> 
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
              theme={theme}
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
              theme={theme}
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
              theme={theme}
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

  myBookingsIconContainer: {
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

  brandWordmark: {
    position: "absolute",
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 4,
  },
  brandClubText: {
    fontFamily: "Bebas",
    letterSpacing: 0.8,
  },
  brandYearText: {
    fontFamily: "Bebas",
    letterSpacing: 1.5,
    marginLeft: 4,
    marginBottom: 0,
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
  recentBookingsBlock: {
    marginTop: 14,
    marginBottom: 8,
  },
  sectionRowCompact: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  recentBookingsHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
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
  bookingCardDateInline: {
    color: "#2E4A37",
    fontFamily: "Bebas",
    fontSize: 18,
    letterSpacing: 0.5,
    marginTop: 6,
  },
});
