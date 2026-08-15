import styles from "./Avatar.module.css";

const PALETTE = ["#6d5ef5", "#2f7bee", "#17a869", "#d98a1f", "#e0393e", "#9333ea", "#0891b2"];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function Avatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      className={[styles.avatar, styles[size]].join(" ")}
      style={{ background: colorFor(name) }}
      title={name}
    >
      {initials(name)}
    </span>
  );
}
