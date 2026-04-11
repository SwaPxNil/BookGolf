import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeContext";
import { usePopup } from "../context/PopupContext";

export default function ContactUsScreen({ navigation }) {
  const { theme } = useTheme();
  const { showPopup } = usePopup();
  const coursePhone = process.env.EXPO_PUBLIC_COURSE_PHONE || "+9779800000000";
  const adminEmail = process.env.EXPO_PUBLIC_ADMIN_EMAIL || "support@golfbooking.com";

  const handleCall = async () => {
    try {
      await Linking.openURL(`tel:${coursePhone}`);
    } catch {
      showPopup({ title: "Unable to call", message: "Please try again later." });
    }
  };

  const handleEmail = async () => {
    try {
      await Linking.openURL(`mailto:${adminEmail}?subject=${encodeURIComponent("User Support Request")}`);
    } catch {
      showPopup({ title: "Unable to open email", message: "Please try again later." });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}> 
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Image source={require("../assets/icons/Back.png")} style={{ width: 32, height: 32, tintColor: theme.icon }} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.textPrimary }]}>CONTACT US</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>COURSE CONTACT PHONE</Text>
        <Text style={styles.cardValue}>{coursePhone}</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
          <Text style={styles.actionBtnText}>CALL COURSE</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>ADMIN SUPPORT EMAIL</Text>
        <Text style={styles.cardValue}>{adminEmail}</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={handleEmail}>
          <Text style={styles.actionBtnText}>EMAIL ADMIN</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E7E2D3", paddingHorizontal: 20 },
  backBtn: { marginTop: 4, marginBottom: 10 },
  title: { fontFamily: "Bebas", fontSize: 54, color: "#262B27", marginBottom: 12 },
  card: {
    backgroundColor: "#262B27",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: { color: "#C8D4A0", fontFamily: "Bebas", fontSize: 24, letterSpacing: 0.6 },
  cardValue: { color: "#fff", fontFamily: "Abel", fontSize: 22, marginTop: 6 },
  actionBtn: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: "#798D3D",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  actionBtnText: { color: "#fff", fontFamily: "Bebas", fontSize: 22, letterSpacing: 0.5 },
});
