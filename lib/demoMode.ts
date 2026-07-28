/**
 * Demo mode is OFF by default for production.
 * Set NEXT_PUBLIC_SITE_DEMO_MODE=true only for local mock demos.
 */
export const SITE_DEMO_MODE = process.env.NEXT_PUBLIC_SITE_DEMO_MODE === 'true';

export const DEMO_NOTICE =
  'Sandbox mode is on — some actions may be simulated. Turn off NEXT_PUBLIC_SITE_DEMO_MODE for production.';

export const DEMO_NOTICE_SHORT = 'Sandbox mode — simulated actions may apply';

export const DEMO_FICTIONAL_CONTENT_NOTICE =
  'When sandbox mode is enabled, sample content may be fictional. Live mode uses real user listings only.';
