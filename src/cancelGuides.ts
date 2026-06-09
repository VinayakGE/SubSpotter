export interface CancelGuide {
  merchantKey: string; // lowercase match key
  displayName: string;
  steps: string[];
  deepLink: string;
  note?: string;
}

export const CANCEL_GUIDES: CancelGuide[] = [
  {
    merchantKey: 'netflix',
    displayName: 'Netflix',
    steps: [
      'Go to netflix.com and sign in',
      'Click your profile icon (top right)',
      'Select "Account"',
      'Under "Membership & Billing", click "Cancel Membership"',
      'Click "Finish Cancellation"',
    ],
    deepLink: 'https://www.netflix.com/cancelplan',
    note: 'Access continues until end of billing period.',
  },
  {
    merchantKey: 'spotify',
    displayName: 'Spotify',
    steps: [
      'Go to spotify.com/account',
      'Sign in',
      'Click "Change plan"',
      'Scroll down and click "Cancel Premium"',
      'Follow the on-screen confirmation steps',
    ],
    deepLink: 'https://www.spotify.com/account/subscription/',
  },
  {
    merchantKey: 'chatgpt',
    displayName: 'ChatGPT Plus',
    steps: [
      'Go to chat.openai.com and sign in',
      'Click your profile icon (bottom left)',
      'Select "My plan"',
      'Click "Manage my subscription"',
      'Click "Cancel plan" and confirm',
    ],
    deepLink: 'https://chat.openai.com/#pricing',
    note: 'You will retain Plus access until the end of your billing cycle.',
  },
  {
    merchantKey: 'openai',
    displayName: 'OpenAI / ChatGPT Plus',
    steps: [
      'Go to platform.openai.com or chat.openai.com',
      'Click your profile icon',
      'Select "Manage account" or "My plan"',
      'Find subscription settings and click "Cancel"',
    ],
    deepLink: 'https://platform.openai.com/account/billing/overview',
  },
  {
    merchantKey: 'claude',
    displayName: 'Claude Pro',
    steps: [
      'Go to claude.ai and sign in',
      'Click your profile icon (top right)',
      'Select "Billing"',
      'Click "Cancel subscription"',
      'Confirm cancellation',
    ],
    deepLink: 'https://claude.ai/settings/billing',
  },
  {
    merchantKey: 'anthropic',
    displayName: 'Anthropic / Claude Pro',
    steps: [
      'Go to claude.ai and sign in',
      'Navigate to Settings > Billing',
      'Click "Cancel subscription" and confirm',
    ],
    deepLink: 'https://claude.ai/settings/billing',
  },
  {
    merchantKey: 'midjourney',
    displayName: 'Midjourney',
    steps: [
      'Go to midjourney.com and sign in',
      'Click "Manage Sub" in the left sidebar',
      'Click "Cancel Plan"',
      'Choose whether to cancel immediately or at period end',
    ],
    deepLink: 'https://www.midjourney.com/account/',
  },
  {
    merchantKey: 'perplexity',
    displayName: 'Perplexity Pro',
    steps: [
      'Go to perplexity.ai and sign in',
      'Click Settings (gear icon)',
      'Select "Subscription"',
      'Click "Cancel subscription" and confirm',
    ],
    deepLink: 'https://www.perplexity.ai/settings/account',
  },
  {
    merchantKey: 'copilot',
    displayName: 'GitHub Copilot',
    steps: [
      'Go to github.com/settings/copilot',
      'Scroll down to "Copilot subscription"',
      'Click "Cancel Copilot Individual"',
      'Follow the confirmation prompts',
    ],
    deepLink: 'https://github.com/settings/copilot',
  },
  {
    merchantKey: 'cursor',
    displayName: 'Cursor Pro',
    steps: [
      'Go to cursor.com/settings',
      'Sign in to your account',
      'Navigate to the Billing section',
      'Click "Cancel subscription"',
    ],
    deepLink: 'https://www.cursor.com/settings',
  },
  {
    merchantKey: 'amazon prime',
    displayName: 'Amazon Prime',
    steps: [
      'Go to amazon.com and sign in',
      'Hover over "Account & Lists" and click "Account"',
      'Click "Prime Membership"',
      'Click "Manage membership"',
      'Select "End membership"',
    ],
    deepLink: 'https://www.amazon.com/mc',
  },
  {
    merchantKey: 'hulu',
    displayName: 'Hulu',
    steps: [
      'Go to hulu.com and sign in',
      'Click your profile icon (top right)',
      'Select "Account"',
      'Under "Your Subscription", click "Cancel"',
      'Follow the on-screen steps',
    ],
    deepLink: 'https://www.hulu.com/account',
  },
  {
    merchantKey: 'disney',
    displayName: 'Disney+',
    steps: [
      'Go to disneyplus.com and sign in',
      'Click your profile icon',
      'Select "Account"',
      'Under your subscription, click "Cancel Subscription"',
      'Confirm cancellation',
    ],
    deepLink: 'https://www.disneyplus.com/account',
  },
  {
    merchantKey: 'adobe',
    displayName: 'Adobe Creative Cloud',
    steps: [
      'Go to account.adobe.com and sign in',
      'Under "Plans & Products", find your plan',
      'Click "Manage plan" then "Cancel plan"',
      'Select cancellation reason and confirm',
      'Note: early cancellation may incur a fee',
    ],
    deepLink: 'https://account.adobe.com/plans',
    note: 'Early cancellation may incur a fee (50% of remaining contract).',
  },
  {
    merchantKey: 'dropbox',
    displayName: 'Dropbox',
    steps: [
      'Go to dropbox.com and sign in',
      'Click your avatar (top right)',
      'Go to "Settings" > "Plan"',
      'Click "Cancel plan"',
      'Follow the confirmation steps',
    ],
    deepLink: 'https://www.dropbox.com/account/plan',
  },
  {
    merchantKey: 'planet fitness',
    displayName: 'Planet Fitness',
    steps: [
      'Visit your local Planet Fitness club in person',
      'Request a cancellation form at the front desk',
      'OR send a letter via certified mail to your home club',
      'Your membership cancels at the end of the billing period',
    ],
    deepLink: 'https://www.planetfitness.com/gym-memberships',
    note: 'Planet Fitness requires in-person or certified mail cancellation — no online option.',
  },
  {
    merchantKey: 'microsoft 365',
    displayName: 'Microsoft 365',
    steps: [
      'Go to account.microsoft.com and sign in',
      'Select "Services & subscriptions"',
      'Find Microsoft 365 and click "Manage"',
      'Click "Cancel" and follow the steps',
    ],
    deepLink: 'https://account.microsoft.com/services',
  },
  {
    merchantKey: 'apple',
    displayName: 'Apple iCloud+ / Apple One',
    steps: [
      'On iPhone/iPad: go to Settings > [Your Name] > Subscriptions',
      'Tap the subscription you want to cancel',
      'Tap "Cancel Subscription"',
      'On Mac: go to App Store > [Your Name] > Subscriptions',
    ],
    deepLink: 'https://support.apple.com/en-us/HT202039',
  },
  {
    merchantKey: 'linkedin',
    displayName: 'LinkedIn Premium',
    steps: [
      'Go to linkedin.com and sign in',
      'Click "Me" icon > "Premium subscription"',
      'Click "Manage Premium account"',
      'Click "Cancel subscription"',
      'Follow the confirmation steps',
    ],
    deepLink: 'https://www.linkedin.com/premium/manage-premium/',
  },
  {
    merchantKey: 'grammarly',
    displayName: 'Grammarly Premium',
    steps: [
      'Go to grammarly.com and sign in',
      'Click your profile (top right) > "Account"',
      'Scroll to "Subscription" and click "Cancel subscription"',
      'Confirm cancellation',
    ],
    deepLink: 'https://account.grammarly.com/subscription',
  },
  {
    merchantKey: 'duolingo',
    displayName: 'Duolingo Super',
    steps: [
      'Open the Duolingo app',
      'Tap your profile > "Super" or manage subscriptions',
      'OR manage via App Store / Google Play > Subscriptions',
    ],
    deepLink: 'https://www.duolingo.com/settings/plus',
  },
  {
    merchantKey: 'headspace',
    displayName: 'Headspace',
    steps: [
      'Go to headspace.com and sign in',
      'Click your name > "Manage subscription"',
      'Click "Cancel subscription" and follow the steps',
    ],
    deepLink: 'https://www.headspace.com/settings',
  },
  {
    merchantKey: 'calm',
    displayName: 'Calm',
    steps: [
      'Go to calm.com and sign in',
      'Click your profile icon > "Subscription"',
      'Click "Cancel subscription"',
      'Confirm the cancellation',
    ],
    deepLink: 'https://www.calm.com/account',
  },
  {
    merchantKey: 'peloton',
    displayName: 'Peloton',
    steps: [
      'Go to onepeloton.com and sign in',
      'Click your name > "Account Settings"',
      'Under "Membership", click "Cancel membership"',
      'Follow the steps to confirm',
    ],
    deepLink: 'https://www.onepeloton.com/profile/preferences',
  },
  {
    merchantKey: 'lastpass',
    displayName: 'LastPass Premium',
    steps: [
      'Log in to lastpass.com',
      'Click Account Settings in the left nav',
      'Select "Billing"',
      'Click "Cancel Account" or downgrade to free',
    ],
    deepLink: 'https://lastpass.com/account.php',
  },
  {
    merchantKey: 'expressvpn',
    displayName: 'ExpressVPN',
    steps: [
      'Go to expressvpn.com and sign in',
      'Click your email (top right) > "Manage Account"',
      'Scroll to "Subscriptions" and click "Cancel"',
    ],
    deepLink: 'https://www.expressvpn.com/subscriptions',
  },
  {
    merchantKey: 'classmates',
    displayName: 'Classmates.com',
    steps: [
      'Go to classmates.com and sign in',
      'Click "Account Settings"',
      'Select "Manage Membership"',
      'Click "Cancel Membership" and confirm',
    ],
    deepLink: 'https://www.classmates.com/account',
    note: 'This one might be the zombie you forgot about.',
  },
];

/** Look up a cancel guide for a merchant name (case-insensitive partial match) */
export function findCancelGuide(merchant: string): CancelGuide | null {
  const lower = merchant.toLowerCase();
  // Exact or partial match against merchantKey
  const found = CANCEL_GUIDES.find(g => lower.includes(g.merchantKey) || g.merchantKey.includes(lower));
  return found ?? null;
}

/** Get a guide or fall back to a generic guide */
export function getCancelGuide(merchant: string): CancelGuide {
  const found = findCancelGuide(merchant);
  if (found) return found;
  return {
    merchantKey: merchant.toLowerCase(),
    displayName: merchant,
    steps: [
      `Search the web for "${merchant} cancel subscription"`,
      'Find the official website and sign in',
      'Look for Account Settings, Billing, or Subscription section',
      'Click "Cancel" and follow the confirmation steps',
      'Keep the cancellation confirmation email',
    ],
    deepLink: `https://www.google.com/search?q=${encodeURIComponent(merchant + ' cancel subscription')}`,
  };
}
