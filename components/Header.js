import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useTheme } from "../theme/ThemeContext";

const { width, height } = Dimensions.get("window");

// Responsive scale helpers
const scale = width / 375;        // iPhone X width reference
const verticalScale = height / 812;

const COLORS = {
  textDark: "#1A1A1A",
};

export default function Header({ title, subtitle }) {
  const { theme } = useTheme();

  return (
    <View style={styles.header}>
      <Text style={[styles.title, { fontSize: 40 * scale, color: theme.textPrimary }]}>{title}</Text>
      <Text style={[styles.subtitle, { fontSize: 16 * scale, color: theme.textSecondary }]}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20 * scale,
    marginTop: 60 * verticalScale,
  },

  title: {
    color: COLORS.textDark,
    fontFamily: "Bebas",
  },

  subtitle: {
    marginTop: 4 * verticalScale,
    color: "#000000",
    fontFamily: "Abel",
    fontSize:18
  },
});
