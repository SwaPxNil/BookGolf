import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useMyProfile, useUpdateMyProfile } from "../hooks/useAuth";
import { useTheme } from "../theme/ThemeContext";
import { usePopup } from "../context/PopupContext";

export default function EditProfileScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const { theme } = useTheme();
  const { showPopup } = usePopup();
  const queryClient = useQueryClient();
  const { data: profileData } = useMyProfile({ retry: false });
  const updateProfileMutation = useUpdateMyProfile();

  const profile = profileData?.data?.data ?? profileData?.data ?? {};

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImg, setProfileImg] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    setFullName(profile?.full_name || "");
    setEmail(profile?.email || "");
    setProfileImg(profile?.profile_img || "");
  }, [profile?.full_name, profile?.email, profile?.profile_img]);

  const previewSource = useMemo(() => {
    if (selectedImage?.uri) {
      return { uri: selectedImage.uri };
    }

    const trimmed = profileImg.trim();
    const looksLikeUrl = /^https?:\/\//i.test(trimmed);
    if (looksLikeUrl) {
      return { uri: trimmed };
    }
    return require("../assets/images/Avatar.png");
  }, [profileImg, selectedImage]);

  const handlePickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showPopup({ title: "Permission needed", message: "Please allow photo access to upload your profile image." });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];
      const extension = asset.uri.split(".").pop() || "jpg";
      setSelectedImage({
        uri: asset.uri,
        type: asset.mimeType || `image/${extension}`,
        name: asset.fileName || `profile-${Date.now()}.${extension}`,
      });
    } catch (error) {
      showPopup({ title: "Image error", message: "Could not pick image right now." });
    }
  };

  const handleSave = async () => {
    if (!fullName.trim() || !email.trim()) {
      showPopup({ title: "Missing fields", message: "Name and email are required." });
      return;
    }

    if (newPassword || currentPassword || confirmNewPassword) {
      if (!currentPassword) {
        showPopup({ title: "Current password required", message: "Enter your current password to set a new password." });
        return;
      }

      if (!newPassword) {
        showPopup({ title: "Missing new password", message: "Enter a new password." });
        return;
      }

      if (newPassword !== confirmNewPassword) {
        showPopup({ title: "Password mismatch", message: "New password and confirm password must match." });
        return;
      }
    }

    const payload = {
      full_name: fullName.trim(),
      email: email.trim(),
      profile_img: profileImg.trim(),
    };

    if (selectedImage) {
      payload.image = selectedImage;
    }

    if (newPassword) {
      payload.current_password = currentPassword;
      payload.new_password = newPassword;
    }

    try {
      await updateProfileMutation.mutateAsync(payload);
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      showPopup({
        title: "Updated",
        message: "Your profile has been updated.",
        buttons: [{ text: "OK", role: "primary", onPress: () => navigation.goBack() }],
      });
    } catch (error) {
      const message =
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to update profile.";
      showPopup({ title: "Update failed", message: String(message) });
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}> 
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <TouchableOpacity
          style={[styles.backBtn, { paddingTop: height * 0.015, paddingLeft: width * 0.04 }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={26} color={theme.icon} />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={{ paddingBottom: height * 0.12 }} keyboardShouldPersistTaps="handled">
          <View
            style={{
              alignSelf: "center",
              marginTop: height * 0.015,
              width: width * 0.28,
              height: width * 0.28,
            }}
          >
            <Image source={previewSource} style={{ width: "100%", height: "100%", borderRadius: (width * 0.28) / 2 }} />
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
              onPress={handlePickImage}
            >
              <Ionicons name="image-outline" size={16} color="#798D3D" />
            </TouchableOpacity>
          </View>

          <Text
            style={{
              textAlign: "center",
              fontSize: width * 0.082,
              color: theme.textPrimary,
              marginTop: height * 0.012,
              fontFamily: "Bebas",
            }}
          >
            EDIT PROFILE
          </Text>

          <Text
            style={{
              textAlign: "center",
              fontSize: width * 0.037,
              color: theme.textSecondary,
              fontFamily: "Abel",
              marginTop: 2,
            }}
          >
            Same style, cleaner settings
          </Text>

          <View
            style={{
              backgroundColor: "#262B27",
              marginHorizontal: width * 0.05,
              marginTop: height * 0.025,
              padding: width * 0.045,
              borderRadius: width * 0.05,
            }}
          >
            <FieldLabel icon="person-outline" text="Full name" />
            <TextInput
              placeholder="Full name"
              placeholderTextColor="#95a28c"
              value={fullName}
              onChangeText={setFullName}
              style={styles.darkInput}
            />

            <FieldLabel icon="mail-outline" text="Email" />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#95a28c"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.darkInput}
            />

            <Text style={styles.imageHint}>Tap the image badge to upload a new profile photo.</Text>
          </View>

          <View
            style={{
              backgroundColor: "#262B27",
              marginHorizontal: width * 0.05,
              marginTop: height * 0.02,
              padding: width * 0.045,
              borderRadius: width * 0.05,
            }}
          >
            <Text style={styles.passwordHeading}>Change Password (Optional)</Text>

            <FieldLabel icon="lock-closed-outline" text="Current password" />
            <View style={styles.darkInputRow}>
              <TextInput
                placeholder="Current password"
                placeholderTextColor="#95a28c"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPassword}
                style={styles.darkInputWithIcon}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowCurrentPassword((prev) => !prev)}>
                <Ionicons name={showCurrentPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#95a28c" />
              </TouchableOpacity>
            </View>

            <FieldLabel icon="shield-checkmark-outline" text="New password" />
            <View style={styles.darkInputRow}>
              <TextInput
                placeholder="New password"
                placeholderTextColor="#95a28c"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                style={styles.darkInputWithIcon}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowNewPassword((prev) => !prev)}>
                <Ionicons name={showNewPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#95a28c" />
              </TouchableOpacity>
            </View>

            <FieldLabel icon="checkmark-circle-outline" text="Confirm new password" />
            <View style={styles.darkInputRow}>
              <TextInput
                placeholder="Confirm new password"
                placeholderTextColor="#95a28c"
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                secureTextEntry={!showConfirmPassword}
                style={styles.darkInputWithIcon}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirmPassword((prev) => !prev)}>
                <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#95a28c" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              {
                marginHorizontal: width * 0.05,
                marginTop: height * 0.02,
                borderRadius: width * 0.045,
                paddingVertical: width * 0.034,
              },
              updateProfileMutation.isPending && styles.buttonDisabled,
            ]}
            onPress={handleSave}
            disabled={updateProfileMutation.isPending}
          >
            <Text style={[styles.buttonText, { fontSize: width * 0.06 }]}>
              {updateProfileMutation.isPending ? "SAVING..." : "SAVE CHANGES"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const FieldLabel = ({ icon, text }) => (
  <View style={styles.labelRow}>
    <Ionicons name={icon} size={16} color="#DAD6C8" />
    <Text style={styles.labelText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#e7e2d3",
  },
  container: {
    flex: 1,
  },
  backBtn: {
    paddingBottom: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    marginTop: 3,
  },
  labelText: {
    color: "#DAD6C8",
    fontSize: 15,
    fontFamily: "Abel",
  },
  darkInput: {
    backgroundColor: "#2D3A33",
    borderRadius: 10,
    color: "#fff",
    fontFamily: "Abel",
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 8,
    fontSize: 15,
  },
  darkInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2D3A33",
    borderRadius: 10,
    marginBottom: 8,
    paddingLeft: 12,
  },
  darkInputWithIcon: {
    flex: 1,
    paddingVertical: 11,
    paddingRight: 6,
    fontSize: 15,
    color: "#fff",
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  passwordHeading: {
    color: "#fff",
    fontSize: 22,
    fontFamily: "Bebas",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  imageHint: {
    color: "#95a28c",
    fontSize: 14,
    fontFamily: "Abel",
    marginTop: 6,
  },
  button: {
    backgroundColor: "#798d3d",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: "#192016",
    fontFamily: "Bebas",
    fontSize: 22,
    letterSpacing: 0.5,
  },
});
