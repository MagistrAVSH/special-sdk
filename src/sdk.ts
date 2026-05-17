import { version } from '../package.json';
import { createAdLogger } from './lib/ads/ad-logger';
import { initMonetagAds, showMonetagAd } from './lib/ads/monetag';
import type {
  InitializeOptions,
  RequestAdOptions,
  SpecialSDK as SpecialSDKType,
} from './types';

const adLog = createAdLogger('SDK');

let monetagShowAdFnName: string | null = null;
let initialized = false;

const SpecialSDK: SpecialSDKType = {
  version: process.env.version,
  onAdStart: null,
  onAdEnd: null,

  initialize: async (options?: InitializeOptions) => {
    adLog.group('SDK & Ads Initialization');
    adLog.time('fullInit');
    adLog.info('Starting initialization', { version: process.env.version });

    await new Promise<void>((resolve) => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', () => resolve());
      }
    });

    const ads = options?.ads;

    if (ads?.monetag) {
      try {
        monetagShowAdFnName = await initMonetagAds(ads.monetag);
        initialized = monetagShowAdFnName !== null;
      } catch (err) {
        adLog.error('Monetag failed to initialize', err);
      }
    } else {
      adLog.error('No monetag config provided');
    }

    adLog.timeEnd('fullInit');
    adLog.info('Ads network fully initialized', { initialized });
    adLog.groupEnd();
  },

  requestRewardAd: async (options: RequestAdOptions = {}) => {
    adLog.group('requestRewardAd');
    adLog.time('requestRewardAd');
    SpecialSDK.onAdStart?.();

    try {
      adLog.info('Dispatching reward ad request', {
        placementId: options.placementId,
      });

      const ymid = '0';
      const result = await showMonetagAd<boolean>(
        monetagShowAdFnName,
        ymid,
        options.placementId,
      );

      adLog.timeEnd('requestRewardAd');
      adLog.info('Reward ad request completed', { result });
      adLog.groupEnd();
      SpecialSDK.onAdEnd?.(result);
      return result;
    } catch (error) {
      adLog.timeEnd('requestRewardAd');
      adLog.error('Error in requestRewardAd', error);
      adLog.groupEnd();
      SpecialSDK.onAdEnd?.(false);
      return false;
    }
  },
};

const globalObj = (typeof window !== 'undefined'
  ? window
  : typeof globalThis !== 'undefined'
    ? globalThis
    : ({} as any)) as any;

globalObj.SpecialSDK = SpecialSDK;

export default SpecialSDK;

export { SpecialSDK };

export type {
  AdsConfig,
  InitializeOptions,
  RequestAdOptions,
  SpecialSDK as SpecialSDKType,
} from './types';
