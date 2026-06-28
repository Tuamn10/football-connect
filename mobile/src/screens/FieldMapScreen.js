import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

import { API_BASE_URL } from "../config/api";
import { useNavigation } from "@react-navigation/native";

export default function FieldMapScreen() {
  const navigation = useNavigation();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadFields = async () => {
    try {
      setErrorMessage("");

      const response = await fetch(`${API_BASE_URL}/api/v1/fields`);

      if (!response.ok) {
        throw new Error("Không tải được danh sách sân bóng");
      }

      const data = await response.json();

      const fieldsWithLocation = data.filter(
        (field) =>
          field.latitude !== null &&
          field.longitude !== null &&
          !Number.isNaN(Number(field.latitude)) &&
          !Number.isNaN(Number(field.longitude))
      );

      setFields(fieldsWithLocation);
    } catch (error) {
      setErrorMessage(
        "Không kết nối được backend. Hãy kiểm tra IP máy tính, WiFi và server FastAPI."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFields();
  }, []);

  const mapHtml = useMemo(() => {
    const centerLat = fields.length > 0 ? Number(fields[0].latitude) : 21.0285;
    const centerLng = fields.length > 0 ? Number(fields[0].longitude) : 105.8542;

    const markers = fields
      .map((field) => {
        const popupContent = `
          <div>
            <strong>${escapeHtml(field.name)}</strong><br/>
            ${escapeHtml(field.address || "")}<br/>
            Loại sân: ${escapeHtml(field.field_type || "")}<br/>
            Giá: ${field.price_per_hour ? Number(field.price_per_hour).toLocaleString("vi-VN") + "đ/giờ" : "Chưa cập nhật"}<br/>
            <button 
              onclick="window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'FIELD_CLICK', fieldId: ${field.id} }))"
              style="margin-top: 8px; background-color: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; width: 100%; font-weight: bold;"
            >
              Xem chi tiết
            </button>
          </div>
        `;

        return `
          L.marker([${Number(field.latitude)}, ${Number(field.longitude)}])
            .addTo(map)
            .bindPopup(${JSON.stringify(popupContent)});
        `;
      })
      .join("\n");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link
            rel="stylesheet"
            href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
            html, body, #map {
              height: 100%;
              margin: 0;
              padding: 0;
            }
            .leaflet-popup-content {
              font-size: 14px;
              line-height: 1.5;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            const hanoiBounds = L.latLngBounds(
                [20.70, 105.30],
                [21.40, 106.20]
            );

            const map = L.map('map', {
                maxBounds: hanoiBounds,
                maxBoundsViscosity: 1.0,
                minZoom: 11,
                maxZoom: 18
            }).setView([${centerLat}, ${centerLng}], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution: '© OpenStreetMap'
            }).addTo(map);

            ${markers}
          </script>
        </body>
      </html>
    `;
  }, [fields]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Đang tải bản đồ sân bóng...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bản đồ sân bóng</Text>
        <Text style={styles.subtitle}>
          Hiển thị các sân bóng có tọa độ latitude/longitude
        </Text>
      </View>

      {errorMessage ? (
        <ScrollView
          contentContainerStyle={styles.errorContainer}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={loadFields} />
          }
        >
          <Text style={styles.errorTitle}>Không tải được dữ liệu</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </ScrollView>
      ) : (
        <>
          <View style={styles.mapWrapper}>
            <WebView
              originWhitelist={["*"]}
              source={{ html: mapHtml }}
              javaScriptEnabled
              domStorageEnabled
              onMessage={(event) => {
                try {
                  const data = JSON.parse(event.nativeEvent.data);
                  if (data.type === "FIELD_CLICK" && data.fieldId) {
                    navigation.navigate("FieldDetail", { fieldId: data.fieldId });
                  }
                } catch (e) {
                  console.log("Error parsing WebView message", e);
                }
              }}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Tổng số sân hiển thị: {fields.length}
            </Text>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#cbd5e1",
    fontSize: 15,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
  },
  title: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 6,
  },
  mapWrapper: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1e293b",
  },
  footer: {
    padding: 16,
  },
  footerText: {
    color: "#cbd5e1",
    textAlign: "center",
  },
  errorContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  errorTitle: {
    color: "#f87171",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  errorText: {
    color: "#cbd5e1",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});