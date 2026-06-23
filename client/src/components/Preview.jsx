import { ClipboardList, Inbox } from 'lucide-react';

export default function Preview({ preview, highlighted }) {
  return (
    <div
      className={`preview${highlighted ? ' preview-highlight' : ''}`}
      aria-live="polite"
    >
      {preview ? (
        <span className="preview-content">
          <ClipboardList className="preview-icon" size={20} strokeWidth={2} aria-hidden="true" />
          <span className="preview-text">{preview}</span>
        </span>
      ) : (
        <span className="preview-content preview-empty">
          <Inbox className="preview-icon" size={20} strokeWidth={2} aria-hidden="true" />
          Nothing to copy
        </span>
      )}
    </div>
  );
}
