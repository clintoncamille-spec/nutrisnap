import { Camera, Upload } from "lucide-react";
import { type ChangeEvent, useRef } from "react";

interface Props {
  onSelect: (file: File) => void;
  label: string;
}

export function ImageSourcePicker({ onSelect, label }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onSelect(file);
    e.target.value = "";
  };

  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-neutral-300 bg-white p-10 text-center"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) onSelect(file);
      }}
    >
      <Upload className="text-neutral-400" size={32} />
      <p className="text-sm text-neutral-600">{label}</p>
      <button
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
      >
        <Camera size={16} />
        Take photo / choose file
      </button>
      {/* capture="environment" triggers the native camera on mobile browsers */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
