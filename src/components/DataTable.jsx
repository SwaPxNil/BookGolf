import StatusBadge from "./StatusBadge";

export default function DataTable({ columns, data }) {
  return (
    <div className="overflow-hidden rounded-[30px] border border-[#d2c6aa] bg-[#fbf5e8] shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-[linear-gradient(90deg,#262B27_0%,#2E4A37_70%,#415634_100%)] text-sand">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-5 py-4 text-left text-sm font-semibold tracking-[0.06em] text-[#F3D87A]">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-t border-black/5 transition hover:bg-[#efe5ca]/45">
                {columns.map((column) => {
                  const value = row[column.key];
                  return (
                    <td key={column.key} className="font-abel px-5 py-4 text-base text-ink/80">
                      {column.render ? column.render(value, row) : column.key.toLowerCase().includes("status") ? <StatusBadge value={value} /> : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
