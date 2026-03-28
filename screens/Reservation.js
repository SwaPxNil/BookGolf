import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Dimensions,
  Image,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Feather, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import BookingPaymentModal from "../components/BookingPaymentModal";
import { useTeeTimesForCourse } from "../hooks/useTeeTime";
import { useProcessAdvanceBookingPayment } from "../hooks/usePayment";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.42; 

export default function ReservationScreen({ route }) {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("ESEWA");
  
  const course = route?.params?.course || {
    name: "GOKARNA FOREST RESORT",
    image: require("../assets/images/course1.png"),
  };
  const courseId = route?.params?.courseId || course?._id || course?.id;
  const {
    data: teeTimesResponse,
    isLoading: teeTimesLoading,
    refetch: refetchTeeTimes,
  } = useTeeTimesForCourse(courseId, { retry: false });
  const processBookingPaymentMutation = useProcessAdvanceBookingPayment({
    onSuccess: () => {
      setPaymentModalVisible(false);
      setConfirmationVisible(true);
      setSelectedSlot("");
    },
    onError: (error) => {
      Alert.alert(
        "Booking failed",
        error?.response?.data?.error ||
          error?.response?.data?.msg ||
          error?.message ||
          "Unable to complete the reservation."
      );
    },
  });

  const courseImageSource = course?.imageUrl
    ? { uri: course.imageUrl }
    : course?.image_url
    ? { uri: course.image_url }
    : course?.image
    ? course.image
    : require("../assets/images/course1.png");

  const courseName = course.name;
  const teeTimes = Array.isArray(teeTimesResponse?.data?.data) ? teeTimesResponse.data.data : [];

  const formatDateLabel = (isoValue) => {
    const dt = new Date(isoValue);
    return {
      day: String(dt.getDate()).padStart(2, "0"),
      label: dt.toLocaleDateString("en-US", { weekday: "short" }),
      value: dt.toISOString().slice(0, 10),
    };
  };

  const formatTime = (isoValue) => {
    const dt = new Date(isoValue);
    return dt.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const dates = useMemo(() => {
    const uniqueDateMap = new Map();

    teeTimes.forEach((teeTime) => {
      const formatted = formatDateLabel(teeTime.slot_time);
      if (!uniqueDateMap.has(formatted.value)) {
        uniqueDateMap.set(formatted.value, formatted);
      }
    });

    return Array.from(uniqueDateMap.values());
  }, [teeTimes]);

  const activeDateValue = selectedDate || dates[0]?.value || "";
  const timeSlots = useMemo(() => {
    return teeTimes
      .filter((teeTime) => teeTime?.slot_time?.slice(0, 10) === activeDateValue)
      .map((teeTime) => ({
        id: teeTime._id,
        value: teeTime._id,
        slotText: formatTime(teeTime.slot_time),
        price: teeTime.price,
      }));
  }, [teeTimes, activeDateValue]);
  const selectedTeeTime = timeSlots.find((slot) => slot.value === selectedSlot);
  const selectedPrice = String(selectedTeeTime?.price ?? course?.tee_time_price ?? 0);
  const totalAmount = Number(selectedTeeTime?.price ?? course?.tee_time_price ?? 0);
  const advanceAmount = Number((totalAmount / 3).toFixed(2));

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      setSelectedDate("");
      setSelectedSlot("");
      await refetchTeeTimes();
    } finally {
      setRefreshing(false);
    }
  };

  const handleBookNow = () => {
    if (!selectedSlot) {
      Alert.alert("Select a slot", "Please choose an available tee time first.");
      return;
    }

    setPaymentMethod("ESEWA");
    setPaymentModalVisible(true);
  };

  const handleConfirmPayment = () => {
    processBookingPaymentMutation.mutate({
      bookingType: "TEE_TIME",
      paymentMethod,
      teeTimeId: selectedSlot,
    });
  };

  const handleConfirmationClose = async () => {
    setConfirmationVisible(false);
    await refetchTeeTimes();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* BACKGROUND IMAGE */}
      <ImageBackground
        source={courseImageSource}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
          {/* BACK BUTTON */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
             <Image 
              source={require('../assets/icons/Back.png')} 
              style={{ width: 32, height: 32, tintColor: '#000' }} 
            />
          </TouchableOpacity>

          {/* HEADER CONTENT OVER IMAGE */}
          <View style={styles.headerTextContainer}>
            <Text style={styles.clubName}>{courseName.toUpperCase()}</Text>
            <TouchableOpacity style={styles.layoutBtn}>
              <Text style={styles.layoutText}>View Course Layout</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>

      {/* BOTTOM SHEET */}
      <View style={styles.bottomSheet}>
        
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollArea}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#FFFFFF" />
          }
        >
          
          {/* DATE SELECTION */}
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={SCREEN_WIDTH * 0.05} color="#fff" />
            <Text style={styles.sectionTitle}>SELECT A RESERVATION DATE</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollPadding}
          >
            {dates.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[styles.dateItem, activeDateValue === item.value && styles.dateItemActive]}
                onPress={() => {
                  setSelectedDate(item.value);
                  setSelectedSlot("");
                }}
              >
                <Text style={[styles.dateNumber, activeDateValue === item.value && styles.dateNumberActive]}>
                  {item.day}
                </Text>
                <Text style={[styles.dateLabel, activeDateValue === item.value && styles.dateLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {!teeTimesLoading && dates.length === 0 ? (
            <Text style={styles.emptyText}>No available tee times for this course.</Text>
          ) : null}

          {/* TIME SELECTION */}
          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={SCREEN_WIDTH * 0.05} color="#fff" />
            <Text style={styles.sectionTitle}>SELECT A TIME SLOT</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollPadding}
          >
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={[styles.timeSlot, selectedSlot === slot.value && styles.timeSlotActive]}
                onPress={() => setSelectedSlot(slot.value)}
              >
                <Text style={[styles.timeText, selectedSlot === slot.value && styles.timeTextActive]}>
                  {slot.slotText}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {!teeTimesLoading && dates.length > 0 && timeSlots.length === 0 ? (
            <Text style={styles.emptyText}>No available tee times on the selected date.</Text>
          ) : null}
          
        </ScrollView>

        {/* FIXED FOOTER */}
        <View style={styles.footerRow}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.costText}>Cost: </Text>
            <Text style={styles.price}>Rs{selectedPrice}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.bookBtn,
              (!selectedSlot || processBookingPaymentMutation.isPending) && styles.bookBtnDisabled,
            ]}
            onPress={handleBookNow}
            disabled={!selectedSlot || processBookingPaymentMutation.isPending}
          >
            <Text style={styles.bookText}>
              {processBookingPaymentMutation.isPending ? "BOOKING..." : "BOOK NOW"}
            </Text>
          </TouchableOpacity>
        </View>

      </View>

      <BookingPaymentModal
        visible={paymentModalVisible}
        mode="payment"
        serviceLabel="Tee Time Advance"
        totalAmount={totalAmount}
        advanceAmount={advanceAmount}
        paymentMethod={paymentMethod}
        onSelectMethod={setPaymentMethod}
        onConfirm={handleConfirmPayment}
        onClose={() => setPaymentModalVisible(false)}
        isSubmitting={processBookingPaymentMutation.isPending}
      />

      <BookingPaymentModal
        visible={confirmationVisible}
        mode="success"
        serviceLabel="Tee Time Advance"
        onClose={handleConfirmationClose}
      />
    </View>
  );
}

