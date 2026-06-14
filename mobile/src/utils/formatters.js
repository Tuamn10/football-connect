export function formatDateTime(value) {
  if (!value) {
    return "Chưa cập nhật";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Thời gian không hợp lệ";
  }

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatCurrency(value) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return "Miễn phí";
  }

  return `${number.toLocaleString("vi-VN")} ₫`;
}

export function formatFieldType(value) {
  if (!value) {
    return "Chưa cập nhật";
  }

  return `Sân ${value}`;
}

export function formatPostStatus(status) {
  const labels = {
    open: "Đang mở",
    full: "Đã đủ người",
    cancelled: "Đã hủy",
    expired: "Đã hết hạn",
  };

  return labels[status] || status || "Chưa xác định";
}

export function formatPostType(type) {
  const labels = {
    find_opponent: "Tìm đối thủ",
    find_player: "Tìm cầu thủ",
    find_goalkeeper: "Tìm thủ môn",
    pass_field: "Pass sân",
    find_field: "Tìm sân",
    recruit_member: "Tuyển thành viên",
  };

  return labels[type] || type || "Bài đăng";
}

export function formatLevel(level) {
  const labels = {
    beginner: "Mới chơi",
    average: "Trung bình",
    good: "Khá",
    advanced: "Nâng cao",
  };

  return labels[level] || level || "Không yêu cầu";
}