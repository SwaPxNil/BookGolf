import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import LessonCard from "../components/LessonCard";
import { useCoach, useCoachLessons } from "../hooks/useCoach";
import { useCourses } from "../hooks/useCourse";
import Navbar from "../components/Navbar";
import { useTheme } from "../theme/ThemeContext";
const { width, height } = Dimensions.get("window");

const scale = width / 375;        // iPhone X width reference
const GRID_ITEM_WIDTH = width * 0.22; 
// The circle itself will always be 22% of the screen width
const CIRCLE_SIZE = width * 0.2;
export default function CoachDetailsScreen({ route }) {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const { theme, mode } = useTheme();
  const [currentTab, setCurrentTab] = useState("coach");
  const [expandedSections, setExpandedSections] = useState({
    topRated: false,
    available: false,
    improveDrive: false,
  });
  
  const coachId = route?.params?.coachId || route?.params?.coach?.id || route?.params?.coach?._id;
  const { data: coachResponse } = useCoach(coachId, { retry: false });
  const { data: lessonsResponse } = useCoachLessons(coachId, { retry: false });
  const { data: coursesResponse } = useCourses({ retry: false });

  const coachData = coachResponse?.data?.data || {};
  const lessonsData = Array.isArray(lessonsResponse?.data?.data) ? lessonsResponse.data.data : [];
  const courses = Array.isArray(coursesResponse?.data?.data) ? coursesResponse.data.data : [];
  const courseNameById = courses.reduce((acc, course) => {
    const key = String(course?._id || "");
    if (key) {
      acc[key] = course?.name || course?.course_name || "";
    }
    return acc;
  }, {});
  const courseNameByCreatorId = courses.reduce((acc, course) => {
    const creatorKey = String(course?.created_by?._id || course?.created_by || "");
    if (creatorKey && !acc[creatorKey]) {
      acc[creatorKey] = course?.name || course?.course_name || "";
    }
    return acc;
  }, {});

  const resolvedCourseId =
    coachData?.course_id?._id ||
    coachData?.course_id ||
    route?.params?.coach?.course_id ||
    route?.params?.coach?.courseId;
  const resolvedCreatorId =
    coachData?.created_by?._id ||
    coachData?.created_by ||
    route?.params?.coach?.created_by;

  const coach = {
    id: coachData?._id || coachId || "",
    name: coachData?.full_name || route?.params?.coach?.name || "Coach",
    courseName:
      coachData?.course_id?.name ||
      coachData?.course?.name ||
      coachData?.course_name ||
      route?.params?.coach?.courseName ||
      (resolvedCourseId ? courseNameById[String(resolvedCourseId)] : "") ||
      (resolvedCreatorId ? courseNameByCreatorId[String(resolvedCreatorId)] : "") ||
      "Unknown course",
    rating: Number(coachData?.rating ?? route?.params?.coach?.rating ?? 0).toFixed(1),
    imageUrl: coachData?.profile_img || coachData?.image_url || null,
    description:
      coachData?.description ||
      route?.params?.coach?.description ||
      "Coach profile details are unavailable.",
    reviewsCount: coachData?.reviews_count ?? 0,
    studentsTaught: coachData?.students_taught ?? 0,
    experienceYears: coachData?.experience_years ?? 0,
    recommendationValue: coachData?.recommendation_value ?? 0,
  };

  const lessonList = lessonsData.map((lesson) => ({
    id: lesson?._id,
    title: lesson?.title || "Lesson",
    description: "Lesson details",
    fullDescription: `A focused ${lesson?.duration_minutes ?? 0} minute lesson session with this coach.`,
    time: `${lesson?.duration_minutes ?? 0}min`,
    level: "All Levels",
    price: String(lesson?.price ?? 0),
    lessonId: lesson?._id,
  }));

  const handleLessonPress = (lesson) => {
    navigation.navigate("LessonBooking", { coach, lesson });
  };
  const handleTabPress = (tab) => navigation.navigate(tab);
  const toggleSection = (sectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}> 
      <StatusBar style={mode === "dark" ? "light" : "dark"} />

      {/* TOP HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image 
  source={require('../assets/icons/Back.png')} 
  style={{ width: 32, height: 32, tintColor: theme.icon }} 
/>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>LESSONS</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        
        {/* PROFILE INFO */}
        <View style={styles.profileSection}>
          <Image
            source={
              coach.imageUrl
                ? { uri: coach.imageUrl }
                : require("../assets/images/coach2.png")
            }
            style={styles.profilePic}
          />
          <View style={styles.profileTextContainer}>
            <Text style={[styles.coachName, { color: theme.textPrimary }]}>{coach.name}</Text>
            <Text style={[styles.courseName, { color: theme.accent }]}>{coach.courseName}</Text>
            <View style={styles.ratingRow}>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{coach.rating}</Text>
              </View>
              <Text style={[styles.reviewsText, { color: theme.textSecondary }]}>{coach.reviewsCount} reviews</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.descriptionText, { color: theme.textSecondary }]}>
          {coach.description}
        </Text>

        {/* STATS CIRCLES */}
        <View style={styles.statsGrid}>
      {/* Pass the dynamic CIRCLE_SIZE to your StatCircle component.
        (You'll need to update your StatCircle component to accept and use a 'size' prop!)
      */}
      <View style={styles.gridItem}>
        <StatCircle 
          number={String(coach.reviewsCount)} 
          text="reviews" 
          size={CIRCLE_SIZE}
          theme={theme}
        />
      </View>

      <View style={styles.gridItem}>
        <StatCircle 
          number={String(coach.studentsTaught)} 
          text="students" 
          size={CIRCLE_SIZE}
          theme={theme}
        />
      </View>

      <View style={styles.gridItem}>
        <StatCircle 
          number={String(coach.experienceYears)} 
          text="years" 
          size={CIRCLE_SIZE}
          theme={theme}
        />
      </View>

      <View style={styles.gridItem}>
        <StatCircle
          number={`${Math.round(Number(coach.recommendationValue || 0))}%`}
          text="suggested"
          size={CIRCLE_SIZE}
          theme={theme}
        />
      </View>
    </View>

        {/* LESSON LISTS */}
        <LessonSection 
          title="TOP RATED" 
          lessons={expandedSections.topRated ? lessonList : lessonList.slice(0, 4)}
          width={width} 
          cardColor="#0A2024" 
          onLessonPress={handleLessonPress}
          theme={theme}
          onViewAll={() => toggleSection("topRated")}
          viewAllLabel={expandedSections.topRated ? "show less" : "view all"}
        />
        <LessonSection 
          title="AVAILABLE NOW" 
          lessons={expandedSections.available ? lessonList : lessonList.slice(0, 4)}
          width={width} 
          cardColor="#27352A" 
          onLessonPress={handleLessonPress}
          theme={theme}
          onViewAll={() => toggleSection("available")}
          viewAllLabel={expandedSections.available ? "show less" : "view all"}
        />
        <LessonSection 
          title="IMPROVE YOUR DRIVE" 
          lessons={expandedSections.improveDrive ? lessonList : lessonList.slice(0, 4)}
          width={width} 
          cardColor="#28343A" 
          onLessonPress={handleLessonPress}
          theme={theme}
          onViewAll={() => toggleSection("improveDrive")}
          viewAllLabel={expandedSections.improveDrive ? "show less" : "view all"}
        />
        
        <View style={{ height: 40 }} /> 
      </ScrollView>
      <Navbar
              currentTab={currentTab}
              onTabPress={handleTabPress}
              onPressMiddle={() => navigation.navigate("CourseScreen")}
            />
    </SafeAreaView>
  );
}

