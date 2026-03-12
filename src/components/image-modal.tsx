"use client";
import { X } from "lucide-react";

export function ImageModal({
  src,
  onClose,
}: {
  src: string | null;
  onClose: () => void;
}) {
  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-999 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-50"
      >
        <X size={24} />
      </button>
      <img
        src={src}
        className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
        alt="Vista ampliada"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
