import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import AppInput from "../../components/AppInput";
import PrimaryButton from "../../components/PrimaryButton";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../utils/apiError";
import {
  colors,
  radius,
  shadows,
  spacing,
} from "../../theme/theme";

export default function RegisterScreen() {
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng nhập họ và tên."
      );
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      Alert.alert(
        "Email chưa hợp lệ",
        "Vui lòng nhập đúng địa chỉ email."
      );
      return;
    }

    if (!phone.trim() || !/^0\d{9}$/.test(phone.trim())) {
      Alert.alert(
        "Số điện thoại chưa hợp lệ",
        "Vui lòng nhập đúng 10 chữ số bắt đầu bằng số 0."
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Mật khẩu chưa hợp lệ",
        "Mật khẩu phải có ít nhất 6 ký tự."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Mật khẩu không khớp",
        "Vui lòng kiểm tra lại mật khẩu xác nhận."
      );
      return;
    }

    try {
      setLoading(true);

      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
      });
    } catch (error) {
      Alert.alert(
        "Đăng ký thất bại",
        getApiErrorMessage(
          error,
          "Không thể tạo tài khoản."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconBox}>
            <Ionicons
              name="person-add-outline"
              size={38}
              color={colors.primary}
            />
          </View>

          <Text style={styles.title}>
            Tạo tài khoản mới
          </Text>

          <Text style={styles.subtitle}>
            Tham gia cộng đồng bóng đá phong trào
            cùng Football Connect
          </Text>

          <View style={styles.formCard}>
            <AppInput
              label="Họ và tên"
              icon="person-outline"
              placeholder="Nhập họ và tên"
              value={name}
              onChangeText={setName}
            />

            <AppInput
              label="Email"
              icon="mail-outline"
              placeholder="Nhập địa chỉ email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />

            <AppInput
              label="Số điện thoại"
              icon="call-outline"
              placeholder="Nhập số điện thoại"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />

            <AppInput
              label="Mật khẩu"
              icon="lock-closed-outline"
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <AppInput
              label="Xác nhận mật khẩu"
              icon="shield-checkmark-outline"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              onSubmitEditing={handleRegister}
              returnKeyType="done"
            />

            <PrimaryButton
              title="Đăng ký tài khoản"
              loading={loading}
              disabled={loading}
              onPress={handleRegister}
              icon={
                <Ionicons
                  name="person-add-outline"
                  size={21}
                  color={colors.white}
                />
              }
            />
          </View>

          <Text style={styles.agreement}>
            Khi đăng ký, bạn đồng ý tuân thủ các quy
            định của cộng đồng Football Connect.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.xxl,
  },

  iconBox: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },

  title: {
    marginTop: 18,
    color: colors.text,
    fontSize: 25,
    fontWeight: "900",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },

  formCard: {
    marginTop: 28,
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    ...shadows.card,
  },

  agreement: {
    marginTop: 18,
    color: colors.textLight,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
});