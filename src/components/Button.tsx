interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-green-500 hover:bg-green-600 text-zinc-900 font-bold py-3 px-6 rounded-xl transition-colors"
    >
      {children}
    </button>
  );
}