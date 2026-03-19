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

export default function CoachDetailsScreen({ route }) {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  
  const coach = route?.params?.coach || {
    name: "RAMESH KARKI",
    rating: 4.3,
    image: require("../assets/images/coach2.png"), 
  };

  const dummyLessons = [
    { 
      id: 1, 
      title: "FULL SWING ANALYSIS", 
      description: "Break down your swing mechanics and improve consistency with video analysis",
      fullDescription: "Improve your swing mechanics and consistency through detailed video analysis. The coach will record and break down your swing to identify issues with grip, stance, and motion, then provide clear adjustments and drills to help you develop a more efficient and repeatable swing. Analyze and refine your swing with detailed video feedback from your coach.",
      time: "60min",
      level: "Intermediate",
      price: "12000" 
    },
    { 
      id: 2, 
      title: "SHORT GAME MASTERY", 
      description: "Focus on chipping, pitching, and bunker play to lower your scores around the green.",
      fullDescription: "A comprehensive session focused on the most critical part of the game. Learn techniques for consistent contact, distance control, and reading lies around the green to significantly lower your score.",
      time: "45min",
      level: "All Levels",
      price: "9000" 
    },
  ];

  const handleLessonPress = (lesson) => {
    // Navigate to LessonBookingScreen and pass both coach and lesson data
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
          <Image source={coach.image} style={styles.profilePic} />
          <View style={styles.profileTextContainer}>
            <Text style={styles.coachName}>{coach.name}</Text>
            <View style={styles.ratingRow}>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{coach.rating}</Text>
              </View>
              <Text style={styles.reviewsText}>218 reviews</Text>
            </View>
          </View>
        </View>

        <Text style={styles.descriptionText}>
          "Helping golfers improve their swing mechanics and consistency on the course. Every student, every level."
        </Text>

        {/* STATS CIRCLES */}
        <View style={styles.statsRow}>
          <StatCircle number="218" text="reviews" />
          <StatCircle number="320" text="students" />
          <StatCircle number="6" text="years" />
          <StatCircle number="90%" text="suggested" />
        </View>

        {/* LESSON LISTS */}
        <LessonSection 
          title="TOP RATED" 
          lessons={dummyLessons} 
          width={width} 
          cardColor="#0A2024" 
          onLessonPress={handleLessonPress}
        />
        <LessonSection 
          title="AVAILABLE NOW" 
          lessons={dummyLessons} 
          width={width} 
          cardColor="#27352A" 
          onLessonPress={handleLessonPress}
        />
        <LessonSection 
          title="IMPROVE YOUR DRIVE" 
          lessons={dummyLessons} 
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