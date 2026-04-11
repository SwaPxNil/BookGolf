import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ImageBackground,
  Dimensions,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useMyBookings } from "../hooks/useBooking";
import { useTheme } from "../theme/ThemeContext";
import { buildReminderKeyFromBooking, getScheduledReminderKeys } from "../utils/bookingReminders";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.64;

const TABS = [
  { key: "courses", label: "COURSES", type: "TEE_TIME" },
  { key: "lessons", label: "LESSONS", type: "COACH" },
  { key: "caddies", label: "CADDIES", type: "CADDIE" },
];

const FALLBACKS = {
  course: require("../assets/images/course1.png"),
  coach: require("../assets/images/coach1.png"),
  caddie: require("../assets/images/caddie1.png"),
};

const resolveImageSource = (booking) => {
  if (booking?.booking_type === "TEE_TIME") {
    const url = booking?.service_details?.course?.image_url || booking?.course_id?.image_url;
    return url ? { uri: url } : FALLBACKS.course;
  }

  if (booking?.booking_type === "COACH") {
    const url =
      booking?.service_details?.coach?.profile_img ||
      booking?.service_details?.coach?.image_url ||
      booking?.coach_id?.profile_img ||
      booking?.coach_id?.image_url;
    return url ? { uri: url } : FALLBACKS.coach;
  }

  const url =
    booking?.service_details?.caddie?.profile_img ||
    booking?.service_details?.caddie?.image_url ||
    booking?.caddie_id?.profile_img ||
    booking?.caddie_id?.image_url;
  return url ? { uri: url } : FALLBACKS.caddie;
};

const formatDate = (value) => {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) {
    return "Unknown date";
  }

  return dt.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const getBookingTitle = (booking) => {
  if (booking?.booking_type === "TEE_TIME") {
    return booking?.service_details?.course?.name || booking?.course_id?.name || "Course Booking";
  }

  if (booking?.booking_type === "COACH") {
    return booking?.service_details?.lesson?.title || booking?.lesson?.title || "Lesson Booking";
  }

  return booking?.service_details?.caddie?.full_name || booking?.caddie_id?.full_name || "Caddie Booking";
};

