const styles = {
  Pending: "bg-[#EED9A7] text-[#6C5311]",
  Completed: "bg-[#C9D9A8] text-[#2E4A37]",
  Confirmed: "bg-[#D8E4D5] text-[#2E4A37]",
  Active: "bg-[#D7D0BF] text-[#3B4137]",
};

export default function StatusBadge({ value }) {
  return (
    <span className={`font-bebas rounded-full px-3 py-1 text-xs ${styles[value] || "bg-slate-100 text-slate-700"}`}>
      {value}
    </span>
  );
}
