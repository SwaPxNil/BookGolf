const ACTION_STYLE = {
  view: "border-[#2E4A37]/30 bg-[#EAF2E9] text-[#244033] hover:bg-[#DDEBDD]",
  edit: "border-[#3A5A46]/30 bg-[#E9EFE6] text-[#2E4A37] hover:bg-[#DEE8DA]",
  update: "border-[#3A5A46]/30 bg-[#E9EFE6] text-[#2E4A37] hover:bg-[#DEE8DA]",
  delete: "border-[#C24D5A]/25 bg-[#FCECEF] text-[#C23749] hover:bg-[#F8DDE2]",
  muted: "border-black/10 bg-black/5 text-ink/45",
};

const normalizeAction = (action) => {
  if (typeof action === "string") {
    return { label: action };
  }

  return action || { label: "Action" };
};

export default function TableActions({ actions = ["View", "Edit", "Delete"] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((item) => {
        const action = normalizeAction(item);
        const key = String(action.label || "action").toLowerCase();
        const toneKey = action.tone || key;
        const variant = action.disabled ? ACTION_STYLE.muted : ACTION_STYLE[toneKey] || ACTION_STYLE.view;

        return (
          <button
            key={`${action.label}-${toneKey}`}
            type="button"
            onClick={action.onClick}
            disabled={Boolean(action.disabled)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.02em] transition ${variant} ${action.disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            {action.label}
          </button>
        );
      })}
    </div>
  );
}