import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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
import { useCourseAdmins } from "../hooks/useSuperAdmin";
import { useAdminLogs } from "../hooks/useAdminLog";

export default function ProfileScreen() {
  const { width, height } = useWindowDimensions();
  const navigation = useNavigation();
  const [currentTab, setCurrentTab] = useState("profile");
  const { data: profileData, isLoading: profileLoading, isError: profileError } = useMyProfile({ retry: false });
  const { data: paymentsData } = useMyPayments({ retry: false });
  const { data: courseAdminsData } = useCourseAdmins({ retry: false });
  const { data: adminLogsData } = useAdminLogs({ retry: false });
  const refreshTokenMutation = useRefreshToken();

  const profile = profileData?.data?.data ?? profileData?.data ?? {};
  const payments = Array.isArray(paymentsData?.data?.data)
    ? paymentsData.data.data
    : Array.isArray(paymentsData?.data)
    ? paymentsData.data
    : [];
  const courseAdmins = Array.isArray(courseAdminsData?.data)
    ? courseAdminsData.data
    : Array.isArray(courseAdminsData?.data?.data)
    ? courseAdminsData.data.data
    : [];
  const adminLogs = Array.isArray(adminLogsData?.data?.data)
    ? adminLogsData.data.data
    : Array.isArray(adminLogsData?.data)
    ? adminLogsData.data
    : [];

  const handleTabPress = (tab) => navigation.navigate(tab);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* BACK BUTTON */}
      <TouchableOpacity
        style={{ paddingTop: height * 0.015, paddingLeft: width * 0.04 }}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={26} color="#262B27" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
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
            source={require("../assets/images/Avatar.png")}
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
          >
            <Ionicons name="pencil" size={16} color="#798D3D" />
          </TouchableOpacity>
        </View>

        <Text
          style={{
            textAlign: "center",
            fontSize: width * 0.08,
            color: "#1A1A1A",
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
            color: "#333",
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
            backgroundColor: "#262B27",
            marginHorizontal: width * 0.05,
            marginTop: height * 0.025,
            padding: width * 0.045,
            borderRadius: width * 0.05,
          }}
        >
          <Option icon="person-outline" title="Edit profile information" />
          <OptionRight icon="notifications" title="Notifications" value="ON" />
          <OptionRight icon="language-sharp" title="Language" value="ENGLISH" />
          <OptionRight icon="card-outline" title="Payments" value={`${payments.length}`} />
        </View>

        {/* SECOND CARD */}
        <View
          style={{
            backgroundColor: "#262B27",
            marginHorizontal: width * 0.05,
            marginTop: height * 0.02,
            padding: width * 0.045,
            borderRadius: width * 0.05,
          }}
        >
          <Option icon="lock-closed-outline" title="Security" />
          <OptionRight icon="sunny-outline" title="Theme" value="Light mode" />
          <OptionRight icon="refresh-outline" title="Session" value={refreshTokenMutation.isPending ? "Refreshing" : "Active"} />
        </View>

        {/* THIRD CARD */}
        <View
          style={{
            backgroundColor: "#262B27",
            marginHorizontal: width * 0.05,
            marginTop: height * 0.02,
            padding: width * 0.045,
            borderRadius: width * 0.05,
          }}
        >
          <Option icon="help-circle" title="Help & Support" />
          <Option icon="mail-outline" title="Contact us" />
          <Option icon="document-text-outline" title="Privacy policy" />
          <OptionRight icon="people-outline" title="Course Admins" value={`${courseAdmins.length}`} />
          <OptionRight icon="list-outline" title="Admin Logs" value={`${adminLogs.length}`} />
        </View>

        {/* NAVBAR SPACING */}
        <View style={{ height: height * 0.15 }} />
      </ScrollView>

      {/* NAVBAR */}
      <Navbar
        currentTab={currentTab}
        onTabPress={handleTabPress}
        onPressMiddle={() => navigation.navigate("ReservationScreen")}
      />
    </SafeAreaView>
  );
}

/* ---------------------- REUSABLE OPTION COMPONENTS ---------------------- */

const Option = ({ icon, title }) => (
  <TouchableOpacity style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 }}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
      <Ionicons name={icon} size={20} color="#fff" />
      <Text style={{ color: "#fff", fontSize: 16, fontFamily: "Abel" }}>{title}</Text>
    </View>
  </TouchableOpacity>
);

const OptionRight = ({ icon, title, value }) => (
  <TouchableOpacity style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 }}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
      <Ionicons name={icon} size={20} color="#fff" />
      <Text style={{ color: "#fff", fontSize: 16, fontFamily: "Abel" }}>{title}</Text>
    </View>
    <Text style={{ color: "#798D3D", fontSize: 20, fontFamily: "Bebas" }}>{value}</Text>
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
