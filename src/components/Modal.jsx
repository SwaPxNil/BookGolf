export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[30px] border border-white/50 bg-parchment p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bebas text-[32px] text-ink">{title}</h3>
          <button onClick={onClose} className="font-bebas rounded-full bg-charcoal px-4 py-2 text-sm text-sand">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
