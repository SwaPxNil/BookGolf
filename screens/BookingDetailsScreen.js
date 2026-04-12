import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Dimensions,
  Modal,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCancelMyBooking, useMyBookings, useRateMyBooking } from "../hooks/useBooking";
import { useTheme } from "../theme/ThemeContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.6;

const FALLBACKS = {
  course: require("../assets/images/course1.png"),
  coach: require("../assets/images/coach1.png"),
  caddie: require("../assets/images/caddie1.png"),
};

const formatDateTime = (value) => {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) {
    return "Unknown date";
  }

  return dt.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTypeLabel = (type) => {
  if (type === "TEE_TIME") return "COURSE RESERVATION";
  if (type === "COACH") return "COACH LESSON";
  if (type === "CADDIE") return "CADDIE BOOKING";
  return "BOOKING";
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

const Row = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || "N/A"}</Text>
  </View>
);

export default function BookingDetailsScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const route = useRoute();
  const bookingId = route?.params?.bookingId || route?.params?.booking?._id;
  const fallbackBooking = route?.params?.booking || null;

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelledModal, setShowCancelledModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [ratingValue, setRatingValue] = useState(0);

  const { data: bookingsResponse } = useMyBookings({ retry: false });
  const bookings = Array.isArray(bookingsResponse?.data?.data) ? bookingsResponse.data.data : [];

  const booking = useMemo(() => {
    if (!bookingId) {
      return fallbackBooking;
    }

    return bookings.find((item) => String(item?._id) === String(bookingId)) || fallbackBooking;
  }, [bookings, bookingId, fallbackBooking]);

  const cancelBookingMutation = useCancelMyBooking({
    onSuccess: () => {
      setShowConfirmModal(false);
      setShowCancelledModal(true);
    },
    onError: (error) => {
      setErrorMessage(
        error?.response?.data?.error ||
          error?.response?.data?.msg ||
          error?.message ||
          "Unable to cancel the booking."
      );
    },
  });

  const rateBookingMutation = useRateMyBooking({
    onSuccess: () => {
      setErrorMessage("");
    },
    onError: (error) => {
      setErrorMessage(
        error?.response?.data?.error ||
          error?.response?.data?.msg ||
          error?.message ||
          "Unable to submit rating."
      );
    },
  });

  if (!booking) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}> 
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Image
              source={require("../assets/icons/Back.png")}
              style={{ width: 32, height: 32, tintColor: theme.icon }}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>BOOKED DETAILS</Text>
        </View>
        <Text style={styles.metaText}>Booking details not available.</Text>
      </SafeAreaView>
    );
  }

  const lesson = booking?.service_details?.lesson || booking?.lesson;
  const courseName =
    booking?.service_details?.course?.name ||
    booking?.course_id?.name ||
    booking?.coach_id?.course_id?.name ||
    booking?.caddie_id?.course_id?.name ||
    "N/A";

  const imageSource = resolveImageSource(booking);
  const slotDate = booking?.booking_datetime || booking?.slot;
  const isPastBooking = (() => {
    const dt = new Date(slotDate);
    return !Number.isNaN(dt.getTime()) && dt.getTime() < Date.now();
  })();
  const isRateable = booking?.status === "COMPLETED" && ["COACH", "CADDIE"].includes(booking?.booking_type) && isPastBooking;
  const existingRating = Number(booking?.user_rating || 0);
  const selectedRating = ratingValue || existingRating;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}> 
      <ImageBackground source={imageSource} style={styles.hero} resizeMode="cover">
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Image
              source={require("../assets/icons/Back.png")}
              style={{ width: 32, height: 32, tintColor: theme.icon }}
            />
          </TouchableOpacity>

          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>BOOKED DETAILS</Text>
            <Text style={styles.heroSubtitle}>{getTypeLabel(booking?.booking_type)}</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>

      <View style={styles.bottomSheet}>
        <ScrollView contentContainerStyle={styles.contentWrap}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>BOOKING SNAPSHOT</Text>
            <Row label="Status" value={booking?.status || "CONFIRMED"} />
            <Row label="Date & Time" value={formatDateTime(booking?.booking_datetime || booking?.slot)} />
            <Row label="Booking Type" value={(booking?.booking_type || "BOOKING").replace("_", " ")} />
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>SERVICE DETAILS</Text>
            <Row label="Course" value={courseName} />
            <Row label="Coach" value={booking?.service_details?.coach?.full_name || booking?.coach_id?.full_name} />
            <Row label="Caddie" value={booking?.service_details?.caddie?.full_name || booking?.caddie_id?.full_name} />
            <Row label="Lesson" value={lesson?.title} />
            <Row label="Lesson Duration" value={lesson?.duration_minutes ? `${lesson.duration_minutes} mins` : "N/A"} />
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>PAYMENT DETAILS</Text>
            <Row label="Payment Method" value={booking?.payment?.payment_method || "N/A"} />
            <Row label="Paid Amount" value={`Rs ${booking?.payment?.paid_amount ?? "0"}`} />
            <Row label="Total Amount" value={`Rs ${booking?.payment?.total_amount ?? "0"}`} />
            <Row label="Paid At" value={booking?.payment?.paid_at ? formatDateTime(booking.payment.paid_at) : "N/A"} />
          </View>

          {isRateable ? (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>RATE YOUR EXPERIENCE</Text>
              <Text style={styles.ratingHelpText}>Share your feedback for this {booking?.booking_type === "COACH" ? "coach" : "caddie"} booking.</Text>
              <View style={styles.ratingRowWrap}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRatingValue(star)} activeOpacity={0.8}>
                    <Ionicons
                      name={star <= selectedRating ? "star" : "star-outline"}
                      size={30}
                      color={star <= selectedRating ? "#E4C95B" : "#AAB39F"}
                      style={styles.ratingStar}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.rateBtn, (!selectedRating || rateBookingMutation.isPending) && styles.rateBtnDisabled]}
                onPress={() => {
                  if (!selectedRating) {
                    setErrorMessage("Please select a star rating first.");
                    return;
                  }
                  rateBookingMutation.mutate({ bookingId: booking._id, rating: selectedRating });
                }}
                disabled={!selectedRating || rateBookingMutation.isPending}
              >
                <Text style={styles.rateBtnText}>{rateBookingMutation.isPending ? "SUBMITTING..." : existingRating ? "UPDATE RATING" : "SUBMIT RATING"}</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <TouchableOpacity
            style={[styles.cancelBtn, cancelBookingMutation.isPending && styles.cancelBtnDisabled]}
            onPress={() => {
              setErrorMessage("");
              setShowConfirmModal(true);
            }}
            disabled={cancelBookingMutation.isPending}
          >
            <Text style={styles.cancelBtnText}>
              {cancelBookingMutation.isPending ? "CANCELLING..." : "CANCEL BOOKING"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <Modal visible={showConfirmModal} transparent animationType="fade" onRequestClose={() => setShowConfirmModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEyebrow}>CONFIRM ACTION</Text>
            <Text style={styles.modalTitle}>Cancel this booking?</Text>
            <Text style={styles.modalDescription}>This will release the slot and remove it from your bookings list.</Text>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalSecondary} onPress={() => setShowConfirmModal(false)}>
                <Text style={styles.modalSecondaryText}>KEEP</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalPrimary}
                onPress={() => cancelBookingMutation.mutate(booking._id)}
                disabled={cancelBookingMutation.isPending}
              >
                <Text style={styles.modalPrimaryText}>{cancelBookingMutation.isPending ? "CANCELLING..." : "CANCEL"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showCancelledModal} transparent animationType="fade" onRequestClose={() => setShowCancelledModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEyebrow}>BOOKING CANCELLED</Text>
            <Text style={styles.modalTitle}>Reservation cancelled</Text>
            <Text style={styles.modalDescription}>A cancellation confirmation email has been sent to your registered email.</Text>
            <TouchableOpacity
              style={styles.modalPrimarySingle}
              onPress={() => {
                setShowCancelledModal(false);
                navigation.navigate("MyBookings");
              }}
            >
              <Text style={styles.modalPrimaryText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 34,
    marginLeft: 12,
    fontFamily: "Bebas",
    letterSpacing: 1,
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
    paddingTop: 16,
  },
  contentWrap: {
    paddingHorizontal: 18,
    paddingBottom: 28,
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#FAFFDD",
    fontFamily: "Bebas",
    fontSize: 26,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  infoRow: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.12)",
    paddingVertical: 8,
  },
  infoLabel: {
    color: "#C8C8C8",
    fontFamily: "Abel",
    fontSize: 14,
  },
  infoValue: {
    color: "#FFF",
    fontFamily: "Bebas",
    fontSize: 26,
    letterSpacing: 0.4,
    lineHeight: 28,
  },
  cancelBtn: {
    marginTop: 18,
    backgroundColor: "#B44132",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  cancelBtnDisabled: { opacity: 0.7 },
  cancelBtnText: {
    color: "#fff",
    fontFamily: "Bebas",
    fontSize: 24,
    letterSpacing: 0.8,
  },
  errorText: {
    color: "#FFC9B8",
    fontFamily: "Abel",
    fontSize: 15,
    marginTop: 10,
  },
  metaText: {
    color: "#d8d8d8",
    fontFamily: "Abel",
    fontSize: 15,
    textAlign: "center",
    marginTop: 20,
  },
  ratingHelpText: {
    color: "#DBE1D2",
    fontFamily: "Abel",
    fontSize: 16,
    marginBottom: 10,
  },
  ratingRowWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  ratingStar: {
    marginRight: 8,
  },
  rateBtn: {
    backgroundColor: "#798D3D",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginTop: 4,
  },
  rateBtnDisabled: {
    opacity: 0.65,
  },
  rateBtnText: {
    color: "#fff",
    fontFamily: "Bebas",
    fontSize: 22,
    letterSpacing: 0.6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(10,14,12,0.6)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: "#F3ECDD",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderWidth: 1,
    borderColor: "rgba(46, 74, 55, 0.12)",
  },
  modalEyebrow: {
    color: "#5F7248",
    fontFamily: "Bebas",
    fontSize: 18,
    letterSpacing: 1,
  },
  modalTitle: {
    color: "#1F241D",
    fontFamily: "Bebas",
    fontSize: 34,
    marginTop: 4,
  },
  modalDescription: {
    color: "#4F554A",
    fontFamily: "Abel",
    fontSize: 17,
    lineHeight: 22,
    marginTop: 8,
  },
  modalFooter: {
    flexDirection: "row",
    marginTop: 18,
  },
  modalSecondary: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#8B9580",
    paddingVertical: 11,
    alignItems: "center",
    marginRight: 10,
  },
  modalSecondaryText: {
    color: "#55604F",
    fontFamily: "Bebas",
    fontSize: 20,
  },
  modalPrimary: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: "#798D3D",
    paddingVertical: 11,
    alignItems: "center",
  },
  modalPrimarySingle: {
    marginTop: 12,
    borderRadius: 999,
    backgroundColor: "#798D3D",
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  modalPrimaryText: {
    color: "#FFF",
    fontFamily: "Bebas",
    fontSize: 20,
    letterSpacing: 0.4,
  },
});
