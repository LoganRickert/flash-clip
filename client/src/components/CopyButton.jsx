export default function CopyButton({ onCopy, disabled }) {
  return (
    <button
      type="button"
      className="btn btn-copy"
      onClick={onCopy}
      disabled={disabled}
    >
      Copy
    </button>
  );
}
