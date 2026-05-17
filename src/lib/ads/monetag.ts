import { createAdLogger } from './ad-logger';

const log = createAdLogger('Monetag');

export async function initMonetagAds(monetagHtml: string): Promise<string | null> {
  log.group('Initialization');
  log.time('init');

  try {
    const div = document.createElement('div');
    div.innerHTML = monetagHtml;

    const originalScriptTag = div.firstElementChild as HTMLScriptElement | null;
    if (originalScriptTag) {
      const monetagShowAdFnName = originalScriptTag.dataset.sdk || null;

      const newScriptTag = document.createElement('script');

      for (let i = 0; i < originalScriptTag.attributes.length; i++) {
        const attr = originalScriptTag.attributes[i];
        newScriptTag.setAttribute(attr.name, attr.value);
      }

      if (originalScriptTag.text) {
        newScriptTag.text = originalScriptTag.text;
      }

      await new Promise<void>((resolve, reject) => {
        if (!monetagShowAdFnName) {
          const err = new Error('Monetag: ad function name not found in script tag');
          log.error('Ad function name not found in script tag');
          log.timeEnd('init');
          log.groupEnd();
          return reject(err);
        }
        const fnName = monetagShowAdFnName;
        log.info('Ad function name found', { fnName });

        newScriptTag.onload = () => {
          log.info('Script loaded, waiting for function on window...');
          const startTime = Date.now();
          const checkInterval = setInterval(() => {
            if (typeof window[fnName] === 'function') {
              clearInterval(checkInterval);
              log.timeEnd('init');
              log.info('Initialized successfully', { fnName });
              log.groupEnd();
              resolve();
            } else if (Date.now() - startTime > 5000) {
              clearInterval(checkInterval);
              const err = new Error(
                `Monetag: function ${fnName} did not appear on window object within 5 seconds.`,
              );
              log.timeEnd('init');
              log.error('Init timeout — function not found after 5s', { fnName });
              log.groupEnd();
              reject(err);
            }
          }, 100);
        };
        newScriptTag.onerror = (err) => {
          log.timeEnd('init');
          log.error('Script failed to load', err);
          log.groupEnd();
          reject(new Error('Monetag: script failed to load.'));
        };
        document.head.appendChild(newScriptTag);
        log.info('Script appended to head');
      });

      return monetagShowAdFnName;
    }
    log.error('No script tag found in monetag configuration');
    log.timeEnd('init');
    log.groupEnd();
    return null;
  } catch (err) {
    log.error('Failed to initialize', err);
    log.timeEnd('init');
    log.groupEnd();
    return null;
  }
}

export async function showMonetagAd<T extends boolean>(
  monetagShowAdFnName: string | null,
  ymid: string,
  placementId?: string,
): Promise<T> {
  log.group('Showing Ad');
  log.time('show');
  log.info('Starting ad display', { fnName: monetagShowAdFnName, ymid, placementId });

  if (!monetagShowAdFnName) {
    log.error('Ad function name not found');
    log.timeEnd('show');
    log.groupEnd();
    return false as T;
  }

  const monetagAdFn = window[monetagShowAdFnName];
  if (typeof monetagAdFn !== 'function') {
    log.error('Ad function not found on window', { fnName: monetagShowAdFnName });
    log.timeEnd('show');
    log.groupEnd();
    return false as T;
  }

  const requestVar = placementId ? `orbit-${placementId}` : 'orbit';

  return new Promise<T>((resolve) => {
    monetagAdFn({ ymid, requestVar, timeout: 5 })
      .then(() => {
        log.timeEnd('show');
        log.info('Ad watched successfully', { placementId });
        log.groupEnd();
        resolve(true as T);
      })
      .catch((e: unknown) => {
        log.timeEnd('show');
        log.error('Ad failed or was skipped', { error: e, placementId });
        log.groupEnd();
        resolve(false as T);
      });
  });
}
