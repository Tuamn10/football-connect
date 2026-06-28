import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import apiClient from "../../services/apiClient";
import { colors, radius, spacing, shadows } from "../../theme/theme";
import { formatTimeAgo } from "../../utils/formatters";
import { StatusBar } from "expo-status-bar";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Tải danh sách thông báo từ API
  const loadNotifications = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await apiClient.get("/api/v1/notifications");
      setNotifications(res.data);
    } catch (error) {
      console.log("Lỗi tải thông báo:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  // Gọi API đánh dấu đã đọc
  const markAsRead = async (id) => {
    try {
      await apiClient.put(`/api/v1/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.log("Lỗi đánh dấu đã đọc:", error);
    }
  };

  const renderItem = ({ item }) => (
    <Pressable 
      style={[styles.notifCard, item.is_read && styles.readNotif]}
      onPress={() => !item.is_read && markAsRead(item.id)}
    >
      <View style={styles.notifIcon}>
        <Ionicons 
          name={item.is_read ? "mail-open-outline" : "notifications"} 
          size={22} 
          color={item.is_read ? colors.textSecondary : colors.primary} 
        />
      </View>
      <View style={styles.notifContent}>
        <Text style={[styles.notifTitle, item.is_read && styles.readText]}>{item.title}</Text>
        <Text style={styles.notifBody}>{item.content}</Text>
        {item.created_at && (
          <Text style={styles.notifTime}>{formatTimeAgo(item.created_at)}</Text>
        )}
      </View>
      {!item.is_read && <View style={styles.unreadDot} />}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Thông báo</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadNotifications(false)} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.iconBox}>
                <Ionicons name="notifications-outline" size={44} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Chưa có thông báo</Text>
              <Text style={styles.emptyDescription}>
                Các yêu cầu tham gia, kết quả duyệt và lịch trận sẽ xuất hiện tại đây.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, paddingBottom: 10 },
  title: { color: colors.text, fontSize: 24, fontWeight: "900" },
  list: { padding: spacing.lg, paddingBottom: 140 },
  notifCard: { 
    flexDirection: "row", backgroundColor: colors.primaryLight, padding: 16, 
    borderRadius: radius.lg, marginBottom: 12, ...shadows.small 
  },
  readNotif: { backgroundColor: colors.white, elevation: 1, shadowOpacity: 0.05 },
  notifIcon: { marginRight: 12, marginTop: 2 },
  notifContent: { flex: 1 },
  notifTitle: { fontWeight: "800", color: colors.text, marginBottom: 4 },
  notifBody: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  notifTime: { color: colors.textLight, fontSize: 11, marginTop: 6 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 4, marginLeft: 8 },
  readText: { color: colors.textSecondary, fontWeight: "600" },
  center: { flex: 1, justifyContent: "center" },
  emptyContainer: { alignItems: "center", marginTop: 80, paddingHorizontal: 40 },
  iconBox: { width: 88, height: 88, borderRadius: 28, backgroundColor: colors.primaryLight, alignItems: "center", justifyContent: "center" },
  emptyTitle: { marginTop: 18, color: colors.text, fontSize: 19, fontWeight: "900" },
  emptyDescription: { marginTop: 8, color: colors.textSecondary, lineHeight: 21, textAlign: "center" }
});