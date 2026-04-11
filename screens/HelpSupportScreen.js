import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeContext";
import { usePopup } from "../context/PopupContext";

const ISSUE_TYPES = ["Bookings", "Coaches", "Caddies", "Payments", "Technical", "Other"];

export default function HelpSupportScreen({ navigation }) {
  const { theme, mode } = useTheme();
  const { showPopup } = usePopup();
  const [issueType, setIssueType] = useState("Bookings");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      showPopup({ title: "Missing details", message: "Please fill in subject and message." });
      return;
    }

    const adminEmail = process.env.EXPO_PUBLIC_ADMIN_EMAIL || "support@golfbooking.com";
    const mailto = `mailto:${adminEmail}?subject=${encodeURIComponent(`[${issueType}] ${subject.trim()}`)}&body=${encodeURIComponent(message.trim())}`;

    try {
      await Linking.openURL(mailto);
    } catch (error) {
      showPopup({ title: "Unable to open email", message: "Please try again later." });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}> 
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Image source={require("../assets/icons/Back.png")} style={{ width: 32, height: 32, tintColor: theme.icon }} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.textPrimary }]}>HELP & SUPPORT</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Raise a question about bookings, coaches, payments, or anything else.</Text>

      <ScrollView contentContainerStyle={styles.contentWrap} showsVerticalScrollIndicator={false}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>Issue Type</Text>
        <View style={styles.tagWrap}>
          {ISSUE_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.tag, issueType === type && styles.tagActive]}
              onPress={() => setIssueType(type)}
            >
              <Text style={[styles.tagText, issueType === type && styles.tagTextActive]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: theme.textPrimary }]}>Subject</Text>
        <TextInput
          style={[styles.input, { color: mode === "dark" ? "#F2F4EE" : "#222", borderColor: theme.line, backgroundColor: mode === "dark" ? "#2B332D" : "#f5f0e3" }]}
          value={subject}
          onChangeText={setSubject}
          placeholder="Write a short subject"
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={[styles.label, { color: theme.textPrimary }]}>Message</Text>
        <TextInput
          style={[styles.input, styles.textArea, { color: mode === "dark" ? "#F2F4EE" : "#222", borderColor: theme.line, backgroundColor: mode === "dark" ? "#2B332D" : "#f5f0e3" }]}
          value={message}
          onChangeText={setMessage}
          placeholder="Describe your issue in detail"
          placeholderTextColor={theme.textSecondary}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>SUBMIT QUESTION</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E7E2D3", paddingHorizontal: 20 },
  backBtn: { marginTop: 4, marginBottom: 10 },
  title: { fontFamily: "Bebas", fontSize: 54, color: "#262B27" },
  subtitle: { fontFamily: "Abel", fontSize: 22, color: "#333", marginBottom: 14 },
  contentWrap: { paddingBottom: 30 },
  label: { fontFamily: "Bebas", fontSize: 28, color: "#262B27", marginTop: 12 },
  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  tag: {
    borderWidth: 1,
    borderColor: "#4b5b3f",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(121,141,61,0.1)",
  },
  tagActive: { backgroundColor: "#798D3D", borderColor: "#798D3D" },
  tagText: { fontFamily: "Abel", fontSize: 17, color: "#34412d" },
  tagTextActive: { color: "#fff" },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#2f3a2c",
    borderRadius: 16,
    backgroundColor: "#f5f0e3",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "Abel",
    fontSize: 19,
    color: "#222",
  },
  textArea: { minHeight: 140 },
  submitBtn: {
    marginTop: 18,
    backgroundColor: "#2E4A37",
    borderRadius: 999,
    alignItems: "center",
    paddingVertical: 12,
  },
  submitBtnText: { color: "#fff", fontFamily: "Bebas", fontSize: 26, letterSpacing: 0.6 },
});
