import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className={
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50 backdrop-blur-sm"
      }
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative animate-fade-in">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
          >
            &times;
          </button>
        )}
        <h2 className="text-xl font-bold mb-4 text-gray-800">{title}</h2>
        {children}
      </div>
    </div>
  );
}
