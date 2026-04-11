import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMyPayments } from "../hooks/usePayment";
import { useTheme } from "../theme/ThemeContext";

const formatDateTime = (value) => {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) {
    return "Unknown date";
  }

  return dt.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function PaymentsScreen({ navigation }) {
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);
  const { data, isLoading, isError, refetch } = useMyPayments({ retry: false });

  const payments = Array.isArray(data?.data?.data)
    ? data.data.data
    : Array.isArray(data?.data)
    ? data.data
    : [];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}> 
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Image source={require("../assets/icons/Back.png")} style={{ width: 32, height: 32, tintColor: theme.icon }} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.textPrimary }]}>PAYMENTS</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>All payments made for your bookings.</Text>

      <ScrollView
        contentContainerStyle={styles.listWrap}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.icon} />}
      >
        {isLoading ? <Text style={[styles.metaText, { color: theme.textSecondary }]}>Loading payments...</Text> : null}
        {isError ? <Text style={[styles.metaText, { color: "#A33C3C" }]}>Failed to load payments.</Text> : null}

        {!isLoading && !isError && payments.length === 0 ? (
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>No payments found.</Text>
        ) : null}

        {payments.map((payment) => {
          const bookingType = (payment?.booking_type || "BOOKING").replace("_", " ");
          const bookingId = payment?.booking_id?._id || payment?.booking_id || "-";
          return (
            <View key={payment?._id || bookingId} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.line }]}> 
              <Text style={[styles.cardTitle, { color: "#fff" }]}>{bookingType}</Text>
              <Text style={[styles.cardMeta, { color: "#E8E8E8" }]}>Booking ID: {bookingId}</Text>
              <Text style={[styles.cardMeta, { color: "#E8E8E8" }]}>Payment Method: {payment?.payment_method || "N/A"}</Text>
              <Text style={[styles.cardMeta, { color: "#E8E8E8" }]}>Status: {payment?.status || "N/A"}</Text>
              <Text style={[styles.cardMeta, { color: "#E8E8E8" }]}>Paid Amount: Rs {payment?.amount ?? 0}</Text>
              <Text style={[styles.cardMeta, { color: "#E8E8E8" }]}>Total Amount: Rs {payment?.total_amount ?? 0}</Text>
              <Text style={[styles.cardMeta, { color: "#E8E8E8" }]}>Paid At: {formatDateTime(payment?.created_at)}</Text>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  backBtn: { marginTop: 4, marginBottom: 8 },
  title: { fontFamily: "Bebas", fontSize: 54 },
  subtitle: { fontFamily: "Abel", fontSize: 22, marginBottom: 10 },
  listWrap: { paddingBottom: 24 },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  cardTitle: { fontFamily: "Bebas", fontSize: 28, letterSpacing: 0.4, marginBottom: 2 },
  cardMeta: { fontFamily: "Abel", fontSize: 17, lineHeight: 22 },
  metaText: { fontFamily: "Abel", fontSize: 16, textAlign: "center", marginTop: 18 },
});
