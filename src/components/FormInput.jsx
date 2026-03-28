export default function FormInput({ label, className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="font-abel mb-2 block text-sm font-medium text-ink/80">{label}</span>
      <input
        className="font-abel w-full rounded-[24px] border border-black/10 bg-sand px-4 py-3 text-base text-ink outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/15"
        {...props}
      />
    </label>
  );
}
