import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function DownloadAppButton() {
  const handleInstall = async () => {
    // Check if PWA install prompt is available
    const deferredPrompt = (window as any).deferredPrompt;
    
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        toast.success('App installed successfully!');
      }
      (window as any).deferredPrompt = null;
    } else {
      // Fallback - show instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      if (isIOS) {
        toast.info('Tap the Share button, then "Add to Home Screen"');
      } else if (isAndroid) {
        toast.info('Tap the menu (⋮), then "Install app" or "Add to Home Screen"');
      } else {
        toast.info('Use your browser\'s menu to install this app');
      }
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleInstall} className="gap-2">
      <Download className="w-4 h-4" />
      <span className="hidden sm:inline">Install App</span>
    </Button>
  );
}
