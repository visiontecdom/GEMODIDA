"use client";

import { useState, useEffect } from 'react';

export default function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onClick = async () => {
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();
    const { outcome } = await promptInstall.userChoice;
    if (outcome === 'accepted') {
      console.log('Usuario aceptó la instalación de la PWA');
    } else {
      console.log('Usuario rechazó la instalación de la PWA');
    }
    setPromptInstall(null);
  };

  if (!supportsPWA) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg z-50"
      aria-label="Instalar aplicación"
      title="Instalar aplicación"
    >
      Instalar App
    </button>
  );
}
