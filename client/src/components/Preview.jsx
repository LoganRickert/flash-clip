export default function Preview({ preview }) {
  return (
    <div className="preview" aria-live="polite">
      {preview ? (
        <span className="preview-text">{preview}</span>
      ) : (
        <span className="preview-empty">Nothing to copy</span>
      )}
    </div>
  );
}
