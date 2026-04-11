import { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  RefreshControl,
  Image,
  StatusBar,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Navbar from "../components/Navbar";
import { useCalculateHandicap, useHandicapRating } from "../hooks/useHandicap";
import { useMyProfile } from "../hooks/useAuth";
import { useCreateRound, useMyRounds, useUpdateRoundScorecard } from "../hooks/useRound";
import { useCourses } from "../hooks/useCourse";
import { useTheme } from "../theme/ThemeContext";

const COURSE_PAR_TOTALS = [
  { aliases: ["royal nepal golf club", "royal nepal"], totalPar: 68 },
  { aliases: ["gokarna golf club", "gokarna", "gokarna forest golf resort"], totalPar: 72 },
  { aliases: ["yeti golf club", "yeti"], totalPar: 70 },
  { aliases: ["dharan golf club", "dharan"], totalPar: 70 },
  { aliases: ["himalayan golf club", "himalayan"], totalPar: 69 },
  { aliases: ["mustang golf couse", "mustang golf course", "mustang"], totalPar: 67 },
  { aliases: ["niravana country club", "nirvana country club", "niravana", "nirvana"], totalPar: 69 },
  { aliases: ["mithila nagari", "mithila"], totalPar: 68 },
];

const BASE_PAR_72 = [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 5, 3, 4, 4, 4, 3, 5, 4];
const REDUCE_ORDER = [0, 1, 4, 9, 13, 17, 3, 7, 10, 16, 5, 14];
const SCORE_LABEL_CELL_WIDTH = 62;
const SCORE_CELL_WIDTH = 46;
const FULL_ROW_WIDTH = SCORE_LABEL_CELL_WIDTH + SCORE_CELL_WIDTH * 18;

const normalizeCourseName = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

const getTotalParForCourse = (courseName) => {
  const normalized = normalizeCourseName(courseName);
  if (!normalized) {
    return 72;
  }

  const matched = COURSE_PAR_TOTALS.find((entry) =>
    entry.aliases.some((alias) => normalized.includes(alias))
  );

  return matched?.totalPar ?? 72;
};

const buildHoleParDistribution = (totalPar) => {
  const safeTotal = Math.min(72, Math.max(67, Number(totalPar) || 72));
  const parValues = [...BASE_PAR_72];
  let reductions = 72 - safeTotal;

  for (const index of REDUCE_ORDER) {
    if (reductions <= 0) {
      break;
    }
    if (parValues[index] > 3) {
      parValues[index] -= 1;
      reductions -= 1;
    }
  }

  return parValues;
};

export default function MatchHistoryScreen() {
  const { theme, mode } = useTheme();
  const { width, height } = useWindowDimensions();
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");
  const [calculatedHandicap, setCalculatedHandicap] = useState(null);
  const [showHandicapOverlay, setShowHandicapOverlay] = useState(false);
  const [selectedCourseName, setSelectedCourseName] = useState("");
  const [selectedCourseRating, setSelectedCourseRating] = useState(null);
  const [selectedSlopeRating, setSelectedSlopeRating] = useState(null);
  const [showCourseOptions, setShowCourseOptions] = useState(false);
  const [showAddRoundForm, setShowAddRoundForm] = useState(false);
  const [showAddRoundCourseOptions, setShowAddRoundCourseOptions] = useState(false);
  const [addRoundCourseId, setAddRoundCourseId] = useState("");
  const [addRoundCourseName, setAddRoundCourseName] = useState("");
  const [addRoundScore, setAddRoundScore] = useState("");
  const [showScorecardModal, setShowScorecardModal] = useState(false);
  const [selectedRoundForScorecard, setSelectedRoundForScorecard] = useState(null);
  const [holeScores, setHoleScores] = useState(Array.from({ length: 18 }, () => ""));
  const [savePopup, setSavePopup] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });
  const [refreshing, setRefreshing] = useState(false);
  const holeInputRefs = useRef([]);
  const navigation = useNavigation();
  const [currentTab, setCurrentTab] = useState("match");
  const calculateHandicapMutation = useCalculateHandicap();
  const createRoundMutation = useCreateRound();
  const updateRoundScorecardMutation = useUpdateRoundScorecard();
  const handicapRatingMutation = useHandicapRating();
  const { data: profileData } = useMyProfile({ retry: false });
  const { data: coursesResponse } = useCourses({ retry: false });
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
  const courses = Array.isArray(coursesResponse?.data?.data)
    ? coursesResponse.data.data
    : Array.isArray(coursesResponse?.data)
    ? coursesResponse.data
    : [];

  const handleTabPress = (tab) => navigation.navigate(tab);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(mode === "dark" ? "light-content" : "dark-content");
      return () => StatusBar.setBarStyle("default");
    }, [mode])
  );

  const rounds = Array.isArray(roundsData?.data?.data)
    ? roundsData.data.data
    : Array.isArray(roundsData?.data)
    ? roundsData.data
    : [];

  const recentRounds = rounds.slice(0, 4);
  const toInt = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const frontNineTotal = holeScores.slice(0, 9).reduce((sum, value) => sum + toInt(value), 0);
  const backNineTotal = holeScores.slice(9, 18).reduce((sum, value) => sum + toInt(value), 0);
  const scorecardTotal = frontNineTotal + backNineTotal;
  const selectedCourseTitle =
    selectedRoundForScorecard?.course_id?.name ||
    selectedRoundForScorecard?.course_name ||
    "Selected course";
  const selectedCourseParTotal = getTotalParForCourse(selectedCourseTitle);
  const parByHole = buildHoleParDistribution(selectedCourseParTotal);
  const frontNinePar = parByHole.slice(0, 9);
  const backNinePar = parByHole.slice(9, 18);
  const frontNineParTotal = frontNinePar.reduce((sum, value) => sum + value, 0);
  const backNineParTotal = backNinePar.reduce((sum, value) => sum + value, 0);

  const handleSelectCourse = async (courseName) => {
    setSelectedCourseName(courseName);
    setShowCourseOptions(false);
    setCalculatedHandicap(null);

    try {
      const response = await handicapRatingMutation.mutateAsync(courseName);
      const ratingData = response?.data?.data ?? response?.data ?? {};
      setSelectedCourseRating(ratingData?.course_rating ?? null);
      setSelectedSlopeRating(ratingData?.slope_rating ?? null);
    } catch (error) {
      setSelectedCourseRating(null);
      setSelectedSlopeRating(null);
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.msg ||
        "Could not fetch course ratings right now.";
      showCustomPopup("Course lookup failed", String(message), "error");
    }
  };

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
    if (!score1 || !score2 || !selectedCourseName) {
      showCustomPopup("Missing details", "Please enter both scores and select a course.", "error");
      return;
    }

    try {
      const response = await calculateHandicapMutation.mutateAsync({
        recent_score_1: Number(score1),
        recent_score_2: Number(score2),
        course_name: selectedCourseName,
      });
      const handicap =
        response?.data?.data?.handicap ??
        response?.data?.handicap ??
        response?.data?.calculated_handicap;
      const formattedHandicap =
        typeof handicap === "number" ? handicap.toFixed(1) : Number(handicap).toFixed(1);
      setCalculatedHandicap(formattedHandicap);
      setShowHandicapOverlay(true);
    } catch (error) {
      const message =
        error?.response?.data?.message || "Could not calculate handicap right now.";
      showCustomPopup("Calculation failed", String(message), "error");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      setShowCourseOptions(false);
      await refetchRounds();
    } finally {
      setRefreshing(false);
    }
  };

  const showCustomPopup = (title, message, type = "success") => {
    setSavePopup({ visible: true, title, message, type });
  };

  const closeCustomPopup = () => {
    setSavePopup((prev) => ({ ...prev, visible: false }));
  };

  const openScorecardModal = (round) => {
    const incomingScores = Array.isArray(round?.hole_scores) ? round.hole_scores : [];
    const normalizedScores = Array.from({ length: 18 }, (_, index) => {
      const value = incomingScores[index];
      return value === undefined || value === null ? "" : String(value);
    });

    setSelectedRoundForScorecard(round);
    setHoleScores(normalizedScores);
    setShowScorecardModal(true);
  };

  const handleHoleScoreChange = (index, value) => {
    const cleaned = value.replace(/[^0-9]/g, "").slice(0, 2);
    setHoleScores((prev) => {
      const next = [...prev];
      next[index] = cleaned;
      return next;
    });
  };

  const focusNextHoleInput = (index) => {
    const nextIndex = index + 1;
    if (nextIndex > 17) {
      Keyboard.dismiss();
      return;
    }

    const nextRef = holeInputRefs.current[nextIndex];
    if (nextRef && typeof nextRef.focus === "function") {
      nextRef.focus();
    }
  };

  const handleSaveScorecard = async () => {
    if (!selectedRoundForScorecard?._id) {
      showCustomPopup("Missing round", "Please reopen the round and try again.", "error");
      return;
    }

    const hasEmpty = holeScores.some((score) => !score);
    if (hasEmpty) {
      showCustomPopup("Incomplete scorecard", "Please fill all 18 holes.", "error");
      return;
    }

    const normalizedScores = holeScores.map((score) => Number(score));
    if (normalizedScores.some((score) => Number.isNaN(score) || score < 1 || score > 20)) {
      showCustomPopup("Invalid score", "Each hole score must be between 1 and 20.", "error");
      return;
    }

    try {
      await updateRoundScorecardMutation.mutateAsync({
        roundId: selectedRoundForScorecard._id,
        payload: { hole_scores: normalizedScores },
      });

      setShowScorecardModal(false);
      await refetchRounds();
      showCustomPopup("Scorecard saved", "Hole-by-hole scores were updated.", "success");
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        "Could not save scorecard right now.";
      showCustomPopup("Save failed", String(message), "error");
    }
  };

  const handleSaveRound = async () => {
    if (!addRoundCourseId) {
      showCustomPopup("Missing course", "Please select a course first.", "error");
      return;
    }

    const numericScore = Number(addRoundScore);
    if (!addRoundScore || Number.isNaN(numericScore) || numericScore <= 0) {
      showCustomPopup("Invalid score", "Please enter a valid score.", "error");
      return;
    }

    try {
      await createRoundMutation.mutateAsync({
        course_id: addRoundCourseId,
        total_score: numericScore,
        round_date: new Date().toISOString(),
      });

      setAddRoundCourseId("");
      setAddRoundCourseName("");
      setAddRoundScore("");
      setShowAddRoundCourseOptions(false);
      setShowAddRoundForm(false);
      await refetchRounds();
      showCustomPopup("Round added", "Your round has been saved.", "success");
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        "Could not save round right now.";
      showCustomPopup("Save failed", String(message), "error");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}> 
      {showScorecardModal ? (
        <View style={styles.overlayBackdrop}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              style={styles.scorecardKeyboardWrap}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={Platform.OS === "ios" ? 16 : 0}
            >
              <TouchableWithoutFeedback>
                <View
                  style={[
                    styles.scorecardModal,
                    { borderColor: theme.line, backgroundColor: mode === "dark" ? "#202722" : "#F7F2E3" },
                  ]}
                >
                  <Text style={[styles.scorecardTitle, { color: theme.textPrimary }]}>ROUND SCORECARD</Text>
                  <Text style={[styles.scorecardSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                    {selectedCourseTitle}
                  </Text>

                  <ScrollView
                    style={styles.scorecardGridScroll}
                    contentContainerStyle={styles.scorecardContent}
                    keyboardShouldPersistTaps="always"
                    keyboardDismissMode="on-drag"
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={false}
                  >
                    <View
                      style={[
                        styles.scoreTableBlock,
                        { borderColor: theme.line, backgroundColor: mode === "dark" ? "#2B332D" : "#FFFFFF" },
                      ]}
                    >
                      <View style={styles.scoreTableHeaderRow}>
                        <View>
                          <Text style={[styles.scoreTableTitle, { color: theme.textPrimary }]}>OFFICIAL SCORECARD</Text>
                          <Text style={[styles.scoreTableHint, { color: theme.textSecondary }]}>Swipe left for back nine • Tap cells to enter</Text>
                        </View>
                        <Text style={[styles.scoreTableSummary, { color: theme.accent }]}>OUT {frontNineTotal} • IN {backNineTotal}</Text>
                      </View>

                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator
                        keyboardShouldPersistTaps="always"
                        nestedScrollEnabled
                        directionalLockEnabled
                      >
                        <View style={[styles.scoreTableWrap, { width: FULL_ROW_WIDTH }]}> 
                          <View style={[styles.scoreTableRow, { borderBottomColor: theme.line }]}> 
                            <View style={[styles.scoreLabelCell, { borderRightColor: theme.line, backgroundColor: mode === "dark" ? "#263029" : "#EEF3E6" }]}> 
                              <Text style={[styles.scoreLabelText, { color: theme.textSecondary }]}>NINE</Text>
                            </View>
                            <View style={[styles.scoreNineBandCell, { borderRightColor: theme.line, backgroundColor: mode === "dark" ? "#324137" : "#DDE7D1" }]}> 
                              <Text style={[styles.scoreNineBandText, { color: theme.textPrimary }]}>FRONT 1-9</Text>
                            </View>
                            <View style={[styles.scoreNineBandCell, { backgroundColor: mode === "dark" ? "#2C3830" : "#E6EDD7" }]}> 
                              <Text style={[styles.scoreNineBandText, { color: theme.textPrimary }]}>BACK 10-18</Text>
                            </View>
                          </View>

                          <View style={[styles.scoreTableRow, { borderBottomColor: theme.line }]}> 
                            <View style={[styles.scoreLabelCell, { borderRightColor: theme.line }]}> 
                              <Text style={[styles.scoreLabelText, { color: theme.textSecondary }]}>HOLE</Text>
                            </View>
                            {Array.from({ length: 18 }).map((_, index) => (
                              <View
                                key={`hole-${index + 1}`}
                                style={[
                                  styles.scoreCell,
                                  index === 8 ? styles.scoreSplitCell : null,
                                  {
                                    borderRightColor: theme.line,
                                    backgroundColor:
                                      mode === "dark"
                                        ? index < 9
                                          ? "#263029"
                                          : "#283229"
                                        : index < 9
                                        ? "#F3F7EB"
                                        : "#EEF4E3",
                                  },
                                ]}
                              > 
                                <Text style={[styles.scoreHeadNumber, { color: theme.textPrimary }]}>{index + 1}</Text>
                              </View>
                            ))}
                          </View>

                          <View style={[styles.scoreTableRow, { borderBottomColor: theme.line }]}> 
                            <View style={[styles.scoreLabelCell, { borderRightColor: theme.line }]}> 
                              <Text style={[styles.scoreLabelText, { color: theme.textSecondary }]}>PAR</Text>
                            </View>
                            {parByHole.map((par, index) => (
                              <View
                                key={`par-${index + 1}`}
                                style={[
                                  styles.scoreCell,
                                  index === 8 ? styles.scoreSplitCell : null,
                                  {
                                    borderRightColor: theme.line,
                                    backgroundColor: mode === "dark" ? "#222C25" : "#FAF8EE",
                                  },
                                ]}
                              > 
                                <Text style={[styles.scoreParNumber, { color: theme.textPrimary }]}>{par}</Text>
                              </View>
                            ))}
                          </View>

                          <View style={styles.scoreTableRow}>
                            <View style={[styles.scoreLabelCell, { borderRightColor: theme.line }]}> 
                              <Text style={[styles.scoreLabelText, { color: theme.textSecondary }]}>SCORE</Text>
                            </View>
                            {Array.from({ length: 18 }).map((_, index) => (
                              <View
                                key={`score-${index + 1}`}
                                style={[
                                  styles.scoreCell,
                                  styles.scoreInputCell,
                                  index === 8 ? styles.scoreSplitCell : null,
                                  {
                                    borderRightColor: theme.line,
                                    backgroundColor: holeScores[index]
                                      ? mode === "dark"
                                        ? "#334233"
                                        : "#E4F0D0"
                                      : mode === "dark"
                                      ? "#293229"
                                      : "#FFFFFF",
                                  },
                                ]}
                              > 
                                <TextInput
                                  ref={(ref) => {
                                    holeInputRefs.current[index] = ref;
                                  }}
                                  keyboardType="numeric"
                                  value={holeScores[index]}
                                  onChangeText={(value) => handleHoleScoreChange(index, value)}
                                  placeholder="-"
                                  placeholderTextColor={theme.textSecondary}
                                  style={[styles.scoreInput, { color: theme.textPrimary }]}
                                  returnKeyType={index === 17 ? "done" : "next"}
                                  blurOnSubmit={index === 17}
                                  onSubmitEditing={
                                    index === 17 ? () => Keyboard.dismiss() : () => focusNextHoleInput(index)
                                  }
                                />
                              </View>
                            ))}
                          </View>
                        </View>
                      </ScrollView>
                    </View>

                    <View
                      style={[
                        styles.scorecardTotalsStrip,
                        { borderColor: theme.line, backgroundColor: mode === "dark" ? "#263029" : "#EEF3E6" },
                      ]}
                    >
                      <View>
                        <Text style={[styles.scorecardTotalsLabel, { color: theme.textPrimary }]}>PAR {selectedCourseParTotal}</Text>
                        <Text style={[styles.scorecardTotalsSubtext, { color: theme.textSecondary }]}>OUT {frontNineParTotal} • IN {backNineParTotal}</Text>
                      </View>
                      <View style={styles.scorecardTotalsRight}>
                        <Text style={[styles.scorecardTotalsRightLabel, { color: theme.textSecondary }]}>SCORE</Text>
                        <Text style={[styles.scorecardTotalsValue, { color: theme.accent }]}>{scorecardTotal}</Text>
                      </View>
                    </View>
                  </ScrollView>

                  <View style={styles.scorecardActions}>
                    <TouchableOpacity
                      style={[styles.scorecardActionBtn, { backgroundColor: mode === "dark" ? "#39443D" : "#CDD7C4" }]}
                      onPress={() => {
                        Keyboard.dismiss();
                        setShowScorecardModal(false);
                      }}
                    >
                      <Text style={[styles.scorecardActionText, { color: theme.textPrimary }]}>CANCEL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.scorecardActionBtn,
                        { backgroundColor: theme.accent, opacity: updateRoundScorecardMutation.isPending ? 0.7 : 1 },
                      ]}
                      onPress={() => {
                        Keyboard.dismiss();
                        handleSaveScorecard();
                      }}
                      disabled={updateRoundScorecardMutation.isPending}
                    >
                      <Text style={styles.scorecardPrimaryText}>
                        {updateRoundScorecardMutation.isPending ? "SAVING..." : "SAVE"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      ) : null}

      {showHandicapOverlay ? (
        <View style={styles.overlayBackdrop}>
          <View style={styles.overlayCard}>
            <Text style={styles.overlayEyebrow}>HANDICAP RESULT</Text>
            <Text style={styles.overlayValue}>{calculatedHandicap}</Text>
            <Text style={styles.overlayCourse}>{selectedCourseName}</Text>
            <TouchableOpacity
              style={styles.overlayButton}
              onPress={() => setShowHandicapOverlay(false)}
            >
              <Text style={styles.overlayButtonText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

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
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
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

          <View style={styles.coursePickerBlock}>
            <TouchableOpacity
              style={[styles.dropdown, { padding: width * 0.03 }]}
              onPress={() => setShowCourseOptions((prev) => !prev)}
            >
              <Text style={styles.dropdownText}>
                {selectedCourseName || "Select Course Name"}
              </Text>
              <Feather name="chevron-down" size={18} color="#ccc" />
            </TouchableOpacity>

            {showCourseOptions ? (
              <View style={styles.dropdownMenu}>
                <ScrollView nestedScrollEnabled style={styles.dropdownScroll}>
                  {courses.map((course, index) => {
                    const courseName = course?.name ?? course?.course_name ?? "";
                    return (
                      <TouchableOpacity
                        key={`${course?._id ?? courseName}-${index}`}
                        style={styles.dropdownItem}
                        onPress={() => handleSelectCourse(courseName)}
                      >
                        <Text style={styles.dropdownItemText}>{courseName}</Text>
                      </TouchableOpacity>
                    );
                  })}
                  {courses.length === 0 ? (
                    <Text style={styles.dropdownEmpty}>No courses available.</Text>
                  ) : null}
                </ScrollView>
              </View>
            ) : null}
          </View>

          {selectedCourseName ? (
            <View style={styles.ratingInfoBox}>
              <Text style={styles.ratingInfoText}>
                Course Rating: {selectedCourseRating ?? "--"}
              </Text>
              <Text style={styles.ratingInfoText}>
                Slope Rating: {selectedSlopeRating ?? "--"}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.calculateBtn, { paddingVertical: width * 0.035, borderRadius: width * 0.05 }]}
            onPress={handleCalculateHandicap}
            disabled={calculateHandicapMutation.isPending}
          >
            <Text style={[styles.calculateText, { fontSize: width * 0.06 }]}>
              {calculateHandicapMutation.isPending ? "CALCULATING..." : "CALCULATE"}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.recentHeaderRow,
            { marginHorizontal: width * 0.055, marginTop: height * 0.03 },
          ]}
        >
          <Text style={[styles.recentTitle, { color: theme.textPrimary, fontSize: width * 0.06 }]}> 
            RECENT MATCHES
          </Text>

          <TouchableOpacity
            style={[styles.addRoundBtn, { backgroundColor: theme.primary }]}
            onPress={() => setShowAddRoundForm((prev) => !prev)}
            activeOpacity={0.9}
          >
            <Feather name="plus" size={14} color="#fff" />
            <Text style={styles.addRoundBtnText}>ADD ROUND</Text>
          </TouchableOpacity>
        </View>

        {showAddRoundForm ? (
          <View
            style={[
              styles.addRoundCard,
              {
                marginHorizontal: width * 0.05,
                borderRadius: width * 0.04,
                borderColor: theme.line,
                backgroundColor: mode === "dark" ? "#222924" : "#F2ECDC",
              },
            ]}
          >
            <Text style={[styles.addRoundLabel, { color: theme.textPrimary }]}>Course</Text>
            <TouchableOpacity
              style={[
                styles.addRoundDropdown,
                {
                  borderColor: theme.line,
                  backgroundColor: mode === "dark" ? "#2D3A33" : "#FFFFFF",
                },
              ]}
              onPress={() => setShowAddRoundCourseOptions((prev) => !prev)}
            >
              <Text
                style={[
                  styles.addRoundDropdownText,
                  { color: addRoundCourseName ? theme.textPrimary : theme.textSecondary },
                ]}
              >
                {addRoundCourseName || "Select a course"}
              </Text>
              <Feather name="chevron-down" size={18} color={theme.textSecondary} />
            </TouchableOpacity>

            {showAddRoundCourseOptions ? (
              <View
                style={[
                  styles.addRoundDropdownMenu,
                  {
                    borderColor: theme.line,
                    backgroundColor: mode === "dark" ? "#2D3A33" : "#FFFFFF",
                  },
                ]}
              >
                <ScrollView nestedScrollEnabled style={styles.addRoundDropdownScroll}>
                  {courses.map((course, index) => {
                    const courseId = course?._id ?? "";
                    const courseName = course?.name ?? course?.course_name ?? "";
                    return (
                      <TouchableOpacity
                        key={`${courseId || courseName}-${index}`}
                        style={[styles.addRoundDropdownItem, { borderBottomColor: theme.line }]}
                        onPress={() => {
                          setAddRoundCourseId(courseId);
                          setAddRoundCourseName(courseName);
                          setShowAddRoundCourseOptions(false);
                        }}
                      >
                        <Text style={[styles.addRoundDropdownItemText, { color: theme.textPrimary }]}>
                          {courseName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  {courses.length === 0 ? (
                    <Text style={[styles.addRoundDropdownEmpty, { color: theme.textSecondary }]}>No courses available.</Text>
                  ) : null}
                </ScrollView>
              </View>
            ) : null}

            <Text style={[styles.addRoundLabel, { color: theme.textPrimary }]}>Score</Text>
            <TextInput
              value={addRoundScore}
              onChangeText={setAddRoundScore}
              keyboardType="numeric"
              placeholder="Enter total score"
              placeholderTextColor={theme.textSecondary}
              returnKeyType="done"
              onSubmitEditing={() => {
                Keyboard.dismiss();
                handleSaveRound();
              }}
              style={[
                styles.addRoundInput,
                {
                  borderColor: theme.line,
                  backgroundColor: mode === "dark" ? "#2D3A33" : "#FFFFFF",
                  color: theme.textPrimary,
                },
              ]}
            />

            <TouchableOpacity
              style={[
                styles.saveRoundBtn,
                {
                  backgroundColor: theme.accent,
                  opacity: createRoundMutation.isPending ? 0.7 : 1,
                },
              ]}
              onPress={handleSaveRound}
              disabled={createRoundMutation.isPending}
            >
              <Text style={styles.saveRoundBtnText}>
                {createRoundMutation.isPending ? "SAVING..." : "SAVE ROUND"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {recentRounds.map((round, index) => {
          const { dateText, timeText } = formatRoundDate(round);
          const courseName = round?.course_id?.name || round?.course_name || "Unknown course";
          const hasHoleScores = Array.isArray(round?.hole_scores) && round.hole_scores.length === 18;
          return (
          <View
            key={index}
            style={[
              styles.matchItem,
              {
                marginHorizontal: width * 0.05,
                borderRadius: width * 0.035,
                padding: width * 0.035,
                backgroundColor: mode === "dark" ? "#242C26" : "#F2ECDC",
                borderColor: theme.line,
              },
            ]}
          >
            <View style={styles.matchTopRow}>
              <View style={styles.matchPrimaryInfo}>
                <Text style={[styles.matchCourseName, { color: theme.textPrimary }]} numberOfLines={1}>
                  {courseName}
                </Text>
                <Text style={[styles.matchDate, { color: theme.textSecondary, fontSize: width * 0.04 }]}> 
                  {dateText} {timeText ? `• ${timeText}` : ""}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.scoreBadgeBtn, { backgroundColor: theme.primary }]}
                onPress={() => openScorecardModal(round)}
                activeOpacity={0.9}
              >
                <Text style={styles.scoreBadgeLabel}>SCORE</Text>
                <Text style={styles.scoreBadgeValue}>{round?.score ?? round?.total_score ?? "-"}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.matchBottomRow}>
              <Text style={[styles.matchHint, { color: theme.textSecondary }]}>Tap score to edit hole-by-hole card</Text>
              <Text style={[styles.matchMetaTag, { color: hasHoleScores ? "#A8D16A" : theme.textSecondary }]}> 
                {hasHoleScores ? "18 holes saved" : "No hole breakdown"}
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

      {savePopup.visible ? (
        <View style={styles.popupWrap}>
          <View
            style={[
              styles.popupCard,
              {
                borderColor: savePopup.type === "error" ? "#9F4B4B" : theme.line,
                backgroundColor: mode === "dark" ? "#222924" : "#FAF6E8",
              },
            ]}
          >
            <Text style={[styles.popupTitle, { color: savePopup.type === "error" ? "#E68D8D" : theme.textPrimary }]}>
              {savePopup.title}
            </Text>
            <Text style={[styles.popupMessage, { color: theme.textSecondary }]}>{savePopup.message}</Text>
            <TouchableOpacity style={[styles.popupBtn, { backgroundColor: theme.accent }]} onPress={closeCustomPopup}>
              <Text style={styles.popupBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

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
  overlayBackdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(20, 24, 21, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 30,
    paddingHorizontal: 24,
  },
  overlayCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: COLORS.cardDark,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderWidth: 1,
    borderColor: "#51614f",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  overlayEyebrow: {
    color: "#B8C59C",
    fontFamily: "Bebas",
    fontSize: 22,
    letterSpacing: 1,
    marginBottom: 10,
  },
  overlayValue: {
    color: "#fff",
    fontFamily: "Bebas",
    fontSize: 64,
    lineHeight: 68,
  },
  overlayCourse: {
    color: "#D6D2C7",
    fontFamily: "Abel",
    fontSize: 18,
    textAlign: "center",
    marginTop: 8,
  },
  overlayButton: {
    marginTop: 24,
    backgroundColor: COLORS.greenButton,
    borderRadius: 16,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  overlayButtonText: {
    color: "#fff",
    fontFamily: "Bebas",
    fontSize: 22,
    letterSpacing: 1,
  },

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
  coursePickerBlock: {
    marginBottom: 12,
  },
  dropdownMenu: {
    backgroundColor: "#2D3A33",
    borderRadius: 10,
    marginTop: 8,
    maxHeight: 180,
    borderWidth: 1,
    borderColor: "#405046",
  },
  dropdownScroll: {
    maxHeight: 180,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#405046",
  },
  dropdownItemText: {
    color: "#fff",
    fontFamily: "Abel",
    fontSize: 15,
  },
  dropdownEmpty: {
    color: "#ccc",
    fontFamily: "Abel",
    fontSize: 14,
    padding: 14,
  },

  dropdownText: { color: "#ccc" },
  ratingInfoBox: {
    backgroundColor: "#2D3A33",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  ratingInfoText: {
    color: "#fff",
    fontFamily: "Abel",
    fontSize: 15,
  },

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
  recentHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  addRoundBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  addRoundBtnText: {
    color: "#fff",
    fontFamily: "Bebas",
    fontSize: 16,
    letterSpacing: 0.4,
  },
  addRoundCard: {
    marginTop: 12,
    borderWidth: 1,
    padding: 14,
  },
  addRoundLabel: {
    fontFamily: "Bebas",
    fontSize: 20,
    marginTop: 8,
    marginBottom: 6,
  },
  addRoundDropdown: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addRoundDropdownText: {
    fontFamily: "Abel",
    fontSize: 16,
  },
  addRoundDropdownMenu: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 8,
    maxHeight: 180,
    overflow: "hidden",
  },
  addRoundDropdownScroll: {
    maxHeight: 180,
  },
  addRoundDropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  addRoundDropdownItemText: {
    fontFamily: "Abel",
    fontSize: 15,
  },
  addRoundDropdownEmpty: {
    fontFamily: "Abel",
    fontSize: 14,
    padding: 12,
  },
  addRoundInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontFamily: "Abel",
    fontSize: 16,
  },
  saveRoundBtn: {
    marginTop: 14,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 10,
  },
  saveRoundBtnText: {
    color: "#fff",
    fontFamily: "Bebas",
    fontSize: 24,
    letterSpacing: 0.6,
  },

  matchItem: {
    backgroundColor: "rgba(38, 43, 39, 0.3)",
    marginTop: 12,
    flexDirection: "column",
    borderWidth: 1,
    borderColor: COLORS.cardDark,
    alignItems: "stretch",
  },
  matchTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  matchPrimaryInfo: {
    flex: 1,
    marginRight: 6,
  },
  matchCourseName: {
    fontFamily: "Bebas",
    fontSize: 30,
    letterSpacing: 0.5,
  },

  matchDate: {
    color: "#000",
    fontFamily: "Abel",
  },

  matchTime: {
    color: "#4B4D4B",
    fontFamily: "Abel",
  },

  scoreBadgeBtn: {
    minWidth: 88,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreBadgeLabel: {
    color: "#DCE8D2",
    fontFamily: "Abel",
    fontSize: 12,
    marginBottom: 2,
  },
  scoreBadgeValue: {
    color: "#fff",
    fontFamily: "Bebas",
    fontSize: 26,
    lineHeight: 28,
  },
  matchBottomRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  matchHint: {
    flex: 1,
    fontFamily: "Abel",
    fontSize: 14,
  },
  matchMetaTag: {
    fontFamily: "Abel",
    fontSize: 13,
  },

  scorecardModal: {
    width: "100%",
    maxWidth: 360,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    maxHeight: "84%",
  },
  scorecardKeyboardWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  scorecardTitle: {
    fontFamily: "Bebas",
    fontSize: 38,
    textAlign: "center",
  },
  scorecardSubtitle: {
    fontFamily: "Abel",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
  },
  scorecardGridScroll: {
    maxHeight: 360,
  },
  scorecardContent: {
    paddingBottom: 8,
  },
  scoreTableBlock: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  scoreTableHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  scoreTableTitle: {
    fontFamily: "Bebas",
    fontSize: 26,
    letterSpacing: 0.5,
  },
  scoreTableHint: {
    fontFamily: "Abel",
    fontSize: 12,
    marginTop: 2,
  },
  scoreTableSummary: {
    fontFamily: "Bebas",
    fontSize: 20,
    marginTop: 3,
  },
  scoreTableWrap: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    marginHorizontal: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  scoreTableRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  scoreLabelCell: {
    width: 62,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
  },
  scoreNineBandCell: {
    width: SCORE_CELL_WIDTH * 9,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
  },
  scoreNineBandText: {
    fontFamily: "Bebas",
    fontSize: 19,
    letterSpacing: 0.5,
  },
  scoreLabelText: {
    fontFamily: "Abel",
    fontSize: 12,
    letterSpacing: 0.4,
  },
  scoreCell: {
    width: 46,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
  },
  scoreSplitCell: {
    borderRightWidth: 2,
  },
  scoreInputCell: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  scoreHeadNumber: {
    fontFamily: "Bebas",
    fontSize: 20,
  },
  scoreParNumber: {
    fontFamily: "Abel",
    fontSize: 16,
  },
  scoreInput: {
    width: "100%",
    textAlign: "center",
    fontFamily: "Bebas",
    fontSize: 24,
    paddingVertical: 0,
  },
  scorecardTotalsStrip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  scorecardTotalsLabel: {
    fontFamily: "Bebas",
    fontSize: 24,
    letterSpacing: 0.5,
  },
  scorecardTotalsSubtext: {
    fontFamily: "Abel",
    fontSize: 13,
    marginTop: 2,
  },
  scorecardTotalsRight: {
    alignItems: "flex-end",
  },
  scorecardTotalsRightLabel: {
    fontFamily: "Abel",
    fontSize: 12,
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  scorecardTotalsValue: {
    fontFamily: "Bebas",
    fontSize: 38,
    lineHeight: 38,
  },
  scorecardActions: {
    marginTop: 6,
    flexDirection: "row",
    gap: 10,
  },
  scorecardActionBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  scorecardActionText: {
    fontFamily: "Bebas",
    fontSize: 22,
    letterSpacing: 0.4,
  },
  scorecardPrimaryText: {
    color: "#fff",
    fontFamily: "Bebas",
    fontSize: 22,
    letterSpacing: 0.4,
  },

  popupWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 96,
    zIndex: 40,
  },
  popupCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  popupTitle: {
    fontFamily: "Bebas",
    fontSize: 26,
    marginBottom: 4,
  },
  popupMessage: {
    fontFamily: "Abel",
    fontSize: 16,
  },
  popupBtn: {
    alignSelf: "flex-end",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 12,
  },
  popupBtnText: {
    color: "#fff",
    fontFamily: "Bebas",
    fontSize: 20,
  },

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
