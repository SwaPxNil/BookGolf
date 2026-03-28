export default function StatCard({ title, value, icon: Icon, accent = "from-[#2E4A37] to-[#798D3D]" }) {
  return (
    <div className="rounded-[30px] border border-[#d5ccb7] bg-[linear-gradient(180deg,#fff9ec_0%,#f1e7d2_100%)] p-5 shadow-soft">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-abel text-sm font-medium uppercase tracking-[0.18em] text-ink/55">{title}</p>
          <p className="font-bebas mt-3 bg-[linear-gradient(180deg,#F3D87A_0%,#C7A94A_45%,#8C6A15_100%)] bg-clip-text text-[42px] leading-none text-transparent">{value}</p>
        </div>
        <div className={`rounded-[22px] bg-gradient-to-br ${accent} p-4 text-xl text-white shadow-md ring-1 ring-white/20`}>
          <Icon />
        </div>
      </div>
    </div>
  );
}
