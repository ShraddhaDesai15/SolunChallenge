export default function StatCard({ title, value }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition">
  <h3 className="text-gray-500 text-sm">{title}</h3>
  <p className="text-2xl font-bold text-gray-800">{value}</p>
</div>
  );
}