import { useState, useCallback } from "react";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  RefreshControl,
  Image,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Navbar from "../components/Navbar";
import { useCalculateHandicap } from "../hooks/useHandicap";
import { useMyProfile } from "../hooks/useAuth";
import { useMyRounds } from "../hooks/useRound";

export default function MatchHistoryScreen() {
  const { width, height } = useWindowDimensions();
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");
  const [calculatedHandicap, setCalculatedHandicap] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const [currentTab, setCurrentTab] = useState("match");
  const calculateHandicapMutation = useCalculateHandicap();
  const { data: profileData } = useMyProfile({ retry: false });
  const {
    data: roundsData,
    isLoading: roundsLoading,
    isError: roundsError,
    refetch: refetchRounds,
  } = useMyRounds({ retry: false });
  const profile = profileData?.data?.data ?? profileData?.data ?? {};
  const avatarSource = profile?.profile_img
    ? { uri: profile.profile_img }
    : require("../assets/images/Avatar.png");

  const handleTabPress = (tab) => navigation.navigate(tab);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle("dark-content");
      return () => StatusBar.setBarStyle("default");
    }, [])
  );

  const rounds = Array.isArray(roundsData?.data?.data)
    ? roundsData.data.data
    : Array.isArray(roundsData?.data)
    ? roundsData.data
    : [];

  const recentRounds = rounds.slice(0, 4);

  const formatRoundDate = (round) => {
    const rawDate = round?.round_date || round?.played_at || round?.date;
    if (!rawDate) {
      return { dateText: "Unknown date", timeText: "" };
    }

    const parsedDate = new Date(rawDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return { dateText: "Unknown date", timeText: "" };
    }

    return {
      dateText: parsedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
      timeText: parsedDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const handleCalculateHandicap = async () => {
    if (!score1 || !score2) {
      Alert.alert("Missing scores", "Please enter both recent scores.");
      return;
    }

    try {
      const response = await calculateHandicapMutation.mutateAsync({
        recent_score_1: Number(score1),
        recent_score_2: Number(score2),
        course_id: 1,
      });
      const handicap =
        response?.data?.data?.handicap ??
        response?.data?.handicap ??
        response?.data?.calculated_handicap;
      setCalculatedHandicap(handicap ?? null);
    } catch (error) {
      const message =
        error?.response?.data?.message || "Could not calculate handicap right now.";
      Alert.alert("Calculation failed", String(message));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchRounds();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={[
          styles.profileContainer,
          { top: height * 0.055, right: width * 0.05 },
        ]}
        onPress={() => navigation.navigate("profile")}
      >
        <Image
          source={avatarSource}
          style={styles.profileImage}
        />
      </TouchableOpacity>

      <Header title="MATCH HISTORY" subtitle="Played rounds, refined handicap insights." />

      <ScrollView
        contentContainerStyle={{ paddingBottom: height * 0.18 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#333" />
        }
      >
        <View
          style={[
            styles.card,
            { marginHorizontal: width * 0.05, padding: width * 0.05, borderRadius: width * 0.05 },
          ]}
        >
          <Text style={[styles.cardTitle, { fontSize: width * 0.06 }]}>HANDICAP CALCULATOR</Text>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, { width: "48%", fontSize: width * 0.04, padding: width * 0.03 }]}
              placeholder="Recent Score 1"
              value={score1}
              onChangeText={setScore1}
              placeholderTextColor="#bcbcbc"
            />
            <TextInput
              style={[styles.input, { width: "48%", fontSize: width * 0.04, padding: width * 0.03 }]}
              placeholder="Recent Score 2"
              value={score2}
              onChangeText={setScore2}
              placeholderTextColor="#bcbcbc"
            />
          </View>

          <View style={styles.row}>
            <TouchableOpacity style={[styles.dropdown, { width: "48%", padding: width * 0.03 }]}>
              <Text style={styles.dropdownText}>Slope Rating</Text>
              <Feather name="chevron-down" size={18} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.dropdown, { width: "48%", padding: width * 0.03 }]}>
              <Text style={styles.dropdownText}>Course Rating</Text>
              <Feather name="chevron-down" size={18} color="#ccc" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.calculateBtn, { paddingVertical: width * 0.035, borderRadius: width * 0.05 }]}
            onPress={handleCalculateHandicap}
            disabled={calculateHandicapMutation.isPending}
          >
            <Text style={[styles.calculateText, { fontSize: width * 0.06 }]}>
              {calculateHandicapMutation.isPending ? "CALCULATING..." : "CALCULATE"}
            </Text>
          </TouchableOpacity>
          {calculatedHandicap !== null && (
            <Text style={styles.handicapResult}>Calculated handicap: {calculatedHandicap}</Text>
          )}
        </View>

        <Text style={[styles.recentTitle, { fontSize: width * 0.06, marginHorizontal: width * 0.055, marginTop: height * 0.03 }]}> 
          RECENT MATCHES
        </Text>

        {recentRounds.map((round, index) => {
          const { dateText, timeText } = formatRoundDate(round);
          return (
          <View
            key={index}
            style={[
              styles.matchItem,
              { marginHorizontal: width * 0.05, borderRadius: width * 0.035, padding: width * 0.035 },
            ]}
          >
            <Text style={[styles.matchDate, { fontSize: width * 0.048 }]}> 
              {dateText}{" "}
              <Text style={[styles.matchTime, { fontSize: width * 0.04 }]}> 
                {timeText}
              </Text>
            </Text>

            <View style={styles.scoreText}>
              <Text style={{ fontSize: width * 0.04, color: "#444", fontFamily: "Abel" }}>Score:</Text>
              <Text style={[styles.score, { fontSize: width * 0.07 }]}> 
                {round?.score ?? round?.total_score ?? "-"}
              </Text>
            </View>
          </View>
          );
        })}
        {roundsLoading ? <Text style={styles.metaText}>Loading match history...</Text> : null}
        {roundsError ? <Text style={styles.metaText}>Failed to load match history.</Text> : null}
        {!roundsLoading && !roundsError && recentRounds.length === 0 ? (
          <Text style={styles.metaText}>No rounds found.</Text>
        ) : null}
      </ScrollView>

      <Navbar
        currentTab={currentTab}
        onTabPress={handleTabPress}
        onPressMiddle={() => navigation.navigate("CourseScreen")}
      />
    </SafeAreaView>
  );
}

