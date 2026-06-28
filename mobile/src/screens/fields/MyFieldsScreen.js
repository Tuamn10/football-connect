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
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import apiClient from "../../services/apiClient";
import { getApiErrorMessage } from "../../utils/apiError";
import PrimaryButton from "../../components/PrimaryButton";
import { colors, radius, shadows, spacing } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";

export default function MyFieldsScreen({ navigation }) {
  const { user } = useAuth();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Kiểm tra quyền
  if (user?.role !== "field_owner" && user?.role !== "admin") {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Ionicons name="lock-closed" size={48} color={colors.danger} />
        <Text style={styles.errorText}>Bạn không có quyền truy cập chức năng này.</Text>
        <PrimaryButton title="Quay lại" onPress={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const loadMyFields = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await apiClient.get("/api/v1/fields/my");
      setFields(response.data || []);
    } catch (error) {
      Alert.alert("Lỗi tải dữ liệu", getApiErrorMessage(error, "Không thể tải danh sách sân bóng của bạn."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMyFields();
    }, [loadMyFields])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadMyFields(false);
  };

  const handleDeleteField = (fieldId) => {
    Alert.alert("Xóa sân bóng?", "Hành động này sẽ xóa vĩnh viễn sân bóng và có thể ảnh hưởng đến các bài đăng liên quan. Bạn có chắc chắn không?", [
      { text: "Hủy", style: "cancel" },
      { 
        text: "Xóa", 
        style: "destructive", 
        onPress: async () => {
          try {
            await apiClient.delete(`/api/v1/fields/${fieldId}`);
            Alert.alert("Thành công", "Đã xóa sân bóng.");
            loadMyFields(false);
          } catch (error) {
            Alert.alert("Lỗi xóa", getApiErrorMessage(error, "Không thể xóa sân bóng này."));
          }
        } 
      }
    ]);
  };

  const renderFieldCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        <View style={[styles.statusBadge, item.status === "active" ? styles.statusActive : styles.statusInactive]}>
          <Text style={styles.statusText}>{item.status === "active" ? "Hoạt động" : "Tạm dừng"}</Text>
        </View>
      </View>
      
      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
        <Text style={styles.infoText} numberOfLines={1}>{item.address || "Chưa có địa chỉ"}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Ionicons name="football-outline" size={16} color={colors.textSecondary} />
        <Text style={styles.infoText}>Sân {item.field_type} người</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Ionicons name="cash-outline" size={16} color={colors.textSecondary} />
        <Text style={styles.infoText}>
          {item.price_per_hour ? Number(item.price_per_hour).toLocaleString("vi-VN") + " đ/giờ" : "Chưa cập nhật giá"}
        </Text>
      </View>

      <View style={styles.actionsRow}>
        <Pressable 
          style={styles.actionBtn} 
          onPress={() => navigation.navigate("FieldDetail", { fieldId: item.id })}
        >
          <Ionicons name="eye-outline" size={18} color={colors.primaryDark} />
          <Text style={[styles.actionText, { color: colors.primaryDark }]}>Xem</Text>
        </Pressable>
        
        <Pressable 
          style={styles.actionBtn} 
          onPress={() => navigation.navigate("FieldForm", { fieldId: item.id })}
        >
          <Ionicons name="create-outline" size={18} color={colors.text} />
          <Text style={[styles.actionText, { color: colors.text }]}>Sửa</Text>
        </Pressable>
        
        <Pressable 
          style={styles.actionBtn} 
          onPress={() => handleDeleteField(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
          <Text style={[styles.actionText, { color: colors.danger }]}>Xóa</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý sân bóng</Text>
        <Text style={styles.subtitle}>Danh sách sân thuộc quyền sở hữu của bạn</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: colors.textSecondary }}>Đang tải danh sách sân...</Text>
        </View>
      ) : fields.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="business-outline" size={60} color={colors.textLight} />
          <Text style={styles.emptyTitle}>Chưa có sân bóng nào</Text>
          <Text style={styles.emptyText}>Bạn chưa tạo hoặc chưa được cấp quyền quản lý sân bóng nào.</Text>
          <PrimaryButton 
            title="Thêm sân bóng mới" 
            onPress={() => navigation.navigate("FieldForm")} 
            style={{ marginTop: 24, paddingHorizontal: 30 }}
          />
        </View>
      ) : (
        <FlatList
          data={fields}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={renderFieldCard}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />}
          ListFooterComponent={
            <PrimaryButton 
              title="Thêm sân bóng mới" 
              icon={<Ionicons name="add-circle-outline" size={20} color={colors.white} />}
              onPress={() => navigation.navigate("FieldForm")} 
              style={{ marginTop: 12 }}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: 10,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: colors.text,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  statusActive: {
    backgroundColor: "#DCFCE7",
  },
  statusInactive: {
    backgroundColor: "#F3F4F6",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.text,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 16,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
});
