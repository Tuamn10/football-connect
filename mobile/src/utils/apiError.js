export function getApiErrorMessage(
  error,
  fallbackMessage = "Đã xảy ra lỗi. Vui lòng thử lại."
) {
  if (!error) {
    return fallbackMessage;
  }

  if (error.code === "ECONNABORTED") {
    return "Kết nối quá thời gian. Vui lòng thử lại.";
  }

  if (!error.response) {
    return "Không thể kết nối đến máy chủ. Hãy kiểm tra mạng và backend.";
  }

  const status = error.response.status;
  const detail = error.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (status === 401) {
    return "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.";
  }

  if (status === 403) {
    return "Bạn không có quyền thực hiện chức năng này.";
  }

  if (status === 404) {
    return "Không tìm thấy dữ liệu yêu cầu.";
  }

  if (status === 422) {
    return "Thông tin nhập vào chưa hợp lệ.";
  }

  if (status >= 500) {
    return "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.";
  }

  return fallbackMessage;
}