const COLORS = {
  dark: "#2A2E2A", 
  green: "#798D3D", 
  white: "#fff",
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },

  backgroundImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.6,
  },

  backBtn: {
    marginLeft: 20,
    marginTop: 10,
  },

  clubName: {
    color: COLORS.white,
    fontSize: SCREEN_WIDTH * 0.08,
    marginBottom: 10,
    fontFamily: "Bebas",
    textShadowColor: 'rgba(0,0,0,0.5)', 
    textShadowOffset: { width: 1, height: 1 }, 
    textShadowRadius: 3
  },

  layoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.white,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  layoutText: {
    color: COLORS.white,
    fontSize: SCREEN_WIDTH * 0.045,
    fontFamily: "Abel",
  },

  headerTextContainer: {
    position: "absolute",
    bottom: BOTTOM_SHEET_HEIGHT + 30, 
    left: 20,
    right: 20,
    bottom:50
  },

  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: SCREEN_WIDTH,
    height: BOTTOM_SHEET_HEIGHT, 
    backgroundColor: "rgb(42, 46, 42)",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.16)",
    overflow: "hidden",
    paddingTop: 30,
    paddingBottom: 25, 
  },

  scrollArea: {
    flex: 1,
    marginBottom: 15, 
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 25, 
    gap: 8,
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: "Bebas",
    letterSpacing: 1,
  },

  horizontalScrollPadding: {
    paddingLeft: 25,
    paddingRight: 10, 
    paddingBottom: 10,
  },

  dateItem: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    borderWidth: 1,
    borderColor: COLORS.white,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  dateItemActive: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },

  dateNumber: {
    color: COLORS.white,
    fontSize: 30,
    fontFamily: "Bebas",
  },

  dateLabel: {
    color: COLORS.white,
    fontFamily: "Abel",
    fontSize: 14,
  },

  dateNumberActive: {
    color: COLORS.white,
  },

  dateLabelActive: {
    color: COLORS.white,
  },

  timeSlot: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.white,
    borderRadius: 25,
    marginRight: 15,
    marginBottom: 5, 
  },

  timeSlotActive: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },

  timeText: {
    color: COLORS.white,
    fontFamily: "Abel",
    fontSize: 18,
  },

  timeTextActive: {
    color: COLORS.white,
  },
  emptyText: {
    color: "#CCCCCC",
    fontSize: 14,
    fontFamily: "Abel",
    paddingHorizontal: 25,
    marginBottom: 8,
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 5,
    paddingHorizontal: 25, 
  },

  costText: {
    color: "#CCCCCC",
    fontSize: 16,
    marginRight: 6,
    fontFamily: "Abel",
  },

  price: {
    color: COLORS.white,
    fontSize: 22,
    fontFamily: "Bebas",
  },

  bookBtn: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  bookBtnDisabled: {
    opacity: 0.6,
  },

  bookText: {
    fontSize: 20,
    fontFamily: "Bebas",
    color: COLORS.white,
    letterSpacing: 1,
  },
});
