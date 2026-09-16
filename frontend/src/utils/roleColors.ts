export interface RoleColorOption {
  key: string;
  name: string;
  color: string; // Primary text / border / accent color (e.g. #0369a1)
  bg: string; // Light background (e.g. #e0f2fe)
  borderColor: string; // Border color (e.g. #bae6fd)
}

export const ROLE_COLOR_PRESETS: RoleColorOption[] = [
  {
    key: "sky",
    name: "Xanh Da Trời (Sky)",
    color: "#0369a1",
    bg: "#e0f2fe",
    borderColor: "#bae6fd",
  },
  {
    key: "blue",
    name: "Xanh Dương (Blue)",
    color: "#1d4ed8",
    bg: "#dbeafe",
    borderColor: "#bfdbfe",
  },
  {
    key: "indigo",
    name: "Chàm (Indigo)",
    color: "#4338ca",
    bg: "#e0e7ff",
    borderColor: "#c7d2fe",
  },
  {
    key: "purple",
    name: "Tím (Purple)",
    color: "#7e22ce",
    bg: "#f3e8ff",
    borderColor: "#e9d5ff",
  },
  {
    key: "pink",
    name: "Hồng (Pink)",
    color: "#be185d",
    bg: "#fce7f3",
    borderColor: "#fbcfe8",
  },
  {
    key: "red",
    name: "Đỏ (Red)",
    color: "#b91c1c",
    bg: "#fee2e2",
    borderColor: "#fecaca",
  },
  {
    key: "orange",
    name: "Cam (Orange)",
    color: "#c2410c",
    bg: "#ffedd5",
    borderColor: "#fed7aa",
  },
  {
    key: "amber",
    name: "Vàng Hổ Phách (Amber)",
    color: "#b45309",
    bg: "#fef3c7",
    borderColor: "#fde68a",
  },
  {
    key: "emerald",
    name: "Xanh Lá (Emerald)",
    color: "#047857",
    bg: "#d1fae5",
    borderColor: "#a7f3d0",
  },
  {
    key: "teal",
    name: "Xanh Mòng Két (Teal)",
    color: "#0f766e",
    bg: "#ccfbf1",
    borderColor: "#99f6e4",
  },
  {
    key: "cyan",
    name: "Xanh Lơ (Cyan)",
    color: "#0e7490",
    bg: "#cffafe",
    borderColor: "#a5f3fc",
  },
  {
    key: "slate",
    name: "Xám Đá (Slate)",
    color: "#334155",
    bg: "#f1f5f9",
    borderColor: "#e2e8f0",
  },
];

export const getRoleChipStyle = (
  colorValue?: string | null,
  fallbackRole?: string,
) => {
  if (colorValue && colorValue.trim()) {
    const val = colorValue.trim().toLowerCase();
    const matched = ROLE_COLOR_PRESETS.find(
      (p) => p.key.toLowerCase() === val || p.color.toLowerCase() === val,
    );
    if (matched) {
      return {
        bgcolor: matched.bg,
        color: matched.color,
        border: `1px solid ${matched.borderColor}`,
      };
    }

    if (colorValue.startsWith("#")) {
      return {
        bgcolor: `${colorValue}1f`, // ~12% opacity
        color: colorValue,
        border: `1px solid ${colorValue}4d`, // ~30% opacity
      };
    }
  }

  // Fallback defaults based on role code/name
  const lower = (fallbackRole || "").toLowerCase();
  if (lower.includes("admin") || lower === "superadmin") {
    return {
      bgcolor: "#fee2e2",
      color: "#b91c1c",
      border: "1px solid #fecaca",
    };
  }
  if (
    lower.includes("quản lý") ||
    lower.includes("projectmanager") ||
    lower === "project_manager"
  ) {
    return {
      bgcolor: "#e0f2fe",
      color: "#0369a1",
      border: "1px solid #bae6fd",
    };
  }
  if (
    lower.includes("giám sát") ||
    lower.includes("supervisor") ||
    lower === "site_supervisor"
  ) {
    return {
      bgcolor: "#fef3c7",
      color: "#b45309",
      border: "1px solid #fde68a",
    };
  }
  if (
    lower.includes("kế toán") ||
    lower.includes("vật tư") ||
    lower.includes("accountant")
  ) {
    return {
      bgcolor: "#ccfbf1",
      color: "#0f766e",
      border: "1px solid #99f6e4",
    };
  }
  return { bgcolor: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0" };
};
