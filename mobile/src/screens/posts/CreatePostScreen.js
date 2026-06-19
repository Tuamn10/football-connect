import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import AppInput from "../../components/AppInput";
import PrimaryButton from "../../components/PrimaryButton";

import apiClient from "../../services/apiClient";
import { getApiErrorMessage } from "../../utils/apiError";

import {
  colors,
  radius,
  shadows,
  spacing,
} from "../../theme/theme";

const POST_TYPES = [
  {
    key: "find_player",
    label: "Tìm người",
    icon: "people-outline",
  },
  {
    key: "find_opponent",
    label: "Tìm đối thủ",
    icon: "shield-outline",
  },
  {
    key: "pass_field",
    label: "Pass sân",
    icon: "swap-horizontal-outline",
  },
  {
    key: "find_field",
    label: "Tìm sân",
    icon: "location-outline",
  },
];

const REQUIRED_LEVELS = [
  { key: "beginner", label: "Phong trào" },
  { key: "average", label: "Trung bình" },
  { key: "good", label: "Khá" },
  { key: "advanced", label: "Nâng cao" },
];

export default function CreatePostScreen({ navigation }) {
  const [postType, setPostType] = useState("find_player");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState("");
  const [neededPlayers, setNeededPlayers] = useState("");
  const [requiredLevel, setRequiredLevel] = useState("average");
  const [cost, setCost] = useState("");
  
  const [loading, setLoading] = useState(false);

  const handleCreatePost = async () => {
    if (!title.trim() || !area.trim() || !neededPlayers.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đủ Tiêu đề, Khu vực và Số người cần.");
      return;
    }

    try {
      setLoading(true);

      // Tạo ngày giờ giả lập: Lấy giờ hiện tại cộng thêm 2 ngày
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);

      const postData = {
        title: title.trim(),
        description: description.trim(),
        post_type: postType,
        area: area.trim(),
        match_time: futureDate.toISOString(),
        needed_players: parseInt(neededPlayers) || 1,
        current_players: 0,
        field_type: "5",
        required_level: requiredLevel, 
        cost: parseInt(cost) || 0 // Ép kiểu số nguyên cho tiền, bỏ trống thì mặc định là 0
      };

      const response = await apiClient.post("/api/v1/posts", postData);
      
      Alert.alert(
        "Thành công!", 
        "Bài đăng của bạn đã được đưa lên hệ thống.",
        [
          { 
            text: "Tuyệt vời", 
            onPress: () => navigation.goBack() 
          }
        ]
      );

    } catch (error) {
      console.log("Lỗi đăng kèo:", error.response?.data);
      Alert.alert(
        "Không thể đăng bài",
        getApiErrorMessage(error, "Có lỗi xảy ra, vui lòng thử lại.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Đăng bài tìm kèo</Text>
        <Text style={styles.subtitle}>
          Tạo một bài đăng mới để kết nối với cộng đồng bóng đá
        </Text>

        <Text style={styles.sectionLabel}>Loại bài đăng</Text>

        <View style={styles.postTypeGrid}>
          {POST_TYPES.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => setPostType(item.key)}
              style={[
                styles.postTypeItem,
                postType === item.key && styles.postTypeItemActive,
              ]}
            >
              <View
                style={[
                  styles.postTypeIcon,
                  postType === item.key && styles.postTypeIconActive,
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={postType === item.key ? colors.white : colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.postTypeText,
                  postType === item.key && styles.postTypeTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.formCard}>
          <AppInput
            label="Tiêu đề"
            icon="create-outline"
            placeholder="Ví dụ: Tìm 3 cầu thủ đá sân 7"
            value={title}
            onChangeText={setTitle}
          />

          <AppInput
            label="Mô tả chi tiết"
            icon="document-text-outline"
            placeholder="Nhập nội dung bài đăng..."
            multiline
            value={description}
            onChangeText={setDescription}
          />

          <AppInput
            label="Khu vực"
            icon="location-outline"
            placeholder="Ví dụ: Cầu Giấy, Hà Nội"
            value={area}
            onChangeText={setArea}
          />

          <AppInput
            label="Thời gian (Hệ thống tự lấy ngày kia)"
            icon="time-outline"
            placeholder="Tạm ẩn lịch chọn ngày"
            editable={false}
          />

          <AppInput
            label="Số người cần"
            icon="people-outline"
            placeholder="Nhập số người"
            keyboardType="number-pad"
            value={neededPlayers}
            onChangeText={setNeededPlayers}
          />

          <AppInput
            label="Chi phí dự kiến (VNĐ/người)"
            icon="wallet-outline"
            placeholder="Ví dụ: 50000 (Bỏ trống nếu miễn phí)"
            keyboardType="number-pad"
            value={cost}
            onChangeText={setCost}
          />

          {/* KHU VỰC CHỌN TRÌNH ĐỘ */}
          <Text style={styles.levelLabel}>Trình độ yêu cầu</Text>
          <View style={styles.levelGrid}>
            {REQUIRED_LEVELS.map((level) => {
              const isActive = requiredLevel === level.key;
              return (
                <Pressable
                  key={level.key}
                  onPress={() => setRequiredLevel(level.key)}
                  style={[
                    styles.levelChip,
                    isActive && styles.levelChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.levelChipText,
                      isActive && styles.levelChipTextActive,
                    ]}
                  >
                    {level.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <PrimaryButton
            title="Đăng bài"
            loading={loading}
            disabled={loading}
            onPress={handleCreatePost}
            icon={<Ionicons name="send-outline" size={20} color={colors.white} />}
          />
        </View>

        <Text style={styles.note}>
          Bài đăng sẽ được hệ thống cập nhật tức thì vào Trang chủ.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 110,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 6,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  sectionLabel: {
    marginTop: 24,
    marginBottom: 12,
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  postTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  postTypeItem: {
    width: "48%",
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
  },
  postTypeItemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  postTypeIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },
  postTypeIconActive: {
    backgroundColor: colors.primary,
  },
  postTypeText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  postTypeTextActive: {
    color: colors.primaryDark,
  },
  formCard: {
    marginTop: 10,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  levelLabel: {
    marginTop: 10,
    marginBottom: 10,
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  levelGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 24,
  },
  levelChip: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
  },
  levelChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  levelChipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  levelChipTextActive: {
    color: colors.primaryDark,
  },
  note: {
    marginTop: 16,
    color: colors.textLight,
    fontSize: 12,
    textAlign: "center",
  },
});