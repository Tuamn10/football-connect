import React, { useCallback, useMemo, useState } from "react";
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
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

import apiClient from "../../services/apiClient";
import { colors, radius, shadows, spacing } from "../../theme/theme";
import { formatDateTime, formatPostDisplayStatus } from "../../utils/formatters";

// Hàm hỗ trợ chuẩn hóa dữ liệu mảng
function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export default function MyPostsScreen() {
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState("published");
  const [myPosts, setMyPosts] = useState([]);
  const [myParticipations, setMyParticipations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Tải dữ liệu từ Backend
  const loadData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [postsRes, partsRes] = await Promise.all([
        apiClient.get("/api/v1/posts/my").catch(() => ({ data: [] })),
        apiClient.get("/api/v1/participants/my").catch(() => ({ data: [] }))
      ]);

      setMyPosts(normalizeList(postsRes.data));
      setMyParticipations(normalizeList(partsRes.data));
    } catch (error) {
      console.log("Lỗi tải dữ liệu Kèo của tôi:", error);
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(false);
  };

  // Lọc dữ liệu theo Tab
  const listData = useMemo(() => {
    if (activeTab === "published") return myPosts;
    if (activeTab === "joined") return myParticipations.filter(p => p.status === "approved");
    if (activeTab === "pending") return myParticipations.filter(p => p.status === "pending");
    return [];
  }, [activeTab, myPosts, myParticipations]);

  // Giao diện Thẻ trận đấu
  const renderMatchCard = ({ item }) => {
    const isParticipation = activeTab !== "published";
    const postData = isParticipation ? item.post : item;

    // Phòng hờ data lỗi hoặc đang tải
    if (!postData) return null;

    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => navigation.navigate("PostDetail", { postId: postData.id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTypeBadge}>
            <Ionicons name="football" size={14} color={colors.primaryDark} />
            <Text style={styles.cardTypeText}>
              {postData.post_type === "find_player" ? "Tìm người" : "Tìm đối thủ"}
            </Text>
          </View>

          {isParticipation ? (
            <Text style={[styles.cardStatus, item.status === "approved" ? styles.textSuccess : styles.textWarning]}>
              {item.status === "approved" ? "Đã duyệt vào sân" : "Đang chờ duyệt"}
            </Text>
          ) : (
            <Text style={[
              styles.cardStatus,
              formatPostDisplayStatus(postData) === "Đang mở"
                ? styles.textSuccess
                : formatPostDisplayStatus(postData) === "Đã hủy"
                  ? styles.textWarning
                  : styles.textSecondary
            ]}>
              {formatPostDisplayStatus(postData)}
            </Text>
          )}
        </View>

        <Text style={styles.cardTitle} numberOfLines={2}>
          {postData.title || "Trận đấu bóng đá"}
        </Text>

        <View style={styles.cardInfoRow}>
          <Ionicons name="location-outline" size={16} color={colors.textLight} />
          <Text style={styles.cardInfoText} numberOfLines={1}>
            {postData.area || postData.location || "Chưa cập nhật khu vực"}
          </Text>
        </View>

        <View style={styles.cardInfoRow}>
          <Ionicons name="time-outline" size={16} color={colors.textLight} />
          <Text style={styles.cardInfoText}>
            {formatDateTime(postData.match_time || postData.match_at)}
          </Text>
        </View>
      </Pressable>
    );
  };

  // Text hiển thị khi không có dữ liệu
  const getEmptyDescription = () => {
    if (activeTab === "published") return "Bạn chưa đăng tải bài tìm kèo hoặc tìm đối thủ nào.";
    if (activeTab === "joined") return "Bạn chưa có trận đấu nào được chủ sân duyệt tham gia.";
    return "Bạn không có yêu cầu xin tham gia nào đang chờ duyệt.";
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Kèo của tôi</Text>
      </View>

      <View style={styles.tabs}>
        <Pressable
          style={activeTab === "published" ? styles.activeTab : styles.tab}
          onPress={() => setActiveTab("published")}
        >
          <Text style={activeTab === "published" ? styles.activeTabText : styles.tabText}>
            Bài đã đăng
          </Text>
        </Pressable>

        <Pressable
          style={activeTab === "joined" ? styles.activeTab : styles.tab}
          onPress={() => setActiveTab("joined")}
        >
          <Text style={activeTab === "joined" ? styles.activeTabText : styles.tabText}>
            Đã tham gia
          </Text>
        </Pressable>

        <Pressable
          style={activeTab === "pending" ? styles.activeTab : styles.tab}
          onPress={() => setActiveTab("pending")}
        >
          <Text style={activeTab === "pending" ? styles.activeTabText : styles.tabText}>
            Đang chờ
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: colors.textSecondary }}>Đang tải dữ liệu...</Text>
        </View>
      ) : listData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.iconBox}>
            <Ionicons name="calendar-outline" size={44} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có kèo nào</Text>
          <Text style={styles.emptyDescription}>{getEmptyDescription()}</Text>
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
          renderItem={renderMatchCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
          }
        />
      )}
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
  tabs: {
    marginHorizontal: spacing.lg,
    padding: 4,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    flexDirection: "row",
    marginBottom: 12,
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
    fontSize: 13,
    fontWeight: "700",
  },
  activeTabText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "800",
  },

  // KHU VỰC DANH SÁCH & THẺ (CARD)
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 140,
    paddingTop: 8,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  cardTypeText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  cardStatus: {
    fontSize: 12,
    fontWeight: "800",
  },
  textSuccess: {
    color: colors.success,
  },
  textWarning: {
    color: "#B45309",
  },
  textSecondary: {
    color: colors.textSecondary,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 12,
    lineHeight: 24,
  },
  cardInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  cardInfoText: {
    marginLeft: 6,
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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