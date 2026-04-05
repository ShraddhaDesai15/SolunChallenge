export default function AlertBanner({ count }) {
  return (
   <div className="bg-red-100 text-red-700 p-3 text-center font-medium">
  ⚠️ {count} shipments are High Risk!
</div>
  );
}