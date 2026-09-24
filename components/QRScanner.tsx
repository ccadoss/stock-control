'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScanner({ onScan }: { onScan: (value: string) => void }) {
  const ref = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const scanner = new Html5Qrcode('irsyad-reader');
    ref.current = scanner;
    scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 250, height: 250 } }, text => {
      onScan(text);
      scanner.stop().catch(() => {});
    }, () => {}).catch(() => setError('Kamera tidak dapat dibuka. Benarkan akses kamera atau masukkan kod secara manual.'));
    return () => { scanner.stop().catch(() => {}); scanner.clear().catch(() => {}); };
  }, [onScan]);

  return <div><div id="irsyad-reader" className="scanner" />{error && <p className="error">{error}</p>}</div>;
}
