import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import AppInput from "../../components/AppInput";
import PrimaryButton from "../../components/PrimaryButton";
import { getApiErrorMessage } from "../../utils/apiError";
import { forgotPassword } from "../../services/authService";
import {
  colors,
  radius,
  shadows,
  spacing,
} from "../../theme/theme";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateForm = () => {
    let valid = true;
    setEmailError("");

    if (!email.trim()) {
      setEmailError("Vui lòng nhập địa chỉ email.");
      valid = false;
    } else if (!email.includes("@")) {
      setEmailError("Địa chỉ email chưa hợp lệ.");
      valid = false;
    }

    return valid;
  };

  const handleSendOTP = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await forgotPassword(email.trim().toLowerCase());
      
      Alert.alert(
        "Thành công",
        "Nếu email tồn tại trong hệ thống, mã OTP đã được gửi.",
        [
          { 
            text: "Tiếp tục", 
            onPress: () => navigation.navigate("ResetPassword", { email: email.trim().toLowerCase() }) 
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        "Lỗi",
        getApiErrorMessage(error, "Không thể gửi mã OTP. Vui lòng thử lại sau.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.primaryDark, "#064E3B", colors.secondary]}
      style={styles.background}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Ionicons 
            name="arrow-back" 
            size={28} 
            color={colors.white} 
            onPress={() => navigation.goBack()}
          />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <Text style={styles.title}>Quên mật khẩu?</Text>
              <Text style={styles.subtitle}>
                Nhập email của bạn để nhận mã OTP đặt lại mật khẩu.
              </Text>

              <View style={styles.form}>
                <AppInput
                  label="Địa chỉ email"
                  icon="mail-outline"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    setEmailError("");
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  error={emailError}
                />

                <View style={styles.buttonContainer}>
                  <PrimaryButton
                    title="Gửi mã OTP"
                    loading={loading}
                    disabled={loading}
                    onPress={handleSendOTP}
                    icon={<Ionicons name="send-outline" size={21} color={colors.white} />}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  background: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    ...shadows.card,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 7,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  form: {
    marginTop: 24,
  },
  buttonContainer: {
    marginTop: 10,
  }
});
