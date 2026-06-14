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

export default function MyPostsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Kèo của tôi</Text>

        <Pressable style={styles.filterButton}>
          <Ionicons
            name="options-outline"
            size={22}
            color={colors.primaryDark}
          />
        </Pressable>
      </View>

      <View style={styles.tabs}>
        <Pressable style={styles.activeTab}>
          <Text style={styles.activeTabText}>
            Bài đã đăng
          </Text>
        </Pressable>

        <Pressable style={styles.tab}>
          <Text style={styles.tabText}>
            Đã tham gia
          </Text>
        </Pressable>

        <Pressable style={styles.tab}>
          <Text style={styles.tabText}>
            Đang chờ
          </Text>
        </Pressable>
      </View>

      <View style={styles.emptyContainer}>
        <View style={styles.iconBox}>
          <Ionicons
            name="calendar-outline"
            size={44}
            color={colors.primary}
          />
        </View>

        <Text style={styles.emptyTitle}>
          Chưa có kèo nào
        </Text>

        <Text style={styles.emptyDescription}>
          Các bài bạn đã đăng hoặc những trận bạn
          tham gia sẽ hiển thị tại đây.
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

  filterButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  tabs: {
    marginHorizontal: spacing.lg,
    padding: 4,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    flexDirection: "row",
  },

  tab: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },

  activeTab: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },

  tabText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },

  activeTabText: {
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