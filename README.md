# SpecialSDK

Minimal SDK exposing only `requestRewardAd()` — powered by Monetag.

No auth. No backend API calls. No overlay, no profile, no storage. Just rewarded ads.

---

## Installation

### Option A — Build it locally

```bash
# from this directory
npm install
npm run build
```

Outputs:
- `dist/esm/sdk.mjs` + `sdk.d.ts` — ESM build for bundlers (Vite, Webpack, Rollup, esbuild)
- `dist/umd/sdk.umd.js` — UMD build for plain `<script>` tags (exposes `window.SpecialSDK`)

### Option B — Add it as a local dependency

In your game's `package.json`:

```json
{
  "dependencies": {
    "special-sdk": "file:../SpecialSDK"
  }
}
```

Then:

```bash
npm install
```

### Option C — Use the prebuilt UMD bundle

Copy `dist/umd/sdk.umd.js` into your game's static assets and load it before your game code:

```html
<script src="/path/to/sdk.umd.js"></script>
<script>
  // window.SpecialSDK is now available
</script>
```

---

## Initialization

The SDK has exactly **one** ad provider: **Monetag**. You initialize it once at startup with the raw `<script>` HTML Monetag gives you in their dashboard.

### ESM / bundled

```ts
import SpecialSDK from 'special-sdk';

await SpecialSDK.initialize({
  ads: {
    monetag:
      '<script src="//niephuwo.net/sdk.js" data-zone="1234567" data-sdk="show_1234567"></script>',
  },
});
```

### UMD / global

```html
<script src="/sdk.umd.js"></script>
<script>
  (async () => {
    await SpecialSDK.initialize({
      ads: {
        monetag:
          '<script src="//niephuwo.net/sdk.js" data-zone="1234567" data-sdk="show_1234567"></script>',
      },
    });
  })();
</script>
```

### What you pass

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ads.monetag` | `string` | yes | The **raw HTML `<script>` tag** from your Monetag publisher dashboard. The SDK reads `data-sdk` to discover the global show-ad function name (e.g. `show_1234567`). |

The SDK will:
1. Wait for `document` to finish loading.
2. Inject the Monetag `<script>` into `<head>`.
3. Poll up to 5s for the `window[<data-sdk>]` function to appear.

If init fails, `requestRewardAd()` will just return `false`.

---

## Showing a rewarded ad

```ts
const watched = await SpecialSDK.requestRewardAd();

if (watched) {
  // Give the user their reward
} else {
  // Ad was skipped, blocked, or failed — no reward
}
```

### Optional parameters

```ts
const watched = await SpecialSDK.requestRewardAd({
  placementId: 'level_end',   // tagged in Monetag's requestVar as `special-level_end`
  onStart: () => {            // called before the ad starts playing
    pauseGame();
  },
});
```

### Optional global lifecycle hooks

Set once after init; they fire on every `requestRewardAd()` call.

```ts
SpecialSDK.onAdStart = () => {
  pauseAudio();
};

SpecialSDK.onAdEnd = (success: boolean) => {
  resumeAudio();
  console.log('Ad result:', success);
};
```

---

## Full example

```ts
import SpecialSDK from 'special-sdk';

async function bootstrap() {
  await SpecialSDK.initialize({
    ads: {
      monetag:
        '<script src="//niephuwo.net/sdk.js" data-zone="1234567" data-sdk="show_1234567"></script>',
    },
  });

  SpecialSDK.onAdStart = () => pauseGame();
  SpecialSDK.onAdEnd = () => resumeGame();

  document.getElementById('claim-bonus')?.addEventListener('click', async () => {
    const watched = await SpecialSDK.requestRewardAd({ placementId: 'daily_bonus' });
    if (watched) {
      grantBonus();
    } else {
      showToast('Ad unavailable, try again later');
    }
  });
}

bootstrap();
```

---

## API reference

```ts
interface SpecialSDK {
  version: string;
  onAdStart: (() => void) | null;
  onAdEnd: ((result: boolean) => void) | null;
  initialize: (options?: InitializeOptions) => Promise<void>;
  requestRewardAd: (options?: RequestAdOptions) => Promise<boolean>;
}

interface InitializeOptions {
  ads?: AdsConfig;
}

interface AdsConfig {
  monetag: string; // raw <script> HTML from Monetag dashboard
}

interface RequestAdOptions {
  onStart?: () => void;
  placementId?: string;
}
```

---

## Development

```bash
npm install          # install deps
npm run typecheck    # tsc --noEmit
npm run dev          # vite dev server
npm run build:esm    # build ESM bundle only
npm run build:umd    # build UMD bundle only
npm run build        # build both
```

The dev server reads `PORT` from `.env` (defaults to `3000`).
