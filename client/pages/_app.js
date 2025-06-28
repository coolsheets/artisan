import '../styles/globals.css';
import '../styles/accessibility.css';
import Head from 'next/head';
import { useEffect } from 'react';

// Custom App component to apply global styles
function MyApp({ Component, pageProps }) {
  // Add accessibility features on mount
  useEffect(() => {
    // Add skip to main content link for keyboard users
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.prepend(skipLink);
    
    // Create screen reader announcer
    const srAnnouncer = document.createElement('div');
    srAnnouncer.id = 'sr-announcer';
    srAnnouncer.setAttribute('aria-live', 'polite');
    srAnnouncer.setAttribute('aria-atomic', 'true');
    srAnnouncer.className = 'sr-only';
    document.body.appendChild(srAnnouncer);
  }, []);

  return (
    <>
      <Head>
        <title>Artisan - AI Prompt Generator</title>
        <meta name="description" content="Optimize AI prompts for maximum effectiveness and minimal token usage." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#0d6efd" />
      </Head>
      <main id="main-content">
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default MyApp;
