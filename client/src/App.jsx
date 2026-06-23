import { useCallback, useEffect, useState } from 'react';
import { copyText, fetchPreview, pasteText } from './api.js';
import Preview from './components/Preview.jsx';
import PasteButton from './components/PasteButton.jsx';
import CopyButton from './components/CopyButton.jsx';

export default function App() {
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const refreshPreview = useCallback(async () => {
    const data = await fetchPreview();
    setPreview(data.preview);
  }, []);

  useEffect(() => {
    refreshPreview().catch(() => {
      setMessage('Could not reach the server.');
    });
  }, [refreshPreview]);

  async function handlePaste() {
    setMessage('');
    setBusy(true);

    try {
      const clipboardText = await navigator.clipboard.readText();

      if (!clipboardText) {
        setMessage('Clipboard is empty.');
        return;
      }

      const data = await pasteText(clipboardText);
      setPreview(data.preview);
      setMessage('Ready to copy on another device.');
    } catch (error) {
      setMessage(error.message || 'Paste failed.');
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy() {
    setMessage('');
    setBusy(true);

    try {
      const data = await copyText();

      if (!data) {
        setPreview(null);
        setMessage('Nothing to copy.');
        return;
      }

      await navigator.clipboard.writeText(data.text);
      setPreview(null);
      setMessage('Copied to clipboard.');
    } catch (error) {
      setMessage(error.message || 'Copy failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="app">
      <h1>FlashClip</h1>
      <p className="subtitle">One-time clipboard relay across browsers and devices.</p>

      <Preview preview={preview} />

      <div className="actions">
        <PasteButton onPaste={handlePaste} disabled={busy} />
        <CopyButton onCopy={handleCopy} disabled={busy || !preview} />
      </div>

      {message && <p className="message">{message}</p>}
    </main>
  );
}