const StatCircle = ({ number, text, theme }) => (
  <View style={[styles.circle, { borderColor: theme.line }]}>
    <Text style={[styles.circleNumber, { color: theme.textPrimary }]}>{number}</Text>
    <Text style={[styles.circleText, { color: theme.textSecondary }]}>{text}</Text>
  </View>
);

const LessonSection = ({ title, lessons, width, cardColor, onLessonPress, theme, onViewAll, viewAllLabel }) => (
  <View style={styles.sectionContainer}>
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{title}</Text>
      <TouchableOpacity onPress={onViewAll} activeOpacity={0.8}>
        <Text style={[styles.viewAll, { color: theme.accent }]}>{viewAllLabel}</Text>
      </TouchableOpacity>
    </View>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.horizontalScrollContent}
    >
      {lessons.map((lesson, index) => (
        <LessonCard 
          key={lesson.id} 
          title={lesson.title}
          description={lesson.description}
          time={lesson.time}
          level={lesson.level}
          price={lesson.price}
          bgColor={cardColor}
          width={width} 
          isFirst={index === 0} 
          onPress={() => onLessonPress(lesson)} // Passes specific lesson data back up
        />
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E1D3",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 32 * scale,
    fontFamily: "Bebas",
    marginLeft: 15,
    color: "#222",
    marginTop: 5,
  },

  scrollBody: {
    paddingBottom: 25,
  },

  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },

  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },

  profileTextContainer: {
    marginLeft: 15,
    justifyContent: "center",
  },

  coachName: {
    fontSize: 24,
    fontFamily: "Bebas",
    color: "#222",
  },

  courseName: {
    fontSize: 15,
    fontFamily: "Abel",
    marginTop: 2,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#666",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },

  ratingText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },

  reviewsText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: "Abel",
    color: "#444",
  },

  descriptionText: {
    fontFamily: "Abel",
    fontSize: 15,
    color: "#333",
    paddingHorizontal: 20,
    marginBottom: 5,
    lineHeight: 22,
  },

 statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap", 
    justifyContent: "space-between", 
    alignItems: "center",
    width: "100%",
    paddingHorizontal: width * 0.05, 
    marginTop: 5,
  },
  
  gridItem: {
    width: GRID_ITEM_WIDTH, 
    alignItems: "center",
    marginBottom: 20, 
  },
  circle: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    borderWidth: 1.5,
    borderColor: "#555",
    justifyContent: "center",
    alignItems: "center",
  },

  circleNumber: {
    fontSize: 32,
    fontFamily: "Bebas",
    color: "#222",
  },

  circleText: {
    fontSize: 12,
    fontFamily: "Abel",
    color: "#444",
  },

  sectionContainer: {
    marginTop: 24,
    marginBottom: 16,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 22,
    fontFamily: "Bebas",
    color: "#333",
  },

  viewAll: {
    fontSize: 16,
    fontFamily: "Abel",
    textDecorationLine: "underline",
    color: "#555",
  },

  horizontalScrollContent: {
    paddingHorizontal: 20,
  },
});