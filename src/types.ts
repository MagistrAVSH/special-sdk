export interface RequestAdOptions {
  onStart?: () => void;
  placementId?: string;
}

export interface AdsConfig {
  monetag: string;
}

export interface InitializeOptions {
  ads?: AdsConfig;
}

export interface SpecialSDK {
  version: string;
  onAdStart: (() => void) | null;
  onAdEnd: ((result: boolean) => void) | null;
  initialize: (options?: InitializeOptions) => Promise<void>;
  requestRewardAd: (options?: RequestAdOptions) => Promise<boolean>;
}
