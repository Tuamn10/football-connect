import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Text style={styles.logo}>Football Connect</Text>

      <Text style={styles.title}>
        Kết nối cộng đồng bóng đá phong trào
      </Text>

      <Text style={styles.description}>
        Tìm kèo, tìm sân, tham gia trận đấu và quản lý lịch bóng đá của bạn.
      </Text>

      <TouchableOpacity style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Bắt đầu</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Đăng nhập</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        React Native Expo • FastAPI • PostgreSQL/PostGIS
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logo: {
    color: "#22c55e",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
  },
  title: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    color: "#cbd5e1",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#052e16",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#22c55e",
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#22c55e",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 32,
    textAlign: "center",
  },
});