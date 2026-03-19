import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import LessonCard from "../components/LessonCard";
import { useCoach, useCoachLessons } from "../hooks/useCoach";

export default function CoachDetailsScreen({ route }) {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const coachId = route?.params?.coachId || route?.params?.coach?.id || route?.params?.coach?._id;
  const { data: coachResponse } = useCoach(coachId, { retry: false });
  const { data: lessonsResponse } = useCoachLessons(coachId, { retry: false });

  const coachData = coachResponse?.data?.data || {};
  const lessonsData = Array.isArray(lessonsResponse?.data?.data) ? lessonsResponse.data.data : [];

  const coach = {
    id: coachData?._id || coachId || "",
    name: coachData?.full_name || route?.params?.coach?.name || "Coach",
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* TOP HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="return-up-back-outline" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LESSONS</Text>
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
            <Text style={styles.coachName}>{coach.name}</Text>
            <View style={styles.ratingRow}>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{coach.rating}</Text>
              </View>
              <Text style={styles.reviewsText}>{coach.reviewsCount} reviews</Text>
            </View>
          </View>
        </View>

        <Text style={styles.descriptionText}>
          {coach.description}
        </Text>

        {/* STATS CIRCLES */}
        <View style={styles.statsRow}>
          <StatCircle number={String(coach.reviewsCount)} text="reviews" />
          <StatCircle number={String(coach.studentsTaught)} text="students" />
          <StatCircle number={String(coach.experienceYears)} text="years" />
          <StatCircle
            number={`${Math.round(Number(coach.recommendationValue || 0))}%`}
            text="suggested"
          />
        </View>

        {/* LESSON LISTS */}
        <LessonSection 
          title="TOP RATED" 
          lessons={lessonList} 
          width={width} 
          cardColor="#0A2024" 
          onLessonPress={handleLessonPress}
        />
        <LessonSection 
          title="AVAILABLE NOW" 
          lessons={lessonList} 
          width={width} 
          cardColor="#27352A" 
          onLessonPress={handleLessonPress}
        />
        <LessonSection 
          title="IMPROVE YOUR DRIVE" 
          lessons={lessonList} 
          width={width} 
          cardColor="#28343A" 
          onLessonPress={handleLessonPress}
        />
        
        <View style={{ height: 40 }} /> 
      </ScrollView>
    </SafeAreaView>
  );
}

const StatCircle = ({ number, text }) => (
  <View style={styles.circle}>
    <Text style={styles.circleNumber}>{number}</Text>
    <Text style={styles.circleText}>{text}</Text>
  </View>
);

const LessonSection = ({ title, lessons, width, cardColor, onLessonPress }) => (
  <View style={styles.sectionContainer}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.viewAll}>view all</Text>
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
    fontSize: 26,
    fontFamily: "Bebas",
    marginLeft: 15,
    color: "#222",
    marginTop: 5,
  },

  scrollBody: {
    paddingBottom: 20,
  },

  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },

  profilePic: {
    width: 90,
    height: 90,
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
    marginBottom: 20,
    lineHeight: 22,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 25,
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
    marginTop: 10,
    marginBottom: 10,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 20,
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