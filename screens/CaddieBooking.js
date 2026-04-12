import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  RefreshControl,
  Image,
  Alert,
  Linking,
  AppState,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCaddie, useCaddieAvailability } from "../hooks/useCaddie";
import BookingPaymentModal from "../components/BookingPaymentModal";
import {
  useInitiateAdvanceBookingPayment,
  useVerifyEsewaAdvancePayment,
  useVerifyKhaltiAdvancePayment,
} from "../hooks/usePayment";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.45;
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.6; 

export default function CaddieBookingScreen() {
  const navigation = useNavigation();
  const appStateRef = useRef(AppState.currentState);
  const route = useRoute();
  const caddieId = route?.params?.caddieId || route?.params?.caddie?.id || route?.params?.caddie?._id;
  const {
    data: caddieResponse,
    isLoading: caddieLoading,
    refetch: refetchCaddie,
  } = useCaddie(caddieId, { retry: false });
  const {
    data: availabilityResponse,
    isLoading: availabilityLoading,
    refetch: refetchAvailability,
  } = useCaddieAvailability(caddieId, { retry: false });
  const initiatePaymentMutation = useInitiateAdvanceBookingPayment({
    onError: (error) => {
      Alert.alert(
        "Payment initiation failed",
        error?.response?.data?.error ||
          error?.response?.data?.msg ||
          error?.message ||
          "Unable to start the payment process."
      );
    },
  });
  const verifyEsewaMutation = useVerifyEsewaAdvancePayment({
    onSuccess: () => {
      setPendingGatewayPayment(null);
      setConfirmationVisible(true);
      setSelectedSlot("");
    },
  });
  const verifyKhaltiMutation = useVerifyKhaltiAdvancePayment({
    onSuccess: () => {
      setPendingGatewayPayment(null);
      setConfirmationVisible(true);
      setSelectedSlot("");
    },
  });

  const caddieData = caddieResponse?.data?.data || {};
  const caddie = {
    id: caddieData?._id || caddieId || "",
    name: caddieData?.full_name || route?.params?.caddie?.name || "Caddie",
    imageUrl: caddieData?.profile_img || caddieData?.image_url || route?.params?.caddie?.imageUrl || null,
    rating: String(Number(caddieData?.rating ?? route?.params?.caddie?.rating ?? 0).toFixed(1)),
    matches: `${caddieData?.matches_caddied ?? 0}+`,
    experience: `${caddieData?.experience ?? caddieData?.experience_years ?? 0} Years`,
    speciality: caddieData?.speciality || route?.params?.caddie?.speciality || "General support",
  };
  
  const service = {
    title: "18 HOLE CADDIE SERVICE",
    fullDescription: "Enhance your round with an experienced caddie. Your caddie will assist with bag carrying, club selection, course navigation, and green reading. Enjoy a professional and seamless golfing experience tailored to your pace of play.\n\nFocus entirely on your game while your caddie handles the logistics, provides accurate yardages, and offers valuable local knowledge of the course.",
    time: "18 Holes (~4 hrs)",
    level: "Pro Caddie",
    price: "4000"
  };

  const [step, setStep] = useState(1); 
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("ESEWA");
  const [pendingGatewayPayment, setPendingGatewayPayment] = useState(null);

  const animState = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animState, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, []);

  const handleNext = () => {
    setStep(2); 
    Animated.spring(animState, {
      toValue: 2,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      Animated.spring(animState, { toValue: 1, useNativeDriver: true, friction: 8, tension: 40 }).start();
    } else {
      navigation.goBack();
    }
  };

  const bigCardTranslateY = animState.interpolate({ inputRange: [0, 1, 2], outputRange: [SCREEN_HEIGHT, 0, SCREEN_HEIGHT] });
  const bigCardOpacity = animState.interpolate({ inputRange: [0, 1, 1.5, 2], outputRange: [0, 1, 0, 0] });
  const smallPillOpacity = animState.interpolate({ inputRange: [0, 1, 1.5, 2], outputRange: [0, 0, 0, 1] });
  const bottomSheetTranslateY = animState.interpolate({ inputRange: [0, 1, 2], outputRange: [SCREEN_HEIGHT, SCREEN_HEIGHT, 0] });
  
  const headerTranslateY = animState.interpolate({ inputRange: [0, 1, 2], outputRange: [85, 85, 0] });

  const availabilitySlots = Array.isArray(availabilityResponse?.data?.data)
    ? availabilityResponse.data.data
    : Array.isArray(caddieData?.availability_slots)
    ? caddieData.availability_slots
    : [];

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

    availabilitySlots.forEach((slot) => {
      const formatted = formatDateLabel(slot);
      if (!uniqueDateMap.has(formatted.value)) {
        uniqueDateMap.set(formatted.value, formatted);
      }
    });

    return Array.from(uniqueDateMap.values());
  }, [availabilitySlots]);

  const activeDateValue = selectedDate || dates[0]?.value || "";
  const timeSlots = useMemo(() => {
    return availabilitySlots
      .filter((slot) => slot?.slice(0, 10) === activeDateValue)
      .map((slot) => ({ id: slot, value: slot, slotText: formatTime(slot) }));
  }, [availabilitySlots, activeDateValue]);

  const isLoadingBookingData = Boolean(caddieId) && (caddieLoading || availabilityLoading);
  const totalAmount = Number(service?.price ?? 0);
  const advanceAmount = Number((totalAmount / 3).toFixed(2));

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchCaddie(), refetchAvailability()]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleBookNow = () => {
    if (!caddieId) {
      Alert.alert("Booking unavailable", "Caddie details are incomplete.");
      return;
    }

    if (!selectedSlot) {
      Alert.alert("Select a slot", "Please choose an available time slot first.");
      return;
    }

    setPaymentMethod("ESEWA");
    setPaymentModalVisible(true);
  };

  const handleConfirmPayment = async () => {
    try {
      const response = await initiatePaymentMutation.mutateAsync({
        bookingType: "CADDIE",
        paymentMethod,
        caddieId,
        slot: selectedSlot,
        totalAmount,
      });

      const checkout = response?.data?.data?.checkout || {};
      const paymentId = response?.data?.data?.paymentId;

      if (!paymentId) {
        throw new Error("Payment ID was not returned by server");
      }

      const targetUrl = checkout?.checkoutUrl || checkout?.paymentUrl;
      if (!targetUrl) {
        throw new Error("Payment URL is missing");
      }

      setPaymentModalVisible(false);
      setPendingGatewayPayment({
        paymentId,
        method: paymentMethod,
        pidx: checkout?.pidx || null,
      });

      await Linking.openURL(targetUrl);

      Alert.alert(
        "Complete payment in sandbox",
        "After completing payment in browser, return to this app and tap VERIFY PAYMENT.",
      );
    } catch (error) {
      Alert.alert(
        "Payment failed",
        error?.response?.data?.error ||
          error?.response?.data?.msg ||
          error?.message ||
          "Unable to process payment."
      );
    }
  };

  const verifyPendingPayment = async ({ silent = false } = {}) => {
    if (!pendingGatewayPayment?.paymentId) {
      if (!silent) {
        Alert.alert("No pending payment", "Please start a payment first.");
      }
      return;
    }

    try {
      if (pendingGatewayPayment.method === "ESEWA") {
        await verifyEsewaMutation.mutateAsync({ paymentId: pendingGatewayPayment.paymentId });
      } else {
        await verifyKhaltiMutation.mutateAsync({
          paymentId: pendingGatewayPayment.paymentId,
          pidx: pendingGatewayPayment.pidx || undefined,
        });
      }
    } catch (error) {
      if (!silent) {
        Alert.alert(
          "Verification pending",
          error?.response?.data?.error ||
            error?.response?.data?.msg ||
            error?.message ||
            "Payment is not verified yet."
        );
      }
    }
  };

  const handleVerifyPayment = () => verifyPendingPayment({ silent: false });

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      const wasInBackground = appStateRef.current.match(/inactive|background/);
      const isActive = nextState === "active";

      if (
        wasInBackground
        && isActive
        && pendingGatewayPayment?.paymentId
        && !verifyEsewaMutation.isPending
        && !verifyKhaltiMutation.isPending
      ) {
        verifyPendingPayment({ silent: true });
      }

      appStateRef.current = nextState;
    });

    return () => {
      subscription.remove();
    };
  }, [pendingGatewayPayment, verifyEsewaMutation.isPending, verifyKhaltiMutation.isPending]);

  const handleConfirmationClose = async () => {
    setConfirmationVisible(false);
    await Promise.all([refetchCaddie(), refetchAvailability()]);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* BACKGROUND IMAGE */}
      <ImageBackground 
        source={
          caddie.imageUrl
            ? { uri: caddie.imageUrl }
            : require("../assets/images/caddie2.png")
        }
        style={styles.backgroundImage} 
        resizeMode="cover"
      >
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Image 
             source={require('../assets/icons/Back.png')} 
             style={{ width: 32, height: 32, tintColor: '#000' }} 
           />
          </TouchableOpacity>
        </SafeAreaView>
      </ImageBackground>

      {/* HEADER CONTENT */}
      <Animated.View style={[styles.headerTextContainer, { transform: [{ translateY: headerTranslateY }] }]}>
        <Text style={styles.caddieName}>{caddie.name.toUpperCase()}</Text>

        {/* STEP 2: SMALL ANIMATED SUMMARY PILL */}
        <Animated.View style={[styles.summaryPill, { opacity: smallPillOpacity }]}>
          <Text style={styles.pillLabel}>CADDIE DETAILS</Text>
          <View style={styles.pillRow}>
            <Text style={styles.pillTitle}>{caddie.name}</Text>
            
            <View style={styles.pillDetail}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.pillDetailText}>{caddie.rating}</Text>
            </View>
            
            <Text style={styles.pillTitle}>{caddie.matches}</Text>
            
            <View style={styles.pillDetail}>
              <Text style={[styles.pillDetailText, { color: "#FAFF5D" }]}>{caddie.experience}</Text>
            </View>
          </View>
        </Animated.View>
      </Animated.View>

      <Animated.View pointerEvents={step === 1 ? 'auto' : 'none'} style={[styles.cardContainer, { opacity: bigCardOpacity, transform: [{ translateY: bigCardTranslateY }] }]}>
        
        {/* Scrollable Area */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollArea}
        >
          {isLoadingBookingData ? (
            <BookingSkeleton />
          ) : (
            <View style={styles.step1Content}>
              <Text style={styles.sectionHeaderSmall}>CADDIE DETAILS</Text>
              <Text style={styles.bigCardTitle}>{caddie.name}</Text>
              <Text style={styles.bigCardDesc}>{service.fullDescription}</Text>
              
              <View style={styles.infoTable}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>RATING</Text>
                  <View style={styles.infoValueContainer}>
                    <Ionicons name="star" size={18} color="#FFD700" />
                    <Text style={styles.infoValue}>{caddie.rating}</Text>
                  </View>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>MATCHES CADDIED</Text>
                  <View style={styles.infoValueContainer}>
                    <Text style={[styles.infoValue, { color: "#fff" }]}>{caddie.matches}</Text>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>EXPERIENCE</Text>
                  <View style={styles.infoValueContainer}>
                    <Text style={[styles.infoValue, { color: "#FAFF5D" }]}>{caddie.experience}</Text>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>SPECIALITY</Text>
                  <View style={styles.infoValueContainer}>
                    <Text style={[styles.infoValue, { color: "#fff" }]}>{caddie.speciality}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
        
        <View style={styles.nextBtnContainer}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleNext}>
            <Text style={styles.actionBtnText}>NEXT</Text>
          </TouchableOpacity>
        </View>

      </Animated.View>

      <Animated.View pointerEvents={step === 2 ? 'auto' : 'none'} style={[styles.cardContainer, { transform: [{ translateY: bottomSheetTranslateY }] }]}>
        
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollArea}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#FFFFFF" />
          }
        >
          
          <View style={styles.sheetHeader}>
            <Ionicons name="calendar" size={20} color="#fff" />
            <Text style={styles.sheetHeaderTitle}>SELECT A RESERVATION DATE</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
            {dates.map((item) => {
              const isActive = activeDateValue === item.value;
              return (
                <TouchableOpacity key={item.value} style={[styles.dateItem, isActive && styles.dateItemActive]} onPress={() => {
                  setSelectedDate(item.value);
                  setSelectedSlot("");
                }}>
                  <Text style={[styles.dateNumber, isActive && styles.dateNumberActive]}>{item.day}</Text>
                  <Text style={[styles.dateLabel, isActive && styles.dateLabelActive]}>{item.label}</Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
          {!isLoadingBookingData && dates.length === 0 ? (
            <Text style={styles.emptyText}>No available reservation dates for this caddie.</Text>
          ) : null}

          <View style={[styles.sheetHeader, { marginTop: 10 }]}>
            <Ionicons name="time" size={20} color="#fff" />
            <Text style={styles.sheetHeaderTitle}>SELECT A TEE TIME</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeScroll}>
            {timeSlots.map((slot) => {
              const isActive = selectedSlot === slot.value;
              return (
                <TouchableOpacity key={slot.id} style={[styles.timeSlot, isActive && styles.timeSlotActive]} onPress={() => setSelectedSlot(slot.value)}>
                  <Text style={[styles.timeText, isActive && styles.timeTextActive]}>{slot.slotText}</Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
          {!isLoadingBookingData && dates.length > 0 && timeSlots.length === 0 ? (
            <Text style={styles.emptyText}>No available time slots on the selected date.</Text>
          ) : null}
        </ScrollView>

        <View style={styles.footerRow}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.costLabel}>Cost:</Text>
            <Text style={styles.costValue}> RS{service.price}</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              (!selectedSlot || initiatePaymentMutation.isPending) && styles.actionBtnDisabled,
            ]}
            onPress={handleBookNow}
            disabled={!selectedSlot || initiatePaymentMutation.isPending}
          >
            <Text style={styles.actionBtnText}>
              {initiatePaymentMutation.isPending ? "PROCESSING..." : "BOOK NOW"}
            </Text>
          </TouchableOpacity>
        </View>

        {pendingGatewayPayment?.paymentId ? (
          <View style={styles.verifyRow}>
            <Text style={styles.verifyHint}>Payment initiated via {pendingGatewayPayment.method}. Return after payment and verify.</Text>
            <TouchableOpacity
              style={[styles.verifyBtn, (verifyEsewaMutation.isPending || verifyKhaltiMutation.isPending) && styles.actionBtnDisabled]}
              onPress={handleVerifyPayment}
              disabled={verifyEsewaMutation.isPending || verifyKhaltiMutation.isPending}
            >
              <Text style={styles.verifyBtnText}>
                {(verifyEsewaMutation.isPending || verifyKhaltiMutation.isPending) ? "VERIFYING..." : "VERIFY PAYMENT"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

      </Animated.View>

      <BookingPaymentModal
        visible={paymentModalVisible}
        mode="payment"
        serviceLabel="Caddie Advance"
        totalAmount={totalAmount}
        advanceAmount={advanceAmount}
        paymentMethod={paymentMethod}
        onSelectMethod={setPaymentMethod}
        onConfirm={handleConfirmPayment}
        onClose={() => setPaymentModalVisible(false)}
        isSubmitting={initiatePaymentMutation.isPending}
      />

      <BookingPaymentModal
        visible={confirmationVisible}
        mode="success"
        serviceLabel="Caddie Advance"
        onClose={handleConfirmationClose}
      />
    </View>
  );
}

const BookingSkeleton = () => (
  <View style={styles.step1Content}>
    <View style={styles.skeletonHeader} />
    <View style={styles.skeletonTitle} />
    <View style={styles.skeletonParagraph} />
    <View style={styles.skeletonParagraph} />
    <View style={styles.skeletonRow} />
    <View style={styles.skeletonRow} />
  </View>
);

const COLORS = { 
  dark: "#2A2E2A", 
  darker: "#222622",
  green: "#798D3D", 
  white: "#FFFFFF",
  gray: "#CCCCCC",
  lightGray: "#DDDDDD"
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.darker },
  
  backgroundImage: { width: SCREEN_WIDTH, height: IMAGE_HEIGHT },
  
  backBtn: { marginLeft: 20, marginTop: 10 },
  
  caddieName: { 
    color: COLORS.white, 
    fontSize: 36, 
    fontFamily: "Bebas", 
    marginBottom: 5, 
    textShadowColor: 'rgba(0,0,0,0.5)', 
    textShadowOffset: { width: 1, height: 1 }, 
    textShadowRadius: 5 
  },

  headerTextContainer: {
    position: "absolute",
    bottom: BOTTOM_SHEET_HEIGHT + 20, 
    left: 20,
    right: 20,
    zIndex: 10,
  },
  
  cardContainer: { 
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
    zIndex: 20,
  },
  scrollArea: { flex: 1, marginBottom: 10 }, 

  step1Content: { paddingHorizontal: 25 }, // ADDED wrapper padding

sectionHeaderSmall: {
  color: COLORS.white,
  fontFamily: "Bebas",
  fontSize: 20,
  marginBottom: 15,
  letterSpacing: 1,
},

bigCardTitle: {
  color: COLORS.white,
  fontFamily: "Bebas",
  fontSize: 22,
  marginBottom: 10,
  letterSpacing: 0.5,
},

bigCardDesc: {
  color: COLORS.gray,
  fontFamily: "Abel",
  fontSize: 16,
  lineHeight: 24,
},

infoTable: {
  marginTop: 20,
  marginBottom: 15,
},

infoRow: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 15,
},

infoLabel: {
  width: 130,
  color: COLORS.white,
  fontFamily: "Bebas",
  fontSize: 18,
  letterSpacing: 0.5,
},

infoValueContainer: {
  flexDirection: "row",
  alignItems: "center",
},

infoValue: {
  fontFamily: "Abel",
  fontSize: 18,
  marginLeft: 5,
  color: COLORS.lightGray,
},

nextBtnContainer: {
  alignItems: "flex-end",
  paddingTop: 10,
  paddingHorizontal: 25,
}, 

  actionBtn: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  actionBtnDisabled: {
    opacity: 0.6,
  },

  actionBtnText: {
    fontSize: 20,
    fontFamily: "Bebas",
    color: COLORS.white,
    letterSpacing: 1,
  },

  summaryPill: {
    backgroundColor: "rgba(80, 90, 80, 0.7)",
    padding: 15,
    borderRadius: 15,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  pillLabel: {
    color: COLORS.white,
    fontFamily: "Bebas",
    fontSize: 18,
    marginBottom: 4,
    letterSpacing: 0.5,
  },

  pillRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  pillTitle: {
    color: COLORS.white,
    fontFamily: "Abel",
    fontSize: 16,
    marginRight: 8,
  },

  pillDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },

  pillDetailText: {
    color: COLORS.white,
    fontFamily: "Abel",
    fontSize: 14,
    marginLeft: 4,
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 8,
    paddingHorizontal: 25,
  }, 

  sheetHeaderTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: "Bebas",
    letterSpacing: 1,
  },

  dateScroll: {
    paddingBottom: 15,
    paddingLeft: 25,
    paddingRight: 10,
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
    lineHeight: 32,
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

  timeScroll: {
    paddingBottom: 15,
    paddingLeft: 25,
    paddingRight: 10,
  }, 

  timeSlot: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.white,
    borderRadius: 25,
    marginRight: 15,
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
    fontFamily: "Abel",
    fontSize: 18,
  },

  emptyText: {
    color: COLORS.lightGray,
    fontFamily: "Abel",
    fontSize: 14,
    paddingHorizontal: 25,
    marginTop: 4,
  },

  skeletonHeader: {
    width: 140,
    height: 20,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginBottom: 14,
  },

  skeletonTitle: {
    width: "82%",
    height: 24,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginBottom: 10,
  },

  skeletonParagraph: {
    width: "100%",
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.14)",
    marginBottom: 8,
  },

  skeletonRow: {
    width: "92%",
    height: 18,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.16)",
    marginTop: 12,
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    paddingHorizontal: 25,
  }, 

  costLabel: {
    color: COLORS.gray,
    fontSize: 16,
    fontFamily: "Abel",
  },

  costValue: {
    color: COLORS.white,
    fontSize: 22,
    fontFamily: "Bebas",
  },
  verifyRow: {
    marginTop: 10,
    paddingHorizontal: 25,
    gap: 10,
  },
  verifyHint: {
    color: COLORS.lightGray,
    fontFamily: "Abel",
    fontSize: 13,
  },
  verifyBtn: {
    backgroundColor: "#3E5C45",
    borderRadius: 22,
    alignItems: "center",
    paddingVertical: 10,
  },
  verifyBtnText: {
    color: COLORS.white,
    fontFamily: "Bebas",
    fontSize: 18,
    letterSpacing: 0.6,
  },
});
