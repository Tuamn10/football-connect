import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../context/AuthContext";

import {
  colors,
  radius,
  shadows,
  spacing,
} from "../../theme/theme";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <View />

          <Pressable style={styles.settingsButton}>
            <Ionicons
              name="settings-outline"
              size={22}
              color={colors.text}
            />
          </Pressable>
        </View>

        <View style={styles.avatar}>
          <Ionicons
            name="person"
            size={44}
            color={colors.primaryDark}
          />
        </View>

        <Text style={styles.name}>
          {user?.name || "Cầu thủ"}
        </Text>

        <Text style={styles.role}>
          {user?.role === "field_owner"
            ? "Chủ sân"
            : user?.role === "admin"
              ? "Quản trị viên"
              : "Cầu thủ"}
        </Text>

        <Text style={styles.email}>
          {user?.email || ""}
        </Text>

        <View style={styles.statistics}>
          <StatisticItem
            value="0"
            label="Bài đăng"
          />

          <View style={styles.divider} />

          <StatisticItem
            value="0"
            label="Trận tham gia"
          />

          <View style={styles.divider} />

          <StatisticItem
            value="0"
            label="Đánh giá"
          />
        </View>

        <View style={styles.menuCard}>
          <MenuItem
            icon="person-outline"
            label="Thông tin cá nhân"
          />

          <MenuItem
            icon="calendar-outline"
            label="Kèo của tôi"
          />

          <MenuItem
            icon="bookmark-outline"
            label="Bài đã lưu"
          />

          <MenuItem
            icon="star-outline"
            label="Đánh giá sân bóng"
          />

          <MenuItem
            icon="help-circle-outline"
            label="Trợ giúp"
            last
          />
        </View>

        <Pressable
          style={styles.logoutButton}
          onPress={logout}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color={colors.danger}
          />

          <Text style={styles.logoutText}>
            Đăng xuất
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function StatisticItem({ value, label }) {
  return (
    <View style={styles.statisticItem}>
      <Text style={styles.statisticValue}>
        {value}
      </Text>

      <Text style={styles.statisticLabel}>
        {label}
      </Text>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  last = false,
}) {
  return (
    <Pressable
      style={[
        styles.menuItem,
        last && styles.menuItemLast,
      ]}
    >
      <View style={styles.menuLeft}>
        <Ionicons
          name={icon}
          size={21}
          color={colors.textSecondary}
        />

        <Text style={styles.menuLabel}>
          {label}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={19}
        color={colors.textLight}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
  },

  topRow: {
    width: "100%",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  settingsButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  avatar: {
    width: 96,
    height: 96,
    marginTop: 4,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: colors.white,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },

  name: {
    marginTop: 14,
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
  },

  role: {
    marginTop: 4,
    color: colors.primaryDark,
    fontWeight: "800",
  },

  email: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 12,
  },

  statistics: {
    width: "100%",
    marginTop: 22,
    paddingVertical: 17,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    flexDirection: "row",
    ...shadows.card,
  },

  statisticItem: {
    flex: 1,
    alignItems: "center",
  },

  statisticValue: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
  },

  statisticLabel: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 11,
  },

  divider: {
    width: 1,
    backgroundColor: colors.border,
  },

  menuCard: {
    width: "100%",
    marginTop: 18,
    paddingHorizontal: 16,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    ...shadows.card,
  },

  menuItem: {
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  menuItemLast: {
    borderBottomWidth: 0,
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuLabel: {
    marginLeft: 12,
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },

  logoutButton: {
    width: "100%",
    minHeight: 52,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#F5BABA",
    borderRadius: radius.lg,
    backgroundColor: "#FFF7F7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  logoutText: {
    marginLeft: 8,
    color: colors.danger,
    fontWeight: "800",
  },
});