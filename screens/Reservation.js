import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Feather, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.42; 

export default function ReservationScreen({ route }) {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  
  const course = route?.params?.course || {
    name: "GOKARNA FOREST RESORT",
    image: require("../assets/images/course1.png"),
  };

  const courseImageSource = course?.imageUrl
    ? { uri: course.imageUrl }
    : course?.image_url
    ? { uri: course.image_url }
    : course?.image
    ? course.image
    : require("../assets/images/course1.png");

  const courseName = course.name;
  const selectedPrice = "12000";

  const dates = [
    { day: "16", label: "Mon", value: "2026-03-16" },
    { day: "17", label: "Tue", value: "2026-03-17" },
    { day: "18", label: "Wed", value: "2026-03-18" },
    { day: "19", label: "Thu", value: "2026-03-19" },
    { day: "20", label: "Fri", value: "2026-03-20" },
  ];

  const timeSlots = [
    { id: 1, slotText: "12:30 - 13:30" },
    { id: 2, slotText: "13:30 - 14:30" },
    { id: 3, slotText: "14:30 - 15:30" },
    { id: 4, slotText: "15:30 - 16:30" },
    { id: 5, slotText: "16:30 - 17:30" }, 
  ];

  const activeDateValue = selectedDate || dates[0]?.value || "";

  const handleRefresh = async () => {
    setRefreshing(true);
    setSelectedDate("");
    setSelectedSlot("");
    setTimeout(() => {
      setRefreshing(false);
    }, 400);
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
            <Ionicons name="return-up-back-outline" size={32} color="#000" />
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
                onPress={() => setSelectedDate(item.value)}
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
                style={[styles.timeSlot, selectedSlot === slot.slotText && styles.timeSlotActive]}
                onPress={() => setSelectedSlot(slot.slotText)}
              >
                <Text style={[styles.timeText, selectedSlot === slot.slotText && styles.timeTextActive]}>
                  {slot.slotText}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
        </ScrollView>

        {/* FIXED FOOTER */}
        <View style={styles.footerRow}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.costText}>Cost: </Text>
            <Text style={styles.price}>Rs{selectedPrice}</Text>
          </View>

          <TouchableOpacity style={styles.bookBtn}>
            <Text style={styles.bookText}>BOOK NOW</Text>
          </TouchableOpacity>
        </View>

      </View>
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
    height: SCREEN_HEIGHT,
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
  },

  bottomSheet: {
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

  bookText: {
    fontSize: 20,
    fontFamily: "Bebas",
    color: COLORS.white,
    letterSpacing: 1,
  },
});