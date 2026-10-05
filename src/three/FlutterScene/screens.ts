import { fontStack, roundRect, type Painter } from "../shared/canvasTexture";

// Material 3 dark scheme generated from the Flutter-blue seed used across the site.
const M3 = {
  surface: "#121318",
  container: "#1e1f25",
  containerHigh: "#292a2f",
  primary: "#b6c4ff",
  onPrimary: "#1d2d61",
  primaryContainer: "#34447a",
  onPrimaryContainer: "#dce1ff",
  secondaryContainer: "#414659",
  onSurface: "#e3e2e9",
  onSurfaceVariant: "#c5c6d0",
  outline: "#8f909a",
  outlineVariant: "#45464f",
  success: "#7ee0a8",
};

export const SCREEN_SIZE = { width: 600, height: 1282 } as const;

function frame(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = M3.surface;
  roundRect(ctx, 0, 0, w, h, 64);
  ctx.fill();
  const mono = fontStack("mono");
  ctx.fillStyle = M3.onSurface;
  ctx.font = `600 24px ${mono}`;
  ctx.textAlign = "left";
  ctx.fillText("9:41", 48, 58);
  // camera cut-out
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(w / 2, 46, 15, 0, Math.PI * 2);
  ctx.fill();
  // signal + battery
  ctx.fillStyle = M3.onSurface;
  for (let i = 0; i < 4; i++) ctx.fillRect(w - 150 + i * 11, 58 - (i + 1) * 6, 7, (i + 1) * 6);
  roundRect(ctx, w - 92, 38, 44, 22, 5);
  ctx.fill();
}

