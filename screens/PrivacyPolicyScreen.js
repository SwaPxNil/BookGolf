import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeContext";

const SECTIONS = [
  {
    title: "Information We Collect",
    body:
      "We collect account details such as your name, email, phone number, booking preferences, and payment records required to provide golf booking services.",
  },
  {
    title: "How We Use Information",
    body:
      "Your information is used to confirm bookings, process payments, provide reminders, improve coach and caddie recommendations, and maintain account security.",
  },
  {
    title: "Sharing and Protection",
    body:
      "We do not sell personal data. Information is shared only with required service providers for booking, payment, and communication support. We use access controls and secure transport to protect data.",
  },
  {
    title: "Your Controls",
    body:
      "You can review and update profile details, manage notifications, and request account deletion from the Security section in your profile.",
  },
  {
    title: "Contact",
    body:
      "For privacy requests, contact support@golfbooking.com or +977-9800000000.",
  },
];

export default function PrivacyPolicyScreen({ navigation }) {
  const { theme, mode } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}> 
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Image source={require("../assets/icons/Back.png")} style={{ width: 32, height: 32, tintColor: theme.icon }} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.textPrimary }]}>PRIVACY POLICY</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>How CLUB 1917 handles your information.</Text>

      <ScrollView contentContainerStyle={styles.contentWrap} showsVerticalScrollIndicator={false}>
        {SECTIONS.map((section) => (
          <View
            key={section.title}
            style={[
              styles.card,
              {
                borderColor: theme.line,
                backgroundColor: mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(46,74,55,0.05)",
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{section.title}</Text>
            <Text style={[styles.cardBody, { color: theme.textSecondary }]}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  backBtn: { marginTop: 4, marginBottom: 8 },
  title: { fontFamily: "Bebas", fontSize: 52, lineHeight: 52 },
  subtitle: { fontFamily: "Abel", fontSize: 20, marginTop: 2, marginBottom: 12 },
  contentWrap: { paddingBottom: 26 },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  cardTitle: { fontFamily: "Bebas", fontSize: 28, marginBottom: 4 },
  cardBody: { fontFamily: "Abel", fontSize: 18, lineHeight: 23 },
});
