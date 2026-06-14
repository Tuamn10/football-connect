import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  colors,
  radius,
  spacing,
} from "../../theme/theme";

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Thông báo</Text>

        <Pressable>
          <Text style={styles.readAll}>
            Đánh dấu đã đọc
          </Text>
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        <Pressable style={styles.activeFilter}>
          <Text style={styles.activeFilterText}>
            Tất cả
          </Text>
        </Pressable>

        <Pressable style={styles.filter}>
          <Text style={styles.filterText}>
            Chưa đọc
          </Text>
        </Pressable>

        <Pressable style={styles.filter}>
          <Text style={styles.filterText}>
            Quan trọng
          </Text>
        </Pressable>
      </View>

      <View style={styles.emptyContainer}>
        <View style={styles.iconBox}>
          <Ionicons
            name="notifications-outline"
            size={44}
            color={colors.primary}
          />
        </View>

        <Text style={styles.emptyTitle}>
          Chưa có thông báo
        </Text>

        <Text style={styles.emptyDescription}>
          Các yêu cầu tham gia, kết quả duyệt và lịch
          trận sẽ xuất hiện tại đây.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: 10,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
  },

  readAll: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "800",
  },

  filterRow: {
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
  },

  filter: {
    marginRight: 8,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  activeFilter: {
    marginRight: 8,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },

  filterText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },

  activeFilterText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "800",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },

  iconBox: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 18,
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
  },

  emptyDescription: {
    marginTop: 8,
    color: colors.textSecondary,
    lineHeight: 21,
    textAlign: "center",
  },
});