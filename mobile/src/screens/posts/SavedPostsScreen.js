import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import PostCard from "../../components/PostCard";
import apiClient from "../../services/apiClient";
import { getApiErrorMessage } from "../../utils/apiError";

import { colors, radius, spacing } from "../../theme/theme";

export default function SavedPostsScreen({ navigation }) {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const fetchSavedPosts = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await apiClient.get("/api/v1/saved-posts");
      setSavedPosts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      Alert.alert(
        "Lỗi tải dữ liệu",
        getApiErrorMessage(error, "Không thể tải danh sách bài đã lưu.")
      );
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSavedPosts();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSavedPosts(false);
    setRefreshing(false);
  };

  const handleUnsave = async (postId) => {
    try {
      setRemovingId(postId);
      await apiClient.delete(`/api/v1/posts/${postId}/save`);
      setSavedPosts((current) => current.filter((sp) => sp.post_id !== postId));
    } catch (error) {
      Alert.alert("Không thể bỏ lưu", getApiErrorMessage(error));
    } finally {
      setRemovingId(null);
    }
  };

  const renderItem = ({ item }) => {
    const post = item.post;
    if (!post) return null; // Fallback in case post is missing

    return (
      <View style={styles.cardContainer}>
        <PostCard
          item={post}
          onPress={() => navigation.navigate("PostDetail", { postId: post.id })}
        />
        <Pressable
          style={styles.unsaveButton}
          onPress={() => handleUnsave(post.id)}
          disabled={removingId === post.id}
          hitSlop={10}
        >
          {removingId === post.id ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="bookmark" size={24} color={colors.primary} />
          )}
        </Pressable>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBox}>
          <Ionicons name="bookmark-outline" size={48} color={colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>Bạn chưa lưu bài viết nào</Text>
        <Text style={styles.emptyDescription}>
          Khi tìm thấy một trận đấu thú vị, hãy bấm biểu tượng lưu ở góc bài viết để xem lại sau.
        </Text>
      </View>
    );
  };

  if (loading && savedPosts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải danh sách bài đã lưu...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <StatusBar style="dark" />
      <FlatList
        data={savedPosts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 140,
    paddingTop: 8,
  },
  cardContainer: {
    marginBottom: spacing.md,
  },
  unsaveButton: {
    position: "absolute",
    bottom: 20,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
});
