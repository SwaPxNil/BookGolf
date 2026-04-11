import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Image,
  useWindowDimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Navbar from "../components/Navbar";
import { useNavigation } from "@react-navigation/native";
import { useMyProfile, useRefreshToken } from "../hooks/useAuth";
import { useMyPayments } from "../hooks/usePayment";
import { clearAuthTokens } from '../api/tokenStorage';
import { emitLogout } from '../api/axiosInstance';
import { useTheme } from "../theme/ThemeContext";
import {
  getNotificationSettings,
  NOTIFICATION_PREFERENCES,
  setNotificationEnabled,
  setNotificationPreference,
} from "../utils/notificationSettings";
  // Logout handler
  const handleLogout = async () => {
    await clearAuthTokens();
    emitLogout();
  };

export default function ProfileScreen() {
  const { width, height } = useWindowDimensions();
  const navigation = useNavigation();
  const { theme, mode, toggleTheme } = useTheme();
  const [currentTab, setCurrentTab] = useState("profile");
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationPreference, setNotificationPreferenceState] = useState(NOTIFICATION_PREFERENCES.ALL);
  const {
    data: profileData,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = useMyProfile({ retry: false });
  const { data: paymentsData, refetch: refetchPayments } = useMyPayments({ retry: false });
  const refreshTokenMutation = useRefreshToken();

  useEffect(() => {
    let mounted = true;

    const loadNotificationSettings = async () => {
      const settings = await getNotificationSettings();
      if (!mounted) {
        return;
      }

      setNotificationsEnabled(settings.enabled);
      setNotificationPreferenceState(settings.preference);
    };

    loadNotificationSettings();

    return () => {
      mounted = false;
    };
  }, []);

  const profile = profileData?.data?.data ?? profileData?.data ?? {};
  const payments = Array.isArray(paymentsData?.data?.data)
    ? paymentsData.data.data
    : Array.isArray(paymentsData?.data)
    ? paymentsData.data
    : [];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.allSettled([
        refetchProfile(),
        refetchPayments(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleTabPress = (tab) => navigation.navigate(tab);

  const handleToggleNotifications = async () => {
    const nextValue = !notificationsEnabled;
    setNotificationsEnabled(nextValue);
    await setNotificationEnabled(nextValue);
  };

  const handleCycleNotificationPreference = async () => {
    const nextPreference =
      notificationPreference === NOTIFICATION_PREFERENCES.ALL
        ? NOTIFICATION_PREFERENCES.BOOKINGS_ONLY
        : NOTIFICATION_PREFERENCES.ALL;

    setNotificationPreferenceState(nextPreference);
    await setNotificationPreference(nextPreference);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}> 
      <StatusBar style={mode === "dark" ? "light" : "dark"} />

      {/* BACK BUTTON */}
      <TouchableOpacity
        style={{ paddingTop: height * 0.015, paddingLeft: width * 0.04 }}
        onPress={() => navigation.goBack()}
      >
        <Image
          source={require("../assets/icons/Back.png")}
          style={{ width: 32, height: 32, tintColor: theme.icon }}
        />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#333" />
        }
      >
        {/* PROFILE IMAGE + EDIT */}
        <View
          style={{
            alignSelf: "center",
            marginTop: height * 0.02,
            width: width * 0.28,
            height: width * 0.28,
          }}
        >
          <Image
            source={
              profile?.profile_img
                ? { uri: profile.profile_img }
                : require("../assets/images/Avatar.png")
            }
            style={{ width: "100%", height: "100%", borderRadius: (width * 0.28) / 2 }}
          />
          <TouchableOpacity
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              backgroundColor: "#262B27",
              width: width * 0.08,
              height: width * 0.08,
              borderRadius: width * 0.04,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Ionicons name="pencil" size={16} color="#798D3D" />
          </TouchableOpacity>
        </View>

        <Text
          style={{
            textAlign: "center",
            fontSize: width * 0.08,
            color: theme.textPrimary,
            marginTop: height * 0.015,
            fontFamily: "Bebas",
          }}
        >
          {profile?.full_name || (profileLoading ? "Loading..." : "Profile")}
        </Text>
        <Text
          style={{
            textAlign: "center",
            fontSize: width * 0.036,
            color: theme.textSecondary,
            fontFamily: "Abel",
          }}
        >
          {profile?.email || "-"} | {profile?.phone || "-"}
        </Text>
        {profileError ? (
          <Text style={{ textAlign: "center", color: "#7a2a2a", fontFamily: "Abel", marginTop: 4 }}>
            Failed to load profile data.
          </Text>
        ) : null}

        {/* FIRST CARD */}
        <View
          style={{
            backgroundColor: theme.card,
            marginHorizontal: width * 0.05,
            marginTop: height * 0.025,
            padding: width * 0.045,
            borderRadius: width * 0.05,
          }}
        >
          <Option
            icon="person-outline"
            title="Edit profile information"
            theme={theme}
            onPress={() => navigation.navigate("EditProfile")}
          />
          <OptionRight
            icon="notifications"
            title="Notifications"
            value={notificationsEnabled ? "ON" : "OFF"}
            theme={theme}
            onPress={handleToggleNotifications}
          />
          <OptionRight
            icon="options-outline"
            title="Notification Pref"
            value={notificationPreference === NOTIFICATION_PREFERENCES.ALL ? "ALL" : "BOOKINGS"}
            theme={theme}
            onPress={handleCycleNotificationPreference}
          />
          <OptionRight icon="language-sharp" title="Language" value="ENGLISH" theme={theme} />
          <OptionRight
            icon="card-outline"
            title="Payments"
            value={`${payments.length}`}
            theme={theme}
            onPress={() => navigation.navigate("Payments")}
          />
          <Option icon="bookmark-outline" title="My Bookings" theme={theme} onPress={() => navigation.navigate("MyBookings")} />
        </View>

        {/* SECOND CARD */}
        <View
          style={{
            backgroundColor: theme.card,
            marginHorizontal: width * 0.05,
            marginTop: height * 0.02,
            padding: width * 0.045,
            borderRadius: width * 0.05,
          }}
        >
          <Option icon="lock-closed-outline" title="Security" theme={theme} onPress={() => navigation.navigate("Security")} />
          <OptionRight
            icon="sunny-outline"
            title="Theme"
            value={mode === "dark" ? "Dark mode" : "Light mode"}
            theme={theme}
            onPress={toggleTheme}
          />
          <OptionRight
            icon="refresh-outline"
            title="Session"
            value={refreshTokenMutation.isPending ? "Refreshing" : "Active"}
            theme={theme}
          />
        </View>

        {/* THIRD CARD */}
        <View
          style={{
            backgroundColor: theme.card,
            marginHorizontal: width * 0.05,
            marginTop: height * 0.02,
            padding: width * 0.045,
            borderRadius: width * 0.05,
          }}
        >
          <Option icon="help-circle" title="Help & Support" theme={theme} onPress={() => navigation.navigate("HelpSupport")} />
          <Option icon="mail-outline" title="Contact us" theme={theme} onPress={() => navigation.navigate("ContactUs")} />
          <Option icon="document-text-outline" title="Privacy policy" theme={theme} onPress={() => navigation.navigate("PrivacyPolicy")} />
          {/* Logout Button */}
          <TouchableOpacity
            style={{
              marginTop: 18,
              backgroundColor: '#7a2a2a',
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: 'center',
            }}
            onPress={handleLogout}
          >
            <Text style={{ color: '#fff', fontSize: 18, fontFamily: 'Bebas' }}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* NAVBAR SPACING */}
        <View style={{ height: height * 0.15 }} />
      </ScrollView>

      {/* NAVBAR */}
      <Navbar
        currentTab={currentTab}
        onTabPress={handleTabPress}
        onPressMiddle={() => navigation.navigate("CourseScreen")}
      />
    </SafeAreaView>
  );
}

