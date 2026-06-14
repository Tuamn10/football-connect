import React from "react";
import {
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

export default function CreatePostScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          Đăng bài tìm kèo
        </Text>

        <Text style={styles.subtitle}>
          Tạo một bài đăng mới để kết nối với cộng
          đồng bóng đá
        </Text>

        <Text style={styles.sectionLabel}>
          Loại bài đăng
        </Text>

        <View style={styles.postTypeGrid}>
          {POST_TYPES.map((item, index) => (
            <Pressable
              key={item.key}
              style={[
                styles.postTypeItem,
                index === 0 &&
                  styles.postTypeItemActive,
              ]}
            >
              <View
                style={[
                  styles.postTypeIcon,
                  index === 0 &&
                    styles.postTypeIconActive,
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={
                    index === 0
                      ? colors.white
                      : colors.textSecondary
                  }
                />
              </View>

              <Text
                style={[
                  styles.postTypeText,
                  index === 0 &&
                    styles.postTypeTextActive,
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
          />

          <AppInput
            label="Mô tả chi tiết"
            icon="document-text-outline"
            placeholder="Nhập nội dung bài đăng..."
            multiline
          />

          <AppInput
            label="Khu vực"
            icon="location-outline"
            placeholder="Ví dụ: Cầu Giấy, Hà Nội"
          />

          <AppInput
            label="Thời gian"
            icon="time-outline"
            placeholder="Chọn ngày và giờ thi đấu"
            editable={false}
          />

          <AppInput
            label="Số người cần"
            icon="people-outline"
            placeholder="Nhập số người"
            keyboardType="number-pad"
          />

          <PrimaryButton
            title="Đăng bài"
            onPress={() => {}}
            icon={
              <Ionicons
                name="send-outline"
                size={20}
                color={colors.white}
              />
            }
          />
        </View>

        <Text style={styles.note}>
          Chức năng gửi dữ liệu thật sẽ được kết nối
          ở Đợt 2.
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

  note: {
    marginTop: 16,
    color: colors.textLight,
    fontSize: 12,
    textAlign: "center",
  },
});