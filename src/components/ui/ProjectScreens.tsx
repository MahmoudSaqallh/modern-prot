import type { PreviewKind } from "@/data/projects";

// Interface previews drawn with markup so the showcase works before real
// screenshots exist. Everything is sized in `em` from a container-relative
// root size, so each preview scales with its device frame.

const bar = (w: string, tone = "bg-white/10") => <span className={`block h-[0.55em] rounded-full ${tone}`} style={{ width: w }} />;

function LogisticsScreen() {
  const orders = [
    ["#4821", "Picked up", "bg-[#4dd8ff]"],
    ["#4820", "On route", "bg-[#7ee0a8]"],
    ["#4819", "Assigned", "bg-[#8ea2ff]"],
    ["#4818", "Delivered", "bg-white/30"],
    ["#4817", "On route", "bg-[#7ee0a8]"],
  ];
  return (
    <div className="flex h-full bg-[#0b0d11] text-[#e9ecf0]">
      <div className="flex w-[3.4em] flex-col items-center gap-[1.1em] border-r border-white/5 py-[1.2em]">
        <span className="h-[1.4em] w-[1.4em] rounded-[0.35em] bg-[#4dd8ff]" />
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`h-[1em] w-[1em] rounded-[0.25em] ${i === 0 ? "bg-white/40" : "bg-white/12"}`} />
        ))}
      </div>
      <div className="flex w-[34%] flex-col border-r border-white/5">
        <div className="flex items-center justify-between border-b border-white/5 px-[1.1em] py-[0.9em]">
          <span className="text-[1.05em] font-semibold">Dispatch</span>
          <span className="rounded-full bg-[#4dd8ff]/15 px-[0.6em] py-[0.15em] text-[0.7em] text-[#4dd8ff]">LIVE · 38</span>
        </div>
        {orders.map(([id, status, dot], i) => (
          <div key={id} className={`flex items-center justify-between px-[1.1em] py-[0.75em] ${i === 1 ? "bg-white/[0.04]" : ""}`}>
            <div className="grid gap-[0.35em]">
              <span className="text-[0.8em] font-medium">Order {id}</span>
              {bar(`${6 + (i % 3) * 1.5}em`, "bg-white/8")}
            </div>
            <span className="flex items-center gap-[0.4em] text-[0.68em] text-white/60">
              <span className={`h-[0.5em] w-[0.5em] rounded-full ${dot}`} />
              {status}
            </span>
          </div>
        ))}
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "2.2em 2.2em",
          }}
        />
        <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true">
          <path d="M40 250 C 120 230, 120 140, 200 150 S 300 60, 360 50" fill="none" stroke="#4dd8ff" strokeWidth="2.5" strokeDasharray="6 6" />
          <path d="M60 60 C 140 90, 180 210, 330 230" fill="none" stroke="#7ee0a8" strokeWidth="2" opacity="0.7" />
          <circle cx="200" cy="150" r="7" fill="#4dd8ff" />
          <circle cx="200" cy="150" r="16" fill="#4dd8ff" opacity="0.18" />
          <circle cx="330" cy="230" r="6" fill="#7ee0a8" />
          <circle cx="360" cy="50" r="5" fill="#e9ecf0" />
        </svg>
        <div className="absolute bottom-[1em] left-[1em] rounded-[0.6em] border border-white/10 bg-[#0d0f13]/90 px-[0.9em] py-[0.7em]">
          <span className="block text-[0.65em] text-white/50">DRIVER · KAREEM</span>
          <span className="block text-[0.85em] font-medium">ETA 12 min · 3.4 km</span>
        </div>
      </div>
    </div>
  );
}