function text(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, size: number, color: string, weight = 400, align: CanvasTextAlign = "left") {
  ctx.font = `${weight} ${size}px ${fontStack("sans")}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(value, x, y);
}

function pill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string, stroke?: string) {
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function avatar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, initials: string, fill: string) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  text(ctx, initials, x, y + r * 0.36, r * 0.9, M3.onPrimaryContainer, 600, "center");
}

function field(ctx: CanvasRenderingContext2D, y: number, label: string, value: string, w: number) {
  ctx.strokeStyle = M3.outline;
  ctx.lineWidth = 2;
  roundRect(ctx, 48, y, w - 96, 100, 10);
  ctx.stroke();
  ctx.fillStyle = M3.surface;
  ctx.fillRect(64, y - 14, ctx.measureText(label).width + 60, 28);
  text(ctx, label, 74, y + 8, 22, M3.primary, 500);
  text(ctx, value, 74, y + 64, 30, M3.onSurface);
}

export const signInScreen: Painter = (ctx, w, h) => {
  frame(ctx, w, h);
  roundRect(ctx, w / 2 - 54, 150, 108, 108, 30);
  ctx.fillStyle = M3.primaryContainer;
  ctx.fill();
  text(ctx, "M", w / 2, 226, 60, M3.onPrimaryContainer, 700, "center");
  text(ctx, "Welcome back", w / 2, 350, 50, M3.onSurface, 600, "center");
  text(ctx, "Sign in to manage your appointments", w / 2, 400, 24, M3.onSurfaceVariant, 400, "center");
  ctx.font = `500 22px ${fontStack("sans")}`;
  field(ctx, 470, "Email", "sara@example.com", w);
  field(ctx, 610, "Password", "••••••••••", w);
  text(ctx, "Forgot password?", w - 48, 760, 24, M3.primary, 500, "right");
  pill(ctx, 48, 800, w - 96, 96, M3.primary);
  text(ctx, "Sign in", w / 2, 860, 30, M3.onPrimary, 600, "center");
  ctx.fillStyle = M3.outlineVariant;
  ctx.fillRect(48, 960, w / 2 - 90, 2);
  ctx.fillRect(w / 2 + 42, 960, w / 2 - 90, 2);
  text(ctx, "or", w / 2, 969, 24, M3.onSurfaceVariant, 400, "center");
  pill(ctx, 48, 1010, w - 96, 96, "transparent", M3.outline);
  text(ctx, "Continue with Google", w / 2, 1070, 28, M3.primary, 500, "center");
  text(ctx, "New here?  Create account", w / 2, 1200, 24, M3.onSurfaceVariant, 400, "center");
};

export const homeScreen: Painter = (ctx, w, h) => {
  frame(ctx, w, h);
  text(ctx, "Good morning,", 48, 150, 26, M3.onSurfaceVariant);
  text(ctx, "Sara", 48, 200, 46, M3.onSurface, 600);
  avatar(ctx, w - 84, 168, 36, "S", M3.primaryContainer);

  pill(ctx, 48, 240, w - 96, 88, M3.containerHigh);
  ctx.strokeStyle = M3.onSurfaceVariant;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(100, 280, 13, 0, Math.PI * 2);
  ctx.moveTo(110, 290);
  ctx.lineTo(122, 302);
  ctx.stroke();
  text(ctx, "Search doctors, clinics", 140, 294, 26, M3.onSurfaceVariant);

  const chips = ["All", "Dental", "Cardio", "Skin"];
  let x = 48;
  ctx.font = `500 24px ${fontStack("sans")}`;
  chips.forEach((chip, i) => {
    const cw = ctx.measureText(chip).width + 52;
    pill(ctx, x, 360, cw, 60, i === 0 ? M3.secondaryContainer : "transparent", i === 0 ? undefined : M3.outlineVariant);
    text(ctx, chip, x + cw / 2, 399, 24, M3.onSurface, 500, "center");
    x += cw + 14;
  });

  roundRect(ctx, 48, 452, w - 96, 236, 28);
  ctx.fillStyle = M3.primaryContainer;
  ctx.fill();
  text(ctx, "UPCOMING", 84, 506, 20, M3.primary, 600);
  text(ctx, "Dr. Lina Haddad", 84, 560, 36, M3.onPrimaryContainer, 600);
  text(ctx, "Cardiology · Tue 10:30", 84, 604, 26, M3.onPrimaryContainer);
  pill(ctx, w - 228, 614, 144, 54, M3.primary);
  text(ctx, "Details", w - 156, 650, 24, M3.onPrimary, 600, "center");

  text(ctx, "Top doctors", 48, 760, 30, M3.onSurface, 600);
  text(ctx, "See all", w - 48, 760, 24, M3.primary, 500, "right");
  const doctors = [
    ["OK", "Dr. Omar Khalil", "Dentist · 1.2 km"],
    ["MR", "Dr. Maya Rahal", "Dermatology · 2.4 km"],
    ["YA", "Dr. Yusuf Amin", "Pediatrics · 3.1 km"],
  ];
  doctors.forEach(([initials, name, note], i) => {
    const y = 800 + i * 112;
    avatar(ctx, 92, y + 48, 38, initials, M3.secondaryContainer);
    text(ctx, name, 152, y + 40, 28, M3.onSurface, 500);
    text(ctx, note, 152, y + 78, 22, M3.onSurfaceVariant);
    text(ctx, "★ 4.9", w - 48, y + 56, 22, M3.primary, 500, "right");
  });

  ctx.fillStyle = M3.container;
  ctx.fillRect(0, h - 150, w, 150);
  const tabs = ["Home", "Bookings", "Chat", "Profile"];
  tabs.forEach((tab, i) => {
    const cx = (w / tabs.length) * (i + 0.5);
    if (i === 0) pill(ctx, cx - 44, h - 128, 88, 48, M3.secondaryContainer);
    ctx.strokeStyle = i === 0 ? M3.onSurface : M3.onSurfaceVariant;
    ctx.lineWidth = 3;
    roundRect(ctx, cx - 14, h - 116, 28, 24, 6);
    ctx.stroke();
    text(ctx, tab, cx, h - 50, 22, i === 0 ? M3.onSurface : M3.onSurfaceVariant, i === 0 ? 600 : 400, "center");
  });
};

export const bookingScreen: Painter = (ctx, w, h) => {
  frame(ctx, w, h);
  // Heads-up push notification.
  roundRect(ctx, 28, 92, w - 56, 132, 28);
  ctx.fillStyle = M3.containerHigh;
  ctx.fill();
  roundRect(ctx, 56, 120, 48, 48, 14);
  ctx.fillStyle = M3.primaryContainer;
  ctx.fill();
  text(ctx, "M", 80, 154, 26, M3.onPrimaryContainer, 700, "center");
  text(ctx, "Medora · now", 124, 142, 20, M3.onSurfaceVariant);
  text(ctx, "Reminder: Dr. Lina in 30 min", 124, 186, 26, M3.onSurface, 500);

  text(ctx, "←", 48, 300, 36, M3.onSurface);
  text(ctx, "Book appointment", 104, 300, 32, M3.onSurface, 600);

  avatar(ctx, 92, 386, 40, "LH", M3.primaryContainer);
  text(ctx, "Dr. Lina Haddad", 152, 378, 28, M3.onSurface, 500);
  text(ctx, "Cardiology · Medora Clinic", 152, 414, 22, M3.onSurfaceVariant);

  text(ctx, "March", 48, 500, 26, M3.onSurface, 600);
  const days = [["Mon", "12"], ["Tue", "13"], ["Wed", "14"], ["Thu", "15"], ["Fri", "16"]];
  const dw = (w - 96 - 4 * 14) / 5;
  days.forEach(([d, n], i) => {
    const x = 48 + i * (dw + 14);
    const active = i === 1;
    roundRect(ctx, x, 526, dw, 116, 22);
    ctx.fillStyle = active ? M3.primary : M3.container;
    ctx.fill();
    text(ctx, d, x + dw / 2, 568, 20, active ? M3.onPrimary : M3.onSurfaceVariant, 500, "center");
    text(ctx, n, x + dw / 2, 616, 32, active ? M3.onPrimary : M3.onSurface, 600, "center");
  });

  text(ctx, "Available times", 48, 712, 26, M3.onSurface, 600);
  const slots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
  const sw = (w - 96 - 2 * 14) / 3;
  slots.forEach((slot, i) => {
    const x = 48 + (i % 3) * (sw + 14);
    const y = 738 + Math.floor(i / 3) * 84;
    const active = i === 3;
    const disabled = i === 1;
    pill(ctx, x, y, sw, 66, active ? M3.secondaryContainer : "transparent", active ? undefined : M3.outlineVariant);
    text(ctx, slot, x + sw / 2, y + 43, 24, disabled ? M3.outlineVariant : M3.onSurface, 500, "center");
  });

  const steps = ["Requested", "Confirmed", "Reminder scheduled"];
  steps.forEach((step, i) => {
    const y = 950 + i * 52;
    ctx.beginPath();
    ctx.arc(64, y - 8, 10, 0, Math.PI * 2);
    ctx.fillStyle = M3.success;
    ctx.fill();
    text(ctx, step, 92, y, 24, M3.onSurfaceVariant);
  });

  pill(ctx, 48, h - 150, w - 96, 96, M3.primary);
  text(ctx, "Confirm booking", w / 2, h - 90, 30, M3.onPrimary, 600, "center");
};

