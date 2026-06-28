import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import AppInput from "../../components/AppInput";
import PrimaryButton from "../../components/PrimaryButton";
import apiClient from "../../services/apiClient";
import { getApiErrorMessage } from "../../utils/apiError";
import { colors, radius, shadows, spacing } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";

export default function FieldFormScreen({ route, navigation }) {
  const fieldId = route.params?.fieldId;
  const isEditing = !!fieldId;
  const { user } = useAuth();

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  // Field Form State
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [area, setArea] = useState("");
  const [phone, setPhone] = useState("");
  const [fieldType, setFieldType] = useState("7");
  const [pricePerHour, setPricePerHour] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");

  if (user?.role !== "field_owner" && user?.role !== "admin") {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Ionicons name="lock-closed" size={48} color={colors.danger} />
        <Text style={styles.errorText}>Bạn không có quyền truy cập chức năng này.</Text>
        <PrimaryButton title="Quay lại" onPress={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  useEffect(() => {
    if (isEditing) {
      loadFieldDetail();
    }
  }, [fieldId]);

  const loadFieldDetail = async () => {
    try {
      const response = await apiClient.get(`/api/v1/fields/${fieldId}`);
      const field = response.data;
      
      setName(field.name || "");
      setAddress(field.address || "");
      setArea(field.area || "");
      setPhone(field.phone || "");
      setFieldType(field.field_type || "7");
      setPricePerHour(field.price_per_hour !== null && field.price_per_hour !== undefined ? String(field.price_per_hour) : "");
      setOpenTime(field.open_time || "");
      setCloseTime(field.close_time || "");
      setLatitude(field.latitude !== null && field.latitude !== undefined ? String(field.latitude) : "");
      setLongitude(field.longitude !== null && field.longitude !== undefined ? String(field.longitude) : "");
      setDescription(field.description || "");
      setStatus(field.status || "active");
    } catch (error) {
      Alert.alert("Lỗi tải dữ liệu", getApiErrorMessage(error, "Không thể tải thông tin sân bóng."), [
        { text: "Quay lại", onPress: () => navigation.goBack() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !address.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ Tên sân và Địa chỉ.");
      return;
    }

    let lat = null;
    let lng = null;

    if (latitude.trim() !== "") {
      lat = parseFloat(latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        Alert.alert("Lỗi tọa độ", "Vĩ độ (Latitude) phải là số từ -90 đến 90.");
        return;
      }
    }

    if (longitude.trim() !== "") {
      lng = parseFloat(longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        Alert.alert("Lỗi tọa độ", "Kinh độ (Longitude) phải là số từ -180 đến 180.");
        return;
      }
    }

    const payload = {
      name: name.trim(),
      address: address.trim(),
      area: area.trim() || null,
      phone: phone.trim() || null,
      field_type: fieldType,
      price_per_hour: pricePerHour.trim() ? parseFloat(pricePerHour) : null,
      open_time: openTime.trim() || null,
      close_time: closeTime.trim() || null,
      latitude: lat,
      longitude: lng,
      description: description.trim() || null,
      status,
    };

    try {
      setSubmitting(true);
      if (isEditing) {
        await apiClient.put(`/api/v1/fields/${fieldId}`, payload);
        Alert.alert("Thành công", "Cập nhật sân bóng thành công.");
      } else {
        await apiClient.post("/api/v1/fields", payload);
        Alert.alert("Thành công", "Đã tạo sân bóng mới.");
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Không thể lưu sân bóng",
        getApiErrorMessage(error, "Có lỗi xảy ra, vui lòng thử lại sau.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.textSecondary }}>Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{isEditing ? "Chỉnh sửa thông tin sân" : "Thêm sân bóng mới"}</Text>
        <Text style={styles.subtitle}>Điền đầy đủ thông tin để người dùng dễ dàng tìm thấy sân của bạn.</Text>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
          
          <AppInput
            label="Tên sân bóng (*)"
            icon="business-outline"
            placeholder="VD: Sân bóng Chùa Láng"
            value={name}
            onChangeText={setName}
          />

          <AppInput
            label="Địa chỉ chi tiết (*)"
            icon="location-outline"
            placeholder="Số nhà, đường, ngõ..."
            value={address}
            onChangeText={setAddress}
          />

          <AppInput
            label="Khu vực / Quận"
            icon="map-outline"
            placeholder="VD: Đống Đa, Hà Nội"
            value={area}
            onChangeText={setArea}
          />

          <AppInput
            label="Số điện thoại liên hệ"
            icon="call-outline"
            placeholder="SĐT đặt sân"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.inputLabel}>Loại sân</Text>
              <View style={styles.typeSelector}>
                {["5", "7", "11"].map(type => (
                  <Text
                    key={type}
                    onPress={() => setFieldType(type)}
                    style={[styles.typeOption, fieldType === type && styles.typeOptionActive]}
                  >
                    {type}
                  </Text>
                ))}
              </View>
            </View>
            <View style={styles.col}>
              <AppInput
                label="Giá thuê (VNĐ/giờ)"
                icon="cash-outline"
                placeholder="VD: 500000"
                keyboardType="numeric"
                value={pricePerHour}
                onChangeText={setPricePerHour}
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Tọa độ bản đồ (Giúp hiển thị trên Field Map)</Text>
          
          <View style={styles.row}>
            <View style={styles.col}>
              <AppInput
                label="Latitude (Vĩ độ)"
                icon="compass-outline"
                placeholder="VD: 21.0285"
                keyboardType="numeric"
                value={latitude}
                onChangeText={setLatitude}
              />
            </View>
            <View style={styles.col}>
              <AppInput
                label="Longitude (Kinh độ)"
                icon="compass-outline"
                placeholder="VD: 105.8542"
                keyboardType="numeric"
                value={longitude}
                onChangeText={setLongitude}
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Trạng thái sân</Text>
          <View style={styles.typeSelector}>
            <Text
              onPress={() => setStatus("active")}
              style={[styles.statusOption, status === "active" && styles.statusOptionActive]}
            >
              Hoạt động
            </Text>
            <Text
              onPress={() => setStatus("inactive")}
              style={[styles.statusOption, status === "inactive" && styles.statusOptionInactive]}
            >
              Tạm dừng
            </Text>
          </View>

          <AppInput
            label="Mô tả bổ sung"
            icon="document-text-outline"
            placeholder="Giới thiệu thêm về sân bóng..."
            multiline
            value={description}
            onChangeText={setDescription}
          />

          <PrimaryButton
            title={isEditing ? "Lưu thay đổi" : "Tạo sân bóng"}
            loading={submitting}
            disabled={submitting}
            onPress={handleSubmit}
            icon={<Ionicons name="save-outline" size={20} color={colors.white} />}
            style={{ marginTop: 16 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 20,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.text,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 16,
    ...shadows.card,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    marginTop: 10,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  col: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  typeOption: {
    flex: 1,
    textAlign: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  typeOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
    color: colors.primaryDark,
  },
  statusOption: {
    flex: 1,
    textAlign: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  statusOptionActive: {
    borderColor: colors.success,
    backgroundColor: "#DCFCE7",
    color: colors.success,
  },
  statusOptionInactive: {
    borderColor: colors.danger,
    backgroundColor: "#FEE2E2",
    color: colors.danger,
  },
});
