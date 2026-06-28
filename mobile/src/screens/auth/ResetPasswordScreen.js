import React, { useState, useEffect } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Pressable
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import AppInput from "../../components/AppInput";
import PrimaryButton from "../../components/PrimaryButton";
import { getApiErrorMessage } from "../../utils/apiError";
import { forgotPassword, resetPassword } from "../../services/authService";
import {
  colors,
  radius,
  shadows,
  spacing,
} from "../../theme/theme";

export default function ResetPasswordScreen({ navigation, route }) {
  const email = route.params?.email || "";

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  
  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const validateForm = () => {
    let valid = true;
    setOtpError("");
    setPasswordError("");
    setConfirmPasswordError("");

    if (!otp.trim() || otp.trim().length !== 6) {
      setOtpError("Mã OTP phải gồm 6 chữ số.");
      valid = false;
    }

    if (!newPassword) {
      setPasswordError("Vui lòng nhập mật khẩu mới.");
      valid = false;
    } else if (newPassword.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự.");
      valid = false;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Mật khẩu xác nhận không khớp.");
      valid = false;
    }

    return valid;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await resetPassword({
        email,
        otp: otp.trim(),
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      
      Alert.alert(
        "Thành công",
        "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.",
        [
          { 
            text: "Đăng nhập", 
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            }) 
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        "Lỗi",
        getApiErrorMessage(error, "Không thể đặt lại mật khẩu. Vui lòng thử lại sau.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    try {
      setResendLoading(true);
      await forgotPassword(email);
      setCountdown(60);
      Alert.alert("Thành công", "Mã OTP mới đã được gửi đến email của bạn.");
    } catch (error) {
      Alert.alert(
        "Lỗi",
        getApiErrorMessage(error, "Không thể gửi lại mã OTP. Vui lòng thử lại sau.")
      );
    } finally {
      setResendLoading(false);
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
              <Text style={styles.title}>Đặt lại mật khẩu</Text>
              <Text style={styles.subtitle}>
                Vui lòng kiểm tra email {email} và nhập mã OTP (có hiệu lực trong 10 phút).
              </Text>

              <View style={styles.form}>
                <AppInput
                  label="Mã OTP"
                  icon="key-outline"
                  placeholder="Nhập mã 6 chữ số"
                  value={otp}
                  onChangeText={(value) => {
                    setOtp(value);
                    setOtpError("");
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  error={otpError}
                />

                <AppInput
                  label="Mật khẩu mới"
                  icon="lock-closed-outline"
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChangeText={(value) => {
                    setNewPassword(value);
                    setPasswordError("");
                  }}
                  secureTextEntry
                  error={passwordError}
                />
                
                <AppInput
                  label="Xác nhận mật khẩu"
                  icon="lock-closed-outline"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    setConfirmPasswordError("");
                  }}
                  secureTextEntry
                  error={confirmPasswordError}
                />

                <View style={styles.buttonContainer}>
                  <PrimaryButton
                    title="Đặt lại mật khẩu"
                    loading={loading}
                    disabled={loading || resendLoading}
                    onPress={handleResetPassword}
                    icon={<Ionicons name="checkmark-circle-outline" size={21} color={colors.white} />}
                  />
                </View>
                
                <View style={styles.resendContainer}>
                  <Text style={styles.resendText}>Chưa nhận được mã? </Text>
                  <Pressable onPress={handleResendOTP} disabled={countdown > 0 || resendLoading}>
                    <Text style={[styles.resendLink, countdown > 0 && styles.resendLinkDisabled]}>
                      {countdown > 0 ? `Gửi lại sau ${countdown}s` : "Gửi lại mã"}
                    </Text>
                  </Pressable>
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
  },
  resendContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  resendText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  resendLink: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: "700",
  },
  resendLinkDisabled: {
    color: colors.textLight,
  }
});
