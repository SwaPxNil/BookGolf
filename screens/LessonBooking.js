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
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCoachAvailability } from "../hooks/useCoach";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.45;
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.6; 

export default function LessonBookingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const coachId = route?.params?.coachId || route?.params?.coach?.id || route?.params?.coach?._id;
  const {
    data: availabilityResponse,
    isLoading: availabilityLoading,
    refetch: refetchAvailability,
  } = useCoachAvailability(coachId, { retry: false });
  
  const coach = route?.params?.coach || {
    name: "RAMESH KARKI",
    image: require("../assets/images/coach2.png"), 
  };

  const coachImageSource = coach?.imageUrl
    ? { uri: coach.imageUrl }
    : coach?.image_url
    ? { uri: coach.image_url }
    : coach?.profile_img
    ? { uri: coach.profile_img }
    : coach?.image
    ? coach.image
    : require("../assets/images/coach2.png");
  
  const lesson = route?.params?.lesson || {
    title: "FULL SWING ANALYSIS",
    fullDescription: "Improve your swing mechanics and consistency through detailed video analysis. The coach will record and break down your swing to identify issues with grip, stance, and motion, then provide clear adjustments and drills to help you develop a more efficient and repeatable swing.\n\nAnalyze and refine your swing with detailed video feedback from your coach. Identify key mechanical issues and learn simple adjustments to build a more consistent and powerful swing.",
    time: "60min",
    level: "Intermediate",
    price: "12000"
  };

  const [step, setStep] = useState(1); 
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [refreshing, setRefreshing] = useState(false);

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

  // ----- ANIMATION INTERPOLATIONS -----
  const bigCardTranslateY = animState.interpolate({ inputRange: [0, 1, 2], outputRange: [SCREEN_HEIGHT, 0, SCREEN_HEIGHT] });
  const bigCardOpacity = animState.interpolate({ inputRange: [0, 1, 1.5, 2], outputRange: [0, 1, 0, 0] });
  const smallPillOpacity = animState.interpolate({ inputRange: [0, 1, 1.5, 2], outputRange: [0, 0, 0, 1] });
  const bottomSheetTranslateY = animState.interpolate({ inputRange: [0, 1, 2], outputRange: [SCREEN_HEIGHT, SCREEN_HEIGHT, 0] });
  
  const headerTranslateY = animState.interpolate({ inputRange: [0, 1, 2], outputRange: [85, 85, 0] });

  const availabilitySlots = Array.isArray(availabilityResponse?.data?.data)
    ? availabilityResponse.data.data
    : Array.isArray(coach?.availability_slots)
    ? coach.availability_slots
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

  const isLoadingBookingData = Boolean(coachId) && availabilityLoading;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchAvailability();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* BACKGROUND IMAGE */}
      <ImageBackground 
        source={coachImageSource} 
        style={styles.backgroundImage} 
        resizeMode="cover"
      >
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Ionicons name="return-up-back-outline" size={32} color="#000" />
          </TouchableOpacity>
        </SafeAreaView>
      </ImageBackground>

      {/* HEADER CONTENT */}
      <Animated.View style={[styles.headerTextContainer, { transform: [{ translateY: headerTranslateY }] }]}>
        <Text style={styles.coachName}>{coach.name.toUpperCase()}</Text>

        <Animated.View style={[styles.summaryPill, { opacity: smallPillOpacity }]}>
          <Text style={styles.pillLabel}>LESSON DETAILS</Text>
          <View style={styles.pillRow}>
            <Text style={styles.pillTitle}>{lesson.title.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</Text>
            
            <View style={styles.pillDetail}>
              <Ionicons name="time-outline" size={14} color="#FFF" />
              <Text style={styles.pillDetailText}>{lesson.time}</Text>
            </View>
            
            <View style={styles.pillDetail}>
              <Ionicons name="stats-chart" size={14} color="#FAFF5D" />
              <Text style={[styles.pillDetailText, { color: "#FAFF5D" }]}>{lesson.level}</Text>
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
              <Text style={styles.sectionHeaderSmall}>LESSON DETAILS</Text>
              <Text style={styles.bigCardTitle}>{lesson.title.toUpperCase()}</Text>
              <Text style={styles.bigCardDesc}>{lesson.fullDescription}</Text>
              
              <View style={styles.infoTable}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>LESSON PERIOD</Text>
                  <View style={styles.infoValueContainer}>
                    <Ionicons name="time-outline" size={18} color="#FFF" />
                    <Text style={styles.infoValue}>{lesson.time}</Text>
                  </View>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>DIFFICULTY</Text>
                  <View style={styles.infoValueContainer}>
                    <Ionicons name="stats-chart" size={18} color="#FAFF5D" />
                    <Text style={[styles.infoValue, { color: "#FAFF5D" }]}>{lesson.level}</Text>
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
          
          {/* DATE SELECTION */}
          <View style={styles.sheetHeader}>
            <Ionicons name="calendar" size={20} color="#fff" />
            <Text style={styles.sheetHeaderTitle}>SELECT A RESERVATION DATE</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
            {dates.map((item) => {
              const isActive = activeDateValue === item.value;
              return (
                <TouchableOpacity key={item.value} style={[styles.dateItem, isActive && styles.dateItemActive]} onPress={() => setSelectedDate(item.value)}>
                  <Text style={[styles.dateNumber, isActive && styles.dateNumberActive]}>{item.day}</Text>
                  <Text style={[styles.dateLabel, isActive && styles.dateLabelActive]}>{item.label}</Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
          {!isLoadingBookingData && dates.length === 0 ? (
            <Text style={styles.emptyText}>No available reservation dates for this coach.</Text>
          ) : null}

          {/* TIME SELECTION */}
          <View style={[styles.sheetHeader, { marginTop: 10 }]}>
            <Ionicons name="time" size={20} color="#fff" />
            <Text style={styles.sheetHeaderTitle}>SELECT A TIME SLOT</Text>
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

        {/* Fixed Footer (Step 2) */}
        <View style={styles.footerRow}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.costLabel}>Cost:</Text>
            <Text style={styles.costValue}> RS{lesson.price}</Text>
          </View>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>BOOK NOW</Text>
          </TouchableOpacity>
        </View>

      </Animated.View>
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
  
  coachName: { 
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
    backgroundColor: "rgba(42, 46, 42, 0.82)", 
    borderTopLeftRadius: 35,  
    borderTopRightRadius: 35, 
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.16)",
    overflow: "hidden",
    paddingTop: 30, 
    paddingBottom: 25, 
    zIndex: 20,
    
  },
  
  scrollArea: {
  flex: 1,
  marginBottom: 10,
  },

  step1Content: {
    paddingHorizontal: 25,
  },

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
    marginRight: 15,
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
    marginRight: 15,
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
});