function CommerceScreen() {
  const products = [
    ["Field Jacket", "$148", "from-[#e8c07a]/40"],
    ["Canvas Tote", "$42", "from-[#f08a6c]/35"],
    ["Wool Beanie", "$28", "from-[#8ea2ff]/35"],
    ["Trail Runner", "$124", "from-[#7ee0a8]/30"],
  ];
  return (
    <div className="flex h-full flex-col bg-[#0e0d0b] text-[#f3eee6]">
      <div className="flex items-center justify-between px-[1.6em] py-[1em]">
        <span className="font-serif text-[1.25em] italic">Northwind</span>
        <span className="flex gap-[1.4em] text-[0.72em] text-white/60">
          <span>New</span>
          <span>Men</span>
          <span>Women</span>
          <span>Journal</span>
        </span>
        <span className="rounded-full border border-white/20 px-[0.7em] py-[0.15em] text-[0.7em]">Cart · 2</span>
      </div>
      <div className="grid grid-cols-[1.1fr_1fr] gap-[1.2em] px-[1.6em] pt-[0.6em]">
        <div className="flex flex-col justify-center gap-[0.7em]">
          <span className="text-[0.65em] tracking-[0.18em] text-[#e8c07a]">AUTUMN EDIT</span>
          <span className="text-[2em] font-semibold leading-[1] tracking-[-0.03em]">Made for the long way home.</span>
          <span className="mt-[0.3em] w-fit rounded-full bg-[#f3eee6] px-[1em] py-[0.45em] text-[0.72em] font-medium text-[#0e0d0b]">
            Shop the edit
          </span>
        </div>
        <div className="aspect-[4/3] rounded-[0.6em] bg-gradient-to-br from-[#e8c07a]/45 via-[#3a2f22] to-[#151310]" />
      </div>
      <div className="mt-auto grid grid-cols-4 gap-[0.9em] px-[1.6em] pb-[1.4em]">
        {products.map(([name, price, tone]) => (
          <div key={name} className="grid gap-[0.4em]">
            <div className={`aspect-square rounded-[0.45em] bg-gradient-to-b ${tone} to-[#1a1815]`} />
            <span className="flex justify-between text-[0.7em]">
              <span>{name}</span>
              <span className="text-white/55">{price}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardScreen() {
  const kpis = [
    ["Revenue", "$84.2k", "+12.4%"],
    ["Orders", "1,284", "+8.1%"],
    ["Avg. basket", "$65.6", "+3.9%"],
    ["Refunds", "0.8%", "−0.2%"],
  ];
  const bars = [38, 52, 44, 61, 58, 72, 66, 80, 74, 88, 83, 95];
  return (
    <div className="flex h-full bg-[#0a0c0b] text-[#e9ecf0]">
      <div className="flex w-[11em] flex-col gap-[0.5em] border-r border-white/5 p-[1em]">
        <span className="mb-[0.6em] flex items-center gap-[0.5em] text-[0.9em] font-semibold">
          <span className="h-[1em] w-[1em] rounded-[0.3em] bg-[#7ee0a8]" /> Pulse
        </span>
        {["Overview", "Orders", "Customers", "Reports", "Audit log", "Settings"].map((item, i) => (
          <span key={item} className={`rounded-[0.4em] px-[0.6em] py-[0.4em] text-[0.72em] ${i === 0 ? "bg-white/[0.07] text-white" : "text-white/50"}`}>
            {item}
          </span>
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-[1em] p-[1.2em]">
        <div className="flex items-center justify-between">
          <span className="text-[1.05em] font-semibold">Overview</span>
          <span className="rounded-[0.4em] border border-white/10 px-[0.6em] py-[0.25em] text-[0.65em] text-white/60">Last 30 days</span>
        </div>
        <div className="grid grid-cols-4 gap-[0.8em]">
          {kpis.map(([label, value, delta]) => (
            <div key={label} className="rounded-[0.5em] border border-white/[0.06] p-[0.8em]">
              <span className="block text-[0.62em] text-white/50">{label}</span>
              <span className="mt-[0.2em] block text-[1.2em] font-semibold tracking-[-0.02em]">{value}</span>
              <span className="text-[0.6em] text-[#7ee0a8]">{delta}</span>
            </div>
          ))}
        </div>
        <div className="grid flex-1 grid-cols-[1.6fr_1fr] gap-[0.8em]">
          <div className="flex flex-col rounded-[0.5em] border border-white/[0.06] p-[0.8em]">
            <span className="text-[0.7em] text-white/60">Revenue by week</span>
            <div className="mt-[0.8em] flex flex-1 items-end gap-[0.45em]">
              {bars.map((h, i) => (
                <span key={i} className={`flex-1 rounded-t-[0.2em] ${i === bars.length - 1 ? "bg-[#7ee0a8]" : "bg-white/15"}`} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          <div className="rounded-[0.5em] border border-white/[0.06] p-[0.8em]">
            <span className="text-[0.7em] text-white/60">Recent activity</span>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="mt-[0.75em] flex items-center gap-[0.6em]">
                <span className="h-[1.4em] w-[1.4em] rounded-full bg-white/10" />
                <span className="grid flex-1 gap-[0.3em]">
                  {bar(`${70 - i * 10}%`, "bg-white/15")}
                  {bar(`${45 - i * 5}%`, "bg-white/[0.07]")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileAppScreen() {
  return (
    <div className="flex h-full flex-col bg-[#121318] px-[1.2em] pt-[2.4em] text-[#e3e2e9]">
      <span className="text-[0.85em] text-[#c5c6d0]">Good morning,</span>
      <span className="text-[1.6em] font-semibold">Sara</span>
      <span className="mt-[0.8em] rounded-full bg-[#292a2f] px-[1em] py-[0.7em] text-[0.8em] text-[#c5c6d0]">Search doctors, clinics</span>
      <div className="mt-[0.9em] rounded-[1em] bg-[#34447a] p-[1em]">
        <span className="block text-[0.65em] font-semibold tracking-[0.1em] text-[#b6c4ff]">UPCOMING</span>
        <span className="mt-[0.3em] block text-[1.1em] font-semibold text-[#dce1ff]">Dr. Lina Haddad</span>
        <span className="block text-[0.8em] text-[#dce1ff]">Cardiology · Tue 10:30</span>
      </div>
      <span className="mt-[1em] text-[0.95em] font-semibold">Top doctors</span>
      {["Dr. Omar Khalil", "Dr. Maya Rahal", "Dr. Yusuf Amin"].map((name) => (
        <div key={name} className="mt-[0.7em] flex items-center gap-[0.7em]">
          <span className="h-[2.2em] w-[2.2em] rounded-full bg-[#414659]" />
          <span className="grid">
            <span className="text-[0.85em]">{name}</span>
            <span className="text-[0.7em] text-[#c5c6d0]">2.4 km · ★ 4.9</span>
          </span>
        </div>
      ))}
      <div className="-mx-[1.2em] mt-auto flex justify-around bg-[#1e1f25] py-[0.9em] text-[0.7em] text-[#c5c6d0]">
        <span className="rounded-full bg-[#414659] px-[1em] py-[0.2em] text-[#e3e2e9]">Home</span>
        <span>Bookings</span>
        <span>Chat</span>
        <span>Profile</span>
      </div>
    </div>
  );
}

function SaasScreen() {
  return (
    <div className="flex h-full flex-col items-center bg-[#0b0a0a] px-[2em] text-center text-[#f2eeec]">
      <div className="flex w-full items-center justify-between py-[1em] text-[0.72em]">
        <span className="font-semibold">◆ Launchpad</span>
        <span className="flex gap-[1.2em] text-white/55">
          <span>Docs</span>
          <span>Pricing</span>
          <span>Changelog</span>
        </span>
        <span className="rounded-full bg-[#f08a6c] px-[0.8em] py-[0.25em] text-[#1a0f0b]">Start free</span>
      </div>
      <span className="mt-[1.6em] rounded-full border border-white/10 px-[0.8em] py-[0.2em] text-[0.62em] text-[#f08a6c]">v3.0 — incremental builds</span>
      <span className="mt-[0.8em] max-w-[18em] text-[2.1em] font-semibold leading-[1.02] tracking-[-0.03em]">Ship docs as fast as you ship code.</span>
      <div className="mt-[1.4em] w-[70%] rounded-[0.6em] border border-white/10 bg-white/[0.03] p-[0.9em] text-left font-mono text-[0.68em]">
        <span className="text-white/40">$</span> npx launchpad init <span className="text-[#f08a6c]">my-docs</span>
        <span className="mt-[0.4em] block text-[#7ee0a8]">✓ 142 pages generated in 1.8s</span>
      </div>
      <div className="mt-auto flex w-full justify-around pb-[1.4em] text-[0.7em] text-white/30">
        <span>VERCEL</span>
        <span>LINEAR</span>
        <span>RAYCAST</span>
        <span>SUPABASE</span>
      </div>
    </div>
  );
}

function ApiScreen() {
  const endpoints = [
    ["GET", "/v1/projects", "text-[#7ee0a8] bg-[#7ee0a8]/10"],
    ["POST", "/v1/projects", "text-[#4dd8ff] bg-[#4dd8ff]/10"],
    ["GET", "/v1/users/:id", "text-[#7ee0a8] bg-[#7ee0a8]/10"],
    ["PATCH", "/v1/orders/:id", "text-[#e8c07a] bg-[#e8c07a]/10"],
    ["DELETE", "/v1/sessions", "text-[#f08a6c] bg-[#f08a6c]/10"],
  ];
  return (
    <div className="flex h-full bg-[#0b0d0c] font-mono text-[#e9ecf0]">
      <div className="flex w-[42%] flex-col gap-[0.5em] border-r border-white/5 p-[1.1em]">
        <span className="mb-[0.4em] text-[0.8em] font-semibold">Relay API · v1</span>
        {endpoints.map(([method, path, tone], i) => (
          <span key={path + method} className={`flex items-center gap-[0.6em] rounded-[0.3em] px-[0.5em] py-[0.35em] text-[0.68em] ${i === 0 ? "bg-white/[0.05]" : ""}`}>
            <span className={`w-[4.2em] rounded-[0.25em] px-[0.3em] text-center text-[0.9em] font-semibold ${tone}`}>{method}</span>
            <span className="text-white/75">{path}</span>
          </span>
        ))}
        <span className="mt-auto text-[0.6em] text-white/35">JWT · rate limit 100/min</span>
      </div>
      <div className="flex flex-1 flex-col gap-[0.6em] p-[1.1em] text-[0.68em]">
        <span className="text-white/45">GET /v1/projects?limit=2</span>
        <span className="w-fit rounded-[0.3em] bg-[#7ee0a8]/15 px-[0.5em] text-[#7ee0a8]">200 OK · 41 ms</span>
        <pre className="whitespace-pre leading-[1.55] text-white/70">{`{
  "data": [
    { "title": "Fleetline",
      "stack": ["MERN"] },
    { "title": "Medora",
      "stack": ["Flutter"] }
  ],
  "total": 42
}`}</pre>
      </div>
    </div>
  );
}

function AdminScreen() {
  const rows = [
    ["Sara Haddad", "Admin", "Active"],
    ["Omar Khalil", "Editor", "Active"],
    ["Maya Rahal", "Viewer", "Invited"],
    ["Yusuf Amin", "Editor", "Active"],
    ["Lina Saleh", "Viewer", "Suspended"],
  ];
  return (
    <div className="flex h-full bg-[#0c0b0f] text-[#e9ecf0]">
      <div className="flex w-[9.5em] flex-col gap-[0.45em] border-r border-white/5 p-[1em]">
        <span className="mb-[0.6em] flex items-center gap-[0.5em] text-[0.85em] font-semibold">
          <span className="h-[0.9em] w-[0.9em] rounded-full bg-[#c9a7ff]" /> Atlas
        </span>
        {["Dashboard", "Users", "Orders", "Content", "Audit log"].map((item, i) => (
          <span key={item} className={`rounded-[0.35em] px-[0.6em] py-[0.35em] text-[0.7em] ${i === 1 ? "bg-white/[0.07]" : "text-white/50"}`}>
            {item}
          </span>
        ))}
      </div>
      <div className="flex flex-1 flex-col p-[1.1em]">
        <div className="flex items-center justify-between">
          <span className="text-[1em] font-semibold">Users</span>
          <span className="rounded-[0.35em] bg-[#c9a7ff] px-[0.7em] py-[0.25em] text-[0.65em] font-medium text-[#14101c]">Invite user</span>
        </div>
        <div className="mt-[0.9em] grid grid-cols-[1.6fr_1fr_1fr] border-b border-white/10 pb-[0.4em] text-[0.62em] text-white/45">
          <span>Name</span>
          <span>Role</span>
          <span>Status</span>
        </div>
        {rows.map(([name, role, status]) => (
          <div key={name} className="grid grid-cols-[1.6fr_1fr_1fr] items-center border-b border-white/5 py-[0.55em] text-[0.7em]">
            <span className="flex items-center gap-[0.5em]">
              <span className="h-[1.5em] w-[1.5em] rounded-full bg-white/10" />
              {name}
            </span>
            <span className="text-white/60">{role}</span>
            <span className={status === "Active" ? "text-[#7ee0a8]" : status === "Invited" ? "text-[#e8c07a]" : "text-[#f08a6c]"}>{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProjectScreen({ kind }: { kind: PreviewKind }) {
  switch (kind) {
    case "api":
      return <ApiScreen />;
    case "admin":
      return <AdminScreen />;
    case "logistics":
      return <LogisticsScreen />;
    case "commerce":
      return <CommerceScreen />;
    case "dashboard":
      return <DashboardScreen />;
    case "mobile":
      return <MobileAppScreen />;
    case "saas":
      return <SaasScreen />;
  }
}
