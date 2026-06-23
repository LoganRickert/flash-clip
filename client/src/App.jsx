import { useCallback, useEffect, useState } from 'react';
import { BellRing, Info, Zap } from 'lucide-react';
import { copyText, fetchPreview, pasteText } from './api.js';
import { createWebSocket } from './ws.js';
import Preview from './components/Preview.jsx';
import PasteButton from './components/PasteButton.jsx';
import CopyButton from './components/CopyButton.jsx';

export default function App() {
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [alert, setAlert] = useState(false);

  const refreshPreview = useCallback(async () => {
    const data = await fetchPreview();
    setPreview(data.preview);
  }, []);

  useEffect(() => {
    refreshPreview().catch(() => {
      setMessage('Could not reach the server.');
    });
  }, [refreshPreview]);

  useEffect(() => {
    const ws = createWebSocket((data) => {
      setPreview(data.preview);

      if (data.event === 'pasted' && data.preview) {
        setMessage('New item ready to copy.');
        setAlert(true);
      }

      if (data.event === 'copied') {
        setMessage('Item was copied and removed.');
        setAlert(false);
      }
    });

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (!alert) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setAlert(false);
    }, 3000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [alert]);

  async function handlePaste() {
    setMessage('');
    setAlert(false);
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
    setAlert(false);
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
      <h1 className="title">
        <Zap className="title-icon" size={28} strokeWidth={2.25} aria-hidden="true" />
        FlashClip
      </h1>
      <p className="subtitle">One-time clipboard relay across browsers and devices.</p>

      {alert && (
        <p className="alert" role="alert">
          <BellRing className="alert-icon" size={18} strokeWidth={2.25} aria-hidden="true" />
          New item pasted and ready to copy.
        </p>
      )}

      <Preview preview={preview} highlighted={alert} />

      <div className="actions">
        <PasteButton onPaste={handlePaste} disabled={busy} />
        <CopyButton onCopy={handleCopy} disabled={busy || !preview} />
      </div>

      {message && (
        <p className="message">
          <Info className="message-icon" size={16} strokeWidth={2.25} aria-hidden="true" />
          {message}
        </p>
      )}
    </main>
  );
}
