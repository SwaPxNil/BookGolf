import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const formatCurrency = (amount) => `Rs${Number(amount || 0).toFixed(2)}`;

const PaymentChoice = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.methodButton, active && styles.methodButtonActive]}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <Text style={[styles.methodButtonText, active && styles.methodButtonTextActive]}>{label}</Text>
  </TouchableOpacity>
);

export default function BookingPaymentModal({
  visible,
  mode = "payment",
  serviceLabel = "Booking",
  totalAmount = 0,
  advanceAmount = 0,
  paymentMethod = "ESEWA",
  onSelectMethod,
  onConfirm,
  onClose,
  isSubmitting = false,
}) {
  const isSuccess = mode === "success";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.eyebrow}>{isSuccess ? "PAYMENT COMPLETE" : "ADVANCE PAYMENT"}</Text>
          <Text style={styles.title}>{isSuccess ? "Booking Confirmed" : serviceLabel}</Text>

          {isSuccess ? (
            <Text style={styles.description}>
              Booking Confirmed
            </Text>
          ) : (
            <>
              <Text style={styles.description}>
                Pay exactly one-third of the service amount to confirm this booking.
              </Text>
              <View style={styles.amountPanel}>
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Total amount</Text>
                  <Text style={styles.amountValue}>{formatCurrency(totalAmount)}</Text>
                </View>
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Advance due</Text>
                  <Text style={styles.amountValueHighlight}>{formatCurrency(advanceAmount)}</Text>
                </View>
              </View>

              <Text style={styles.methodLabel}>Choose payment method</Text>
              <View style={styles.methodRow}>
                <PaymentChoice
                  label="eSewa"
                  active={paymentMethod === "ESEWA"}
                  onPress={() => onSelectMethod("ESEWA")}
                />
                <PaymentChoice
                  label="Khalti"
                  active={paymentMethod === "KHALTI"}
                  onPress={() => onSelectMethod("KHALTI")}
                />
              </View>
            </>
          )}

          <View style={styles.footer}>
            {isSuccess ? (
              <TouchableOpacity style={styles.primaryButton} onPress={onClose} activeOpacity={0.9}>
                <Text style={styles.primaryButtonText}>DONE</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity style={styles.secondaryButton} onPress={onClose} activeOpacity={0.85}>
                  <Text style={styles.secondaryButtonText}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
                  onPress={onConfirm}
                  activeOpacity={0.9}
                  disabled={isSubmitting}
                >
                  <Text style={styles.primaryButtonText}>
                    {isSubmitting ? "PROCESSING..." : `PAY ${formatCurrency(advanceAmount)}`}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(8, 12, 10, 0.55)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: "#F3ECDD",
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: "rgba(46, 74, 55, 0.12)",
  },
  eyebrow: {
    color: "#5F7248",
    fontFamily: "Bebas",
    fontSize: 18,
    letterSpacing: 1,
  },
  title: {
    color: "#1F241D",
    fontFamily: "Bebas",
    fontSize: 32,
    marginTop: 4,
  },
  description: {
    color: "#4F554A",
    fontFamily: "Abel",
    fontSize: 17,
    lineHeight: 22,
    marginTop: 8,
  },
  amountPanel: {
    marginTop: 18,
    backgroundColor: "#FFF8EA",
    borderRadius: 18,
    padding: 16,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountLabel: {
    color: "#535A50",
    fontFamily: "Abel",
    fontSize: 16,
  },
  amountValue: {
    color: "#20251E",
    fontFamily: "Bebas",
    fontSize: 24,
  },
  amountValueHighlight: {
    color: "#2E6A45",
    fontFamily: "Bebas",
    fontSize: 28,
  },
  methodLabel: {
    color: "#1F241D",
    fontFamily: "Bebas",
    fontSize: 22,
    marginTop: 18,
    marginBottom: 10,
  },
  methodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  methodButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#A7B08E",
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#FFF8EA",
  },
  methodButtonActive: {
    backgroundColor: "#2E4A37",
    borderColor: "#2E4A37",
  },
  methodButtonText: {
    color: "#2E4A37",
    fontFamily: "Bebas",
    fontSize: 20,
    letterSpacing: 0.5,
  },
  methodButtonTextActive: {
    color: "#FFF",
  },
  footer: {
    flexDirection: "row",
    marginTop: 22,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#8B9580",
    paddingVertical: 12,
    alignItems: "center",
    marginRight: 10,
  },
  secondaryButtonText: {
    color: "#55604F",
    fontFamily: "Bebas",
    fontSize: 20,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: "#798D3D",
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFF",
    fontFamily: "Bebas",
    fontSize: 20,
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
