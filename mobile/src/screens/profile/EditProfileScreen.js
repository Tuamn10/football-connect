import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import apiClient from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../utils/apiError";

import AppInput from "../../components/AppInput";
import PrimaryButton from "../../components/PrimaryButton";

import { colors, radius, shadows, spacing } from "../../theme/theme";
import { Picker } from "@react-native-picker/picker";

const POSITIONS = [
  { key: "goalkeeper", label: "Thủ môn" },
  { key: "defender", label: "Hậu vệ" },
  { key: "midfielder", label: "Tiền vệ" },
  { key: "forward", label: "Tiền đạo" },
];

const LEVELS = [
  { key: "beginner", label: "Phong trào" },
  { key: "average", label: "Trung bình" },
  { key: "good", label: "Khá" },
  { key: "advanced", label: "Nâng cao" },
];

export default function EditProfileScreen({ navigation }) {
  const { setUser, reloadUser } = useAuth();
  
  const [loadingInit, setLoadingInit] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [avatar, setAvatar] = useState("");
  const [position, setPosition] = useState("");
  const [level, setLevel] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoadingInit(true);
      const response = await apiClient.get("/api/v1/profile");
      const data = response.data;
      
      setName(data.name || "");
      setPhone(data.phone || "");
      setArea(data.area || "");
      setAvatar(data.avatar || "");
      setPosition(data.position || "");
      setLevel(data.level || "");
    } catch (error) {
      Alert.alert(
        "Lỗi tải dữ liệu",
        getApiErrorMessage(error, "Không thể tải thông tin hồ sơ.")
      );
    } finally {
      setLoadingInit(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Thiếu thông tin", "Họ tên không được để trống.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        phone: phone.trim() || null,
        area: area.trim() || null,
        avatar: avatar.trim() || null,
        position: position || null,
        level: level || null,
      };

      const response = await apiClient.put("/api/v1/profile", payload);
      
      // Update local context safely using functional update
      setUser(prev => ({
        ...prev,
        ...response.data
      }));

      console.log("Updated user fields:", Object.keys(response.data || {}));

      Alert.alert("Thành công", "Cập nhật hồ sơ thành công!", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert(
        "Không thể lưu",
        getApiErrorMessage(error, "Có lỗi xảy ra khi cập nhật hồ sơ.")
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingInit) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.note}>
          Avatar hiện tại chỉ hỗ trợ nhập đường dẫn (URL) ảnh.
        </Text>

        <View style={styles.formCard}>
          <AppInput
            label="Họ tên *"
            icon="person-outline"
            placeholder="Nhập họ tên của bạn"
            value={name}
            onChangeText={setName}
          />

          <AppInput
            label="Số điện thoại"
            icon="call-outline"
            placeholder="Nhập số điện thoại liên hệ"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <AppInput
            label="Khu vực thường đá"
            icon="location-outline"
            placeholder="Ví dụ: Cầu Giấy, Hà Nội"
            value={area}
            onChangeText={setArea}
          />

          <AppInput
            label="URL Ảnh đại diện (Avatar)"
            icon="image-outline"
            placeholder="https://example.com/avatar.jpg"
            value={avatar}
            onChangeText={setAvatar}
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Vị trí sở trường</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={position}
                onValueChange={(itemValue) => setPosition(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Chưa cập nhật" value="" color={colors.textLight} />
                {POSITIONS.map(pos => (
                  <Picker.Item key={pos.key} label={pos.label} value={pos.key} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Trình độ</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={level}
                onValueChange={(itemValue) => setLevel(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Chưa cập nhật" value="" color={colors.textLight} />
                {LEVELS.map(lvl => (
                  <Picker.Item key={lvl.key} label={lvl.label} value={lvl.key} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.buttonWrapper}>
            <PrimaryButton
              title="Lưu thay đổi"
              loading={saving}
              disabled={saving}
              onPress={handleSave}
              icon={<Ionicons name="save-outline" size={20} color={colors.white} />}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 14,
  },
  content: {
    padding: spacing.lg,
  },
  note: {
    color: colors.textLight,
    fontSize: 13,
    fontStyle: "italic",
    marginBottom: 16,
    textAlign: "center",
  },
  formCard: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
    color: colors.text,
  },
  buttonWrapper: {
    marginTop: 10,
  },
});
