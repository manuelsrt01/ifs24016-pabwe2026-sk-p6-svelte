export const LINK_TREE_TYPES = [
  { value: "public", label: "Publik" },
  { value: "unlisted", label: "Tidak Terdaftar" },
  { value: "private", label: "Privat" },
];

export function typeLabel(type) {
  return LINK_TREE_TYPES.find((item) => item.value === type)?.label ?? type;
}
