import { ClipboardPaste } from 'lucide-react';

export default function PasteButton({ onPaste, disabled }) {
  return (
    <button
      type="button"
      className="btn btn-paste"
      onClick={onPaste}
      disabled={disabled}
    >
      <ClipboardPaste size={18} strokeWidth={2.25} aria-hidden="true" />
      Paste
    </button>
  );
}
