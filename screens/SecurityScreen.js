import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { clearAuthTokens } from "../api/tokenStorage";
import { emitLogout } from "../api/axiosInstance";
import { useDeleteMyAccount, useUpdateMyProfile } from "../hooks/useAuth";
import { useTheme } from "../theme/ThemeContext";
import { usePopup } from "../context/PopupContext";

export default function SecurityScreen({ navigation }) {
  const { theme } = useTheme();
  const { showPopup } = usePopup();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  const updateProfileMutation = useUpdateMyProfile({
    onSuccess: () => {
      showPopup({ title: "Password changed", message: "Your password has been updated." });
      setCurrentPassword("");
      setNewPassword("");
    },
    onError: (error) => {
      showPopup({
        title: "Update failed",
        message:
          error?.response?.data?.msg || error?.response?.data?.error || error?.message || "Unable to update password.",
      });
    },
  });

  const deleteAccountMutation = useDeleteMyAccount({
    onSuccess: async () => {
      await clearAuthTokens();
      emitLogout();
    },
    onError: (error) => {
      showPopup({
        title: "Delete failed",
        message:
          error?.response?.data?.msg || error?.response?.data?.error || error?.message || "Unable to delete account.",
      });
    },
  });

  const handlePasswordUpdate = () => {
    if (!currentPassword || !newPassword) {
      showPopup({ title: "Missing fields", message: "Please fill current and new password." });
      return;
    }

    updateProfileMutation.mutate({
      current_password: currentPassword,
      new_password: newPassword,
    });
  };

  const handleDeleteAccount = () => {
    if (!deletePassword) {
      showPopup({ title: "Password required", message: "Enter current password to delete your account." });
      return;
    }

    showPopup({
      title: "Delete account",
      message: "This action cannot be undone. Continue?",
      buttons: [
        { text: "Cancel", role: "secondary" },
        {
          text: "Delete",
          role: "destructive",
          onPress: () => deleteAccountMutation.mutate({ current_password: deletePassword }),
        },
      ],
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}> 
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Image source={require("../assets/icons/Back.png")} style={{ width: 32, height: 32, tintColor: theme.icon }} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.textPrimary }]}>SECURITY</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>CHANGE PASSWORD</Text>
        <TextInput
          secureTextEntry
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Current password"
          placeholderTextColor="#7b7b7b"
        />
        <TextInput
          secureTextEntry
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="New password"
          placeholderTextColor="#7b7b7b"
        />
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handlePasswordUpdate}
          disabled={updateProfileMutation.isPending}
        >
          <Text style={styles.primaryBtnText}>
            {updateProfileMutation.isPending ? "UPDATING..." : "UPDATE PASSWORD"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardDanger}>
        <Text style={styles.cardTitleDanger}>DELETE ACCOUNT</Text>
        <Text style={styles.helperText}>Enter current password to permanently delete your account.</Text>
        <TextInput
          secureTextEntry
          style={styles.input}
          value={deletePassword}
          onChangeText={setDeletePassword}
          placeholder="Current password"
          placeholderTextColor="#b68d8d"
        />
        <TouchableOpacity
          style={styles.dangerBtn}
          onPress={handleDeleteAccount}
          disabled={deleteAccountMutation.isPending}
        >
          <Text style={styles.dangerBtnText}>
            {deleteAccountMutation.isPending ? "DELETING..." : "DELETE ACCOUNT"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E7E2D3", paddingHorizontal: 20 },
  backBtn: { marginTop: 4, marginBottom: 10 },
  title: { fontFamily: "Bebas", fontSize: 54, color: "#262B27", marginBottom: 8 },
  card: {
    backgroundColor: "#262B27",
    borderRadius: 20,
    padding: 16,
    marginTop: 10,
  },
  cardDanger: {
    backgroundColor: "#3b1f1f",
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
  },
  cardTitle: { color: "#C8D4A0", fontFamily: "Bebas", fontSize: 24 },
  cardTitleDanger: { color: "#f5b1b1", fontFamily: "Bebas", fontSize: 24 },
  helperText: { color: "#e7c7c7", fontFamily: "Abel", fontSize: 17, marginTop: 4 },
  input: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#2f3a2c",
    borderRadius: 14,
    backgroundColor: "#f5f0e3",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: "Abel",
    fontSize: 18,
    color: "#222",
  },
  primaryBtn: {
    marginTop: 12,
    backgroundColor: "#798D3D",
    borderRadius: 999,
    alignItems: "center",
    paddingVertical: 10,
  },
  primaryBtnText: { color: "#fff", fontFamily: "Bebas", fontSize: 24 },
  dangerBtn: {
    marginTop: 12,
    backgroundColor: "#A33C3C",
    borderRadius: 999,
    alignItems: "center",
    paddingVertical: 10,
  },
  dangerBtnText: { color: "#fff", fontFamily: "Bebas", fontSize: 24 },
});
