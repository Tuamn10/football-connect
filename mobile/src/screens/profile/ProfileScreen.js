import React, { useState, useCallback } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import apiClient from "../../services/apiClient";

import { useAuth } from "../../context/AuthContext";

import {
  colors,
  radius,
  shadows,
  spacing,
} from "../../theme/theme";

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const [stats, setStats] = useState({ posts: 0, joined: 0, reviews: "—" });
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchStats = async () => {
        setLoading(true);
        try {
          const [postsRes, partsRes] = await Promise.all([
            apiClient.get("/api/v1/posts/my").catch(() => ({ data: [] })),
            apiClient.get("/api/v1/participants/my").catch(() => ({ data: [] }))
          ]);

          const posts = Array.isArray(postsRes.data) ? postsRes.data : postsRes.data?.items || [];
          const parts = Array.isArray(partsRes.data) ? partsRes.data : partsRes.data?.items || [];

          const approvedParts = parts.filter(p => p.status === "approved");

          setStats({
            posts: posts.length,
            joined: approvedParts.length,
            reviews: "—"
          });
        } catch (error) {
          console.log("Lỗi tải thống kê Profile", error);
        } finally {
          setLoading(false);
        }
      };
      fetchStats();
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
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
          {loading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : (
            <>
              <StatisticItem value={stats.posts} label="Bài đăng" />
              <View style={styles.divider} />
              <StatisticItem value={stats.joined} label="Trận tham gia" />
              <View style={styles.divider} />
              <StatisticItem value={stats.reviews} label="Đánh giá" />
            </>
          )}
        </View>

        <View style={styles.menuCard}>
          <MenuItem
            icon="person-outline"
            label="Thông tin cá nhân"
            onPress={() => navigation.navigate("EditProfile")}
          />

          <MenuItem
            icon="calendar-outline"
            label="Kèo của tôi"
            onPress={() => navigation.navigate("MyPosts")}
          />

          <MenuItem
            icon="bookmark-outline"
            label="Bài đã lưu"
            onPress={() => navigation.navigate("SavedPosts")}
          />

          {(user?.role === "field_owner" || user?.role === "admin") && (
            <MenuItem
              icon="business-outline"
              label="Quản lý sân bóng"
              onPress={() => navigation.navigate("MyFields")}
            />
          )}

          <MenuItem
            icon="map-outline"
            label="Tìm sân"
            onPress={() => navigation.navigate("FieldMap")}
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
      </ScrollView>
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
  onPress,
}) {
  return (
    <Pressable
      style={[
        styles.menuItem,
        last && styles.menuItemLast,
      ]}
      onPress={onPress}
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

  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: 140,
    alignItems: "center",
  },

  avatar: {
    width: 96,
    height: 96,
    marginTop: 24,
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