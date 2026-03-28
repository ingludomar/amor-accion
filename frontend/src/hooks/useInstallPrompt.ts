import { useState, useEffect } from 'react';

// Captura global del evento — se ejecuta antes de que cualquier componente monte
let deferredPrompt: any = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

export function useInstallPrompt() {
  const [prompt, setPrompt] = useState<any>(deferredPrompt);
  const [isInstalled, setIsInstalled] = useState(
    window.matchMedia('(display-mode: standalone)').matches
  );

  useEffect(() => {
    // Si ya se capturó antes de montar, usarlo
    if (deferredPrompt) setPrompt(deferredPrompt);

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      setPrompt(e);
    };

    const installedHandler = () => {
      setIsInstalled(true);
      deferredPrompt = null;
      setPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    deferredPrompt = null;
    setPrompt(null);
  };

  return { canInstall: !!prompt && !isInstalled, install };
}
