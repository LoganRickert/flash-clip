import { Copy } from 'lucide-react';

export default function CopyButton({ onCopy, disabled }) {
  return (
    <button
      type="button"
      className="btn btn-copy"
      onClick={onCopy}
      disabled={disabled}
    >
      <Copy size={18} strokeWidth={2.25} aria-hidden="true" />
      Copy
    </button>
  );
}
