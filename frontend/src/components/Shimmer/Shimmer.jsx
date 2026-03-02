export default function Shimmer({ height = "h-6" }) {
  return (
    <div className={`w-full ${height} bg-[#1f2937] animate-pulse rounded-md`} />
  );
}