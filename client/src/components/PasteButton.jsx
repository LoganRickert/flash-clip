export default function PasteButton({ onPaste, disabled }) {
  return (
    <button
      type="button"
      className="btn btn-paste"
      onClick={onPaste}
      disabled={disabled}
    >
      Paste
    </button>
  );
}
