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

export const formatPostDisplayStatus = (post) => {
  if (!post) return 'Không xác định';

  const isPast =
    (post.match_time || post.match_at) &&
    new Date(post.match_time || post.match_at).getTime() < Date.now();

  if (isPast && post.status === 'open') {
    return 'Đã hết hạn';
  }

  const labels = {
    open: 'Đang mở',
    full: 'Đã đủ người',
    cancelled: 'Đã hủy',
    closed: 'Đã kết thúc',
    expired: 'Đã hết hạn',
  };

  return labels[post.status] ?? post.status ?? 'Không xác định';
};

export function formatTimeAgo(dateString) {
  if (!dateString) return "Vừa xong";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return "Vừa xong";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 172800) return "Hôm qua";
  
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

export function formatPostType(type) {
  const labels = {
    find_opponent: "Tìm đối thủ",
    find_player: "Tìm người",
    pass_field: "Pass sân",
    find_field: "Tìm sân",
  };

  return labels[type] || "Không xác định";
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

export function formatParticipantStatus(status) {
  const labels = {
    pending: 'Đang chờ duyệt',
    approved: 'Đã chấp nhận',
    rejected: 'Đã từ chối',
    cancelled: 'Đã hủy',
  };

  return labels[status] ?? status ?? 'Không xác định';
}