/* ---------------------- REUSABLE OPTION COMPONENTS ---------------------- */

const Option = ({ icon, title, onPress, theme }) => (
  <TouchableOpacity
    style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 }}
    onPress={onPress}
    disabled={!onPress}
  >
    <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
      <Ionicons name={icon} size={20} color="#fff" />
      <Text style={{ color: "#fff", fontSize: 16, fontFamily: "Abel" }}>{title}</Text>
    </View>
  </TouchableOpacity>
);

const OptionRight = ({ icon, title, value, onPress, theme }) => (
  <TouchableOpacity
    style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 }}
    onPress={onPress}
    disabled={!onPress}
  >
    <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
      <Ionicons name={icon} size={20} color="#fff" />
      <Text style={{ color: "#fff", fontSize: 16, fontFamily: "Abel" }}>{title}</Text>
    </View>
    <Text style={{ color: theme?.accent || "#798D3D", fontSize: 20, fontFamily: "Bebas" }}>{value}</Text>
  </TouchableOpacity>
);

/* ---------------------------- STYLES ---------------------------- */

const COLORS = {
  bg: "#E7E2D3",
  cardDark: "#262B27",
  lightText: "#DAD6C8",
  green: "#798D3D",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  backBtn: {
    paddingTop: 10,
    paddingLeft: 15,
  },

  profileWrapper: {
    alignSelf: "center",
    marginTop: 10,
    width: 110,
    height: 110,
  },

  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 55,
  },

  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#262B27",
    width: 32,
    height: 32,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  profileName: {
    textAlign: "center",
    fontSize: 32,
    color: "#1A1A1A",
    marginTop: 10,
    fontFamily:'Bebas'
  },

  profileMeta: {
    textAlign: "center",
    fontSize: 14,
    color: "#333",
    fontFamily:'Abel'
  },  card: {
    backgroundColor: COLORS.cardDark,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 18,
    borderRadius: 20,
  },

  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },

  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  optionText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Abel",},

  optionValue: {
    color: COLORS.green,
    fontSize: 20,
    fontFamily: "Bebas",
  },
});