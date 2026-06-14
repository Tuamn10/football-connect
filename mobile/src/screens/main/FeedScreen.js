import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import PostCard from "../../components/PostCard";
import EmptyState from "../../components/EmptyState";
import apiClient from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../utils/apiError";

import {
  colors,
  radius,
  shadows,
  spacing,
} from "../../theme/theme";

const POST_FILTERS = [
  {
    key: "",
    label: "Tất cả",
  },
  {
    key: "find_player",
    label: "Tìm người",
  },
  {
    key: "find_opponent",
    label: "Tìm đối thủ",
  },
  {
    key: "pass_field",
    label: "Pass sân",
  },
];

export default function FeedScreen({
  navigation,
}) {
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [activeFilter, setActiveFilter] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const fetchPosts = async ({
    keywordValue = keyword,
    filterValue = activeFilter,
  } = {}) => {
    try {
      setErrorMessage("");

      const response = await apiClient.get(
        "/api/v1/posts",
        {
          params: {
            skip: 0,
            limit: 50,

            keyword:
              keywordValue.trim() || undefined,

            post_type:
              filterValue || undefined,
          },
        }
      );

      const responseData = response.data;

      const postList = Array.isArray(responseData)
        ? responseData
        : responseData?.items || [];

      setPosts(postList);

      return postList;
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Không thể tải danh sách kèo."
      );

      setErrorMessage(message);
      setPosts([]);

      return [];
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await fetchPosts();
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    Keyboard.dismiss();

    await fetchPosts({
      keywordValue: keyword,
      filterValue: activeFilter,
    });
  };

  const handleClearSearch = async () => {
    setKeyword("");

    await fetchPosts({
      keywordValue: "",
      filterValue: activeFilter,
    });
  };

  const handleChangeFilter = async (
    filterKey
  ) => {
    setActiveFilter(filterKey);

    await fetchPosts({
      keywordValue: keyword,
      filterValue: filterKey,
    });
  };

  const handleRefresh = useCallback(
    async () => {
      try {
        setRefreshing(true);

        await fetchPosts({
          keywordValue: keyword,
          filterValue: activeFilter,
        });
      } finally {
        setRefreshing(false);
      }
    },
    [keyword, activeFilter]
  );

  useEffect(() => {
    loadData();
  }, []);

  const renderHeader = () => {
    return (
      <>
        <LinearGradient
          colors={[
            colors.primaryDark,
            colors.primary,
          ]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 1,
          }}
          style={styles.hero}
        >
          <View style={styles.heroTop}>
            <View style={styles.userBlock}>
              <View style={styles.avatar}>
                <Ionicons
                  name="person"
                  size={21}
                  color={colors.primaryDark}
                />
              </View>

              <View style={styles.userText}>
                <Text style={styles.greeting}>
                  Xin chào,
                </Text>

                <Text
                  style={styles.userName}
                  numberOfLines={1}
                >
                  {user?.name || "Cầu thủ"} 👋
                </Text>
              </View>
            </View>

            <Pressable
              style={styles.notificationButton}
              onPress={() =>
                navigation.navigate(
                  "Notifications"
                )
              }
            >
              <Ionicons
                name="notifications-outline"
                size={23}
                color={colors.white}
              />

              <View
                style={styles.notificationDot}
              />
            </Pressable>
          </View>

          <Text style={styles.heroTitle}>
            Hôm nay bạn muốn đá ở đâu?
          </Text>

          <Text style={styles.heroDescription}>
            Khám phá những kèo bóng phù hợp
            quanh khu vực của bạn
          </Text>

          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              size={21}
              color={colors.textSecondary}
            />

            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kèo, sân bóng, khu vực..."
              placeholderTextColor={
                colors.textLight
              }
              value={keyword}
              onChangeText={setKeyword}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              blurOnSubmit={true}
            />

            {keyword ? (
              <Pressable
                onPress={handleClearSearch}
                hitSlop={10}
                style={styles.searchActionButton}
              >
                <Ionicons
                  name="close-circle"
                  size={21}
                  color={colors.textLight}
                />
              </Pressable>
            ) : null}
            <Pressable
                onPress={handleSearch}
                hitSlop={10}
                style={styles.searchActionButton}
              >
                <Ionicons
                  name="search"
                  size={21}
                  color={colors.textLight}
                />
              </Pressable>
          </View>
        </LinearGradient>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.filterContainer
          }
        >
          {POST_FILTERS.map((filter) => {
            const isActive =
              activeFilter === filter.key;

            return (
              <Pressable
                key={filter.key || "all"}
                onPress={() =>
                  handleChangeFilter(
                    filter.key
                  )
                }
                style={[
                  styles.filterChip,
                  isActive &&
                    styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive &&
                      styles.filterTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.quickActions}>
          <QuickAction
            icon="add"
            label="Đăng kèo"
            backgroundColor={colors.primary}
            onPress={() =>
              navigation.navigate(
                "CreatePost"
              )
            }
          />

          <QuickAction
            icon="map-outline"
            label="Tìm sân"
            backgroundColor={colors.info}
            onPress={() =>
              navigation.navigate("FieldMap")
            }
          />

          <QuickAction
            icon="people-outline"
            label="Tìm đội"
            backgroundColor="#7C3AED"
            onPress={() =>
              handleChangeFilter(
                "find_opponent"
              )
            }
          />

          <QuickAction
            icon="calendar-outline"
            label="Kèo của tôi"
            backgroundColor={colors.warning}
            onPress={() =>
              navigation.navigate("MyPosts")
            }
          />
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleBlock}>
            <Text style={styles.sectionTitle}>
              Kèo bóng mới nhất
            </Text>

            <Text
              style={styles.sectionDescription}
            >
              Các trận đấu đang tìm người
              tham gia
            </Text>
          </View>

          <Pressable
            style={styles.refreshButton}
            onPress={handleSearch}
          >
            <Ionicons
              name="refresh-outline"
              size={18}
              color={colors.primaryDark}
            />

            <Text
              style={styles.refreshButtonText}
            >
              Làm mới
            </Text>
          </Pressable>
        </View>
      </>
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={styles.loadingSafeArea}
      >
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIcon}>
            <Ionicons
              name="football-outline"
              size={42}
              color={colors.primary}
            />
          </View>

          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loadingIndicator}
          />

          <Text style={styles.loadingText}>
            Đang tìm những kèo phù hợp...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top"]}
      style={styles.safeArea}
    >
      <View style={styles.container}>
        <FlatList
          data={posts}
          keyExtractor={(item, index) =>
            String(item?.id ?? index)
          }
          ListHeaderComponent={renderHeader()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.listContent
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="football-outline"
              title={
                errorMessage
                  ? "Không thể tải dữ liệu"
                  : "Chưa tìm thấy kèo phù hợp"
              }
              description={
                errorMessage ||
                "Hãy thử từ khóa khác hoặc tạo một bài đăng mới."
              }
              actionTitle={
                errorMessage
                  ? "Thử lại"
                  : "Đăng kèo mới"
              }
              onAction={
                errorMessage
                  ? handleSearch
                  : () =>
                      navigation.navigate(
                        "CreatePost"
                      )
              }
            />
          }
          ItemSeparatorComponent={() => (
            <View style={styles.separator} />
          )}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <PostCard
                item={item}
                onPress={() =>
                  navigation.navigate(
                    "PostDetail",
                    {
                      postId: item.id,
                    }
                  )
                }
              />
            </View>
          )}
          ListFooterComponent={
            posts.length > 0 ? (
              <View style={styles.listFooter}>
                <Text
                  style={styles.listFooterText}
                >
                  Bạn đã xem hết các kèo hiện có
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}

function QuickAction({
  icon,
  label,
  backgroundColor,
  onPress,
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.quickAction,
        pressed && styles.quickActionPressed,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.quickActionIcon,
          {
            backgroundColor,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={23}
          color={colors.white}
        />
      </View>

      <Text
        style={styles.quickActionText}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  listContent: {
    paddingBottom: 110,
  },

  hero: {
    paddingHorizontal: spacing.lg,
    paddingTop: 14,
    paddingBottom: 27,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },

  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  userBlock: {
    maxWidth: "78%",
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor:
      "rgba(255,255,255,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },

  userText: {
    flex: 1,
    marginLeft: 10,
  },

  greeting: {
    color:
      "rgba(255,255,255,0.72)",
    fontSize: 12,
  },

  userName: {
    marginTop: 1,
    color: colors.white,
    fontSize: 16,
    fontWeight: "900",
  },

  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor:
      "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },

  notificationDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FBBF24",
    borderWidth: 1,
    borderColor: colors.primaryDark,
  },

  heroTitle: {
    marginTop: 20,
    color: colors.white,
    fontSize: 23,
    lineHeight: 30,
    fontWeight: "900",
  },

  heroDescription: {
    marginTop: 5,
    color:
      "rgba(255,255,255,0.74)",
    fontSize: 13,
  },

  searchBox: {
    height: 54,
    marginTop: 18,
    paddingHorizontal: 15,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    color: colors.text,
    fontSize: 14,
  },

  searchActionButton: {
    width: 30,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  filterContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: 16,
    paddingBottom: 2,
  },

  filterChip: {
    marginRight: 8,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  filterChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  filterText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },

  filterTextActive: {
    color: colors.white,
  },

  quickActions: {
    marginHorizontal: spacing.lg,
    marginTop: 16,
    paddingHorizontal: 8,
    paddingVertical: 15,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    flexDirection: "row",
    ...shadows.card,
  },

  quickAction: {
    flex: 1,
    alignItems: "center",
  },

  quickActionPressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },

  quickActionIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  quickActionText: {
    marginTop: 7,
    color: colors.text,
    fontSize: 11,
    fontWeight: "700",
  },

  sectionHeader: {
    marginTop: 24,
    marginBottom: 14,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitleBlock: {
    flex: 1,
    marginRight: 10,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },

  sectionDescription: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 12,
  },

  refreshButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    flexDirection: "row",
    alignItems: "center",
  },

  refreshButtonText: {
    marginLeft: 4,
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: "800",
  },

  cardWrapper: {
    paddingHorizontal: spacing.lg,
  },

  separator: {
    height: 14,
  },

  listFooter: {
    paddingTop: 24,
    paddingBottom: 10,
    alignItems: "center",
  },

  listFooterText: {
    color: colors.textLight,
    fontSize: 12,
  },

  loadingSafeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingIcon: {
    width: 82,
    height: 82,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingIndicator: {
    marginTop: 18,
  },

  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 14,
  },
});