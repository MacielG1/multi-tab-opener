import { useState, useEffect } from 'react';
import './index.css';

export default function App() {
  const [urls, setUrls] = useState<string[]>(['']);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isOpenMode, setIsOpenMode] = useState(false);
  const [openedUrls, setOpenedUrls] = useState<string[]>([]);
  const [popupBlocked, setPopupBlocked] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlsParam = params.get('urls');

    if (urlsParam) {
      const urlsToOpen = urlsParam
        .split(',')
        .map((url) => {
          const trimmed = url.trim();
          if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
            return 'https://' + trimmed;
          }
          return trimmed;
        })
        .filter((url) => url.length > 8);

      if (urlsToOpen.length > 0) {
        setIsOpenMode(true);
        setOpenedUrls(urlsToOpen);
        return;
      }
    }

    const hash = window.location.hash.slice(1);
    if (hash) {
      try {
        const decoded = decodeURIComponent(hash);
        const urlsToOpen = JSON.parse(decoded) as string[];
        if (Array.isArray(urlsToOpen) && urlsToOpen.length > 0) {
          setIsOpenMode(true);
          setOpenedUrls(urlsToOpen);
        }
      } catch {}
    }
  }, []);

  function addUrl() {
    setUrls([...urls, '']);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addUrl();
    }
  }

  function removeUrl(index: number) {
    if (urls.length > 1) {
      setUrls(urls.filter((_, i) => i !== index));
    }
  }

  function updateUrl(index: number, value: string) {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  }

  function generateLink() {
    const validUrls = urls.filter((url) => url.trim() !== '');
    if (validUrls.length === 0) return;

    const normalizedUrls = validUrls.map((url) => {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return 'https://' + url;
      }
      return url;
    });

    const encoded = encodeURIComponent(JSON.stringify(normalizedUrls));
    const link = `${window.location.origin}${window.location.pathname}#${encoded}`;
    setGeneratedLink(link);
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }

  function openAllNow() {
    let blocked = false;
    openedUrls.forEach((url) => {
      const newWindow = window.open(url, '_blank');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        blocked = true;
        setPopupBlocked(true);
      }
    });
    if (!blocked) {
      setPopupBlocked(false);
    }
  }

  if (isOpenMode) {
    const handleGoBack = (e: React.MouseEvent) => {
      e.preventDefault();
      setIsOpenMode(false);
      setOpenedUrls([]);
      setUrls(['']);
      setGeneratedLink('');
      window.history.pushState({}, '', window.location.pathname);
    };

    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="bg-neutral-900 rounded-3xl p-8 max-w-2xl w-full shadow-2xl border-4 border-blue-600">
          <div className="text-center">
            <div className="text-4xl mb-2">🔗</div>
            <h1 className="text-3xl font-bold text-white mb-4">{openedUrls.length} URLs Ready</h1>
            <button
              onClick={openAllNow}
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all mb-3 cursor-pointer"
            >
              Open All {openedUrls.length} Tabs
            </button>

            {popupBlocked && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-4">
                <p className="text-red-300 text-sm">⚠️ Popups were blocked. Please allow popups for this site and try again.</p>
              </div>
            )}

            <div className="text-left bg-neutral-800 rounded-xl p-4 mt-4 max-h-64 overflow-y-auto border border-neutral-500">
              <p className="text-blue-200 text-xs mb-2 pl-2.5 uppercase tracking-wider font-semibold">URLs to open:</p>
              <div className="space-y-1 pr-2">
                {openedUrls.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 text-neutral-300 hover:text-neutral-100 text-sm transition-colors group"
                  >
                    <span className="text-white font-semibold min-w-[20px] text-right shrink-0">{index + 1}.</span>
                    <span className="truncate flex-1">{url}</span>
                  </a>
                ))}
              </div>
            </div>

            <button
              onClick={handleGoBack}
              className="inline-block mt-6 text-neutral-300 hover:text-neutral-200 text-sm transition-colors cursor-pointer bg-transparent border-none"
            >
              ← Create multi-tab link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 text-slate-50">
      <div className="bg-neutral-900 rounded-3xl p-8 max-w-2xl w-full shadow-2xl border-4 border-blue-600">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Multi-Tab Opener</h1>
          <p className="text-neutral-400">Create a shareable link that opens multiple tabs at once</p>
        </div>

        <div className="space-y-4 mb-6 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
          {urls.map((url, index) => (
            <div key={index} className="flex -space-x-px rounded-md shadow-sm">
              <div className="relative flex flex-1 items-stretch focus-within:z-10">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-neutral-500 text-xs font-mono">{index + 1}</span>
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => updateUrl(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e)}
                  autoFocus={index === urls.length - 1 && index > 0}
                  placeholder="https://example.com"
                  className="block w-full rounded-none rounded-l-md border border-neutral-700 bg-neutral-950 py-2 pl-8 pr-3 text-sm text-neutral-100 placeholder-neutral-500 focus:border-neutral-500 focus:ring-0.5 focus:ring-neutral-500 outline-none transition-all"
                />
              </div>
              <button
                onClick={() => removeUrl(index)}
                disabled={urls.length <= 1}
                className="relative inline-flex items-center space-x-2 rounded-r-md border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-400 hover:bg-neutral-700 hover:text-neutral-100 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={addUrl}
            className="flex-1 inline-flex items-center justify-center rounded-md border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 transition-all cursor-pointer"
          >
            <span className="mr-2">+</span> Add URL
          </button>
          <button
            onClick={generateLink}
            disabled={urls.every((url) => url.trim() === '')}
            className="flex-1 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            Generate Link
          </button>
        </div>

        {generatedLink && (
          <div className="mt-8 space-y-4 rounded-xl border border-neutral-800 bg-neutral-950/50 p-4">
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-neutral-500">Your shareable link</label>
              <div className="flex -space-x-px rounded-md shadow-sm">
                <input
                  type="text"
                  value={generatedLink}
                  readOnly
                  className="block w-full rounded-none rounded-l-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs font-mono text-blue-400 focus:outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className={`relative inline-flex items-center justify-center rounded-r-md min-w-[75px] text-center px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${
                    copied ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-neutral-800">
          <h2 className="text-white text-sm font-semibold mb-3">How it works</h2>
          <ol className="text-neutral-500 text-xs space-y-2">
            <li>1. Enter the URLs you want to open</li>
            <li>2. Generate and copy your link</li>
            <li>3. Share it anywhere</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