const COLORS = {
  bg: "#E7E2D3",
  cardDark: "#262B27",
  greenButton: "#798D3D",
  textDark: "#1A1A1A",
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  profileContainer: {
    position: "absolute",
    width: 45,
    height: 45,
    borderRadius: 25,
    overflow: "hidden",
    backgroundColor: "#ccc",
    zIndex: 10,
  },

  profileImage: {
    width: "100%",
    height: "100%",
  },

  card: {
    backgroundColor: COLORS.cardDark,
    marginTop: 25,
  },

  cardTitle: {
    alignSelf: "center",
    color: "#fff",
    marginBottom: 20,
    fontFamily: "Bebas",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  input: {
    backgroundColor: "#2D3A33",
    borderRadius: 10,
    color: "#fff",
    fontFamily: "Abel",
  },

  dropdown: {
    backgroundColor: "#2D3A33",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "Abel",
    color: "#fff",
  },

  dropdownText: { color: "#ccc" },

  calculateBtn: {
    marginTop: 18,
    backgroundColor: COLORS.greenButton,
    alignItems: "center",
  },

  calculateText: {
    color: "#fff",
    fontWeight: "700",
    fontFamily: "Bebas",
  },

  recentTitle: {
    color: COLORS.textDark,
    fontFamily: "Bebas",
  },

  matchItem: {
    backgroundColor: "rgba(38, 43, 39, 0.3)",
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.cardDark,
    alignItems: "center",
  },

  matchDate: {
    color: "#000",
    fontFamily: "Abel",
  },

  matchTime: {
    color: "#4B4D4B",
    fontFamily: "Abel",
  },

  scoreText: { flexDirection: "row", alignItems: "center", gap: 4 },

  score: { color: "#2E3D32", fontFamily: "Bebas" },

  handicapResult: {
    marginTop: 10,
    color: "#fff",
    fontFamily: "Abel",
    fontSize: 16,
    textAlign: "center",
  },
  metaText: {
    color: "#444",
    fontFamily: "Abel",
    fontSize: 16,
    marginHorizontal: 20,
    marginTop: 12,
  },
});
