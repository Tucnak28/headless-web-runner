export default function AddBotButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-gray-300 hover:bg-gray-400 text-black w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold"
    >
      +
    </button>
  );
}
