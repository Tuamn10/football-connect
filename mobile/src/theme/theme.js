export const colors = {
  // Màu thương hiệu Football Connect
  primary: "#16A34A",
  primaryDark: "#087336",
  primaryLight: "#DCFCE7",
  primarySoft: "#F0FDF4",

  // Màu nền tối
  secondary: "#0F2A1D",
  secondaryLight: "#1D3B2A",

  // Màu nền giao diện
  background: "#F4F7F5",
  surface: "#FFFFFF",
  surfaceSoft: "#F8FAF9",

  // Màu chữ
  text: "#101B14",
  textSecondary: "#66736B",
  textLight: "#94A09A",

  // Đường viền
  border: "#E3E9E5",
  borderDark: "#CBD5CE",

  // Màu trạng thái
  success: "#16A34A",
  warning: "#F59E0B",
  danger: "#DC2626",
  info: "#2563EB",

  // Màu cơ bản
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 28,
  pill: 999,
};

export const typography = {
  display: {
    fontSize: 30,
    fontWeight: "900",
    color: colors.text,
  },

  title: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
  },

  heading: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },

  subheading: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },

  body: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.text,
  },

  bodyBold: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },

  caption: {
    fontSize: 12,
    fontWeight: "400",
    color: colors.textSecondary,
  },

  button: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.white,
  },
};

export const shadows = {
  small: {
    shadowColor: "#111827",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },

  card: {
    shadowColor: "#111827",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  floating: {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const layout = {
  screenPadding: 16,
  cardPadding: 16,
  inputHeight: 54,
  buttonHeight: 54,
  tabBarHeight: 76,
};