export default function MyBookingsScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const route = useRoute();
  const [activeTab, setActiveTab] = useState(route?.params?.initialTab || "courses");
  const [refreshing, setRefreshing] = useState(false);
  const [scheduledReminderKeys, setScheduledReminderKeys] = useState(new Set());

  const { data: bookingsResponse, isLoading, isError, refetch } = useMyBookings({ retry: false });

  const allBookings = Array.isArray(bookingsResponse?.data?.data) ? bookingsResponse.data.data : [];

  const filteredBookings = useMemo(() => {
    const active = TABS.find((tab) => tab.key === activeTab);
    if (!active) {
      return [];
    }

    return allBookings.filter((booking) => booking?.booking_type === active.type);
  }, [allBookings, activeTab]);

  const heroImage = filteredBookings[0] ? resolveImageSource(filteredBookings[0]) : FALLBACKS.course;

  useEffect(() => {
    let mounted = true;

    const loadReminderKeys = async () => {
      const keyList = await getScheduledReminderKeys();
      if (mounted) {
        setScheduledReminderKeys(new Set(keyList));
      }
    };

    loadReminderKeys();

    return () => {
      mounted = false;
    };
  }, [allBookings.length]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}> 
      <ImageBackground source={heroImage} style={styles.hero} resizeMode="cover">
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Image
              source={require("../assets/icons/Back.png")}
              style={{ width: 32, height: 32, tintColor: theme.icon }}
            />
          </TouchableOpacity>

          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>MY BOOKINGS</Text>
            <Text style={styles.heroSubtitle}>Your reserved courses, lessons, and caddies.</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>

      <View style={styles.bottomSheet}>
        <View style={styles.tabRow}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.listWrap}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#fff" />}
        >
          {isLoading ? <Text style={styles.metaText}>Loading bookings...</Text> : null}
          {isError ? <Text style={styles.metaText}>Failed to load bookings.</Text> : null}
          {!isLoading && !isError && filteredBookings.length === 0 ? (
            <Text style={styles.metaText}>No bookings found for this category.</Text>
          ) : null}

          {filteredBookings.map((booking) => (
            <TouchableOpacity
              key={booking._id}
              style={styles.bookingCard}
              onPress={() => navigation.navigate("BookingDetails", { bookingId: booking._id, booking })}
              activeOpacity={0.9}
            >
              <ImageBackground
                source={resolveImageSource(booking)}
                style={styles.bookingCardImage}
                imageStyle={styles.bookingCardImageInner}
              >
                <View style={styles.bookingImageOverlay} />
                <View style={styles.badgeRow}>
                  {(() => {
                    const reminderKey = buildReminderKeyFromBooking(booking);
                    const isReminderScheduled = reminderKey ? scheduledReminderKeys.has(reminderKey) : false;
                    if (!isReminderScheduled) {
                      return null;
                    }

                    return (
                      <View style={styles.reminderBadge}>
                        <Ionicons name="notifications" size={12} color="#F7F9F4" />
                        <Text style={styles.reminderBadgeText}>Reminder scheduled</Text>
                      </View>
                    );
                  })()}

                  {Number(booking?.user_rating) > 0 ? (
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={12} color="#E4C95B" />
                      <Text style={styles.ratingBadgeText}>You rated this {Number(booking.user_rating).toFixed(0)}★</Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.bookingCardContent}>
                  <Text style={styles.bookingCardTitle} numberOfLines={2}>
                    {getBookingTitle(booking)}
                  </Text>
                  <Text style={styles.bookingCardMeta}>{(booking?.booking_type || "BOOKING").replace("_", " ")}</Text>
                  <Text style={styles.bookingCardMeta}>{formatDate(booking?.slot || booking?.booking_datetime)}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2A2E2A" },
  hero: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.46 },
  backBtn: {
    marginLeft: 18,
    marginTop: 8,
  },
  heroTextWrap: {
    position: "absolute",
    bottom: 70,
    left: 20,
    right: 20,
  },
  heroTitle: {
    color: "#fff",
    fontFamily: "Bebas",
    fontSize: 56,
    letterSpacing: 1,
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  heroSubtitle: {
    color: "#F2F2F2",
    fontFamily: "Abel",
    fontSize: 22,
    marginTop: 2,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: SCREEN_WIDTH,
    height: BOTTOM_SHEET_HEIGHT,
    backgroundColor: "rgb(42, 46, 42)",
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.16)",
    paddingTop: 18,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 8,
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    paddingVertical: 8,
    alignItems: "center",
  },
  tabBtnActive: {
    backgroundColor: "#798D3D",
    borderColor: "#798D3D",
  },
  tabText: {
    color: "#fff",
    fontFamily: "Bebas",
    fontSize: 22,
    letterSpacing: 0.4,
  },
  tabTextActive: { color: "#fff" },
  listWrap: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 20,
  },
  bookingCard: {
    marginBottom: 12,
  },
  bookingCardImage: {
    height: 130,
    justifyContent: "flex-end",
  },
  bookingCardImageInner: {
    borderRadius: 20,
  },
  bookingImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  badgeRow: {
    position: "absolute",
    top: 8,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  reminderBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(47, 76, 57, 0.88)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  reminderBadgeText: {
    color: "#F7F9F4",
    fontFamily: "Abel",
    fontSize: 11,
    marginLeft: 4,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(28, 32, 27, 0.88)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: "auto",
  },
  ratingBadgeText: {
    color: "#F7F9F4",
    fontFamily: "Abel",
    fontSize: 11,
    marginLeft: 4,
  },
  bookingCardContent: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bookingCardTitle: {
    color: "#fff",
    fontFamily: "Bebas",
    fontSize: 30,
    lineHeight: 30,
  },
  bookingCardMeta: {
    color: "#E7E7E7",
    fontFamily: "Abel",
    fontSize: 18,
    lineHeight: 20,
  },
  metaText: {
    color: "#ddd",
    fontFamily: "Abel",
    fontSize: 15,
    textAlign: "center",
    marginTop: 18,
  },
});
