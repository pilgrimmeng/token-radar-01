export interface ProtocolEvidence {
  label: string;
  status: string;
  sources: string[];
  steps: string[];
}

export const EVIDENCE_DATE = '2026-11-18';

const museReview = 'https://github.com/pilgrimmeng/token-radar-01/issues/1#issuecomment-6969724713';
const gptReview = 'https://github.com/pilgrimmeng/token-radar-01/issues/1#issuecomment-6969856436';

/** Product evidence is independent of the snapshot-based valuation and candidate selection. */
export const PROTOCOL_EVIDENCE: Readonly<Record<string, ProtocolEvidence | undefined>> = {
  'steakhouse-financial': {
    label: 'Vault shares',
    status: "STEAKUSDC is a vault share. No verified Steakhouse governance token was identified.",
    sources: ["https://morpho.org/", museReview],
    steps: [
      "Compare the Steakhouse USDC vault on Morpho and confirm the vault and network before using USDC.",
      "Check live vault fees, liquidity and withdrawal conditions. Minimum and settlement time are unverified.",
      'Check the dated evidence and current product disclosures before relying on these terms.',
    ],
  },
  'gauntlet': {
    label: 'Vault shares',
    status: "gtUSDa is a vault share. No verified Gauntlet governance token was identified.",
    sources: ["https://www.gauntlet.xyz/gauntlet-strategies/gtusda", gptReview],
    steps: [
      "Gauntlet USD Alpha accepts USDC on Base through the Gauntlet App, including for individual users.",
      "The product FAQ says redemption requests can occasionally take up to 12 hours. Check the live fee and slippage quote. Minimum and KYC terms are unverified.",
      'Check the dated evidence and current product disclosures before relying on these terms.',
    ],
  },
  'veda': {
    label: 'Vault shares / points',
    status: "Veda vault shares are product receipts. Veda Points do not establish an airdrop.",
    sources: ["https://www.veda.tech/", museReview],
    steps: [
      "Use the documentation for the specific Veda-powered vault or partner, such as ether.fi Liquid, to identify its deposit asset and share.",
      "Confirm the partner vault's fees, eligibility, minimum and redemption queue. Terms vary by product.",
      'Check the dated evidence and current product disclosures before relying on these terms.',
    ],
  },
  'usdd': {
    label: 'USDD issued',
    status: "USDD is an issued stablecoin. sUSDD is a separate savings product.",
    sources: ["https://app.usdd.io/eth", museReview],
    steps: [
      "Compare buying USDD with minting it on Ethereum using ETH or WBTC collateral. Read the savings terms separately if considering sUSDD.",
      "Check collateral and redemption conditions for the chosen route. Official sUSDD fees, minimum, eligibility and settlement are unverified.",
      'Check the dated evidence and current product disclosures before relying on these terms.',
    ],
  },
  'upshift': {
    label: 'Vault shares / points',
    status: "upUSDC is a vault share. Upshift Points Season 2 was documented, with no confirmed airdrop.",
    sources: ["https://app.upshift.finance/points", museReview],
    steps: [
      "Review the specific Upshift vault and its share and asset pair in the app.",
      "Check the vault's ordinary redemption window and live instant-exit quote. Fees, minimum and eligibility vary by vault.",
      'Check the dated evidence and current product disclosures before relying on these terms.',
    ],
  },
  'nonce-capital': {
    label: 'Governance unverified',
    status: "No verified Nonce Capital governance token was identified. Product shares depend on the vault.",
    sources: [museReview],
    steps: [
      "Identify a named Nonce-curated vault on its host platform and confirm the curator and deposit asset in the listing.",
      "Review access, fees, minimum and redemption on that platform. A universal retail route and uniform terms are unverified.",
      'Check the dated evidence and current product disclosures before relying on these terms.',
    ],
  },
  'onre': {
    label: 'ONyc issued',
    status: "ONyc is an issued investment token. A separate ONRE token remains unconfirmed. Open Access points do not establish an airdrop.",
    sources: ["https://app.onre.finance/", museReview],
    steps: [
      "Compare Open Access minting, which lists no onboarding or minimum and excludes the US and sanctioned jurisdictions, with the compliance-gated institutional route.",
      "Open Access exits via secondary markets or supported integrations. Institutional direct redemption settles at quarter-end NAV with 30 days' notice. Fees are unverified.",
      'Check the dated evidence and current product disclosures before relying on these terms.',
    ],
  },
  'rockawayx': {
    label: 'Vault shares',
    status: "RockawayX vault shares represent product positions. No verified protocol governance token was identified.",
    sources: [museReview],
    steps: [
      "Inspect the specific RockawayX vault, such as rxUSDCp or rxUSDCy, and confirm the accepted asset on the host platform.",
      "The reviewed performance fees are 0% for rxUSDCp and 5% for rxUSDCy. Other fees, eligibility, minimum and redemption depend on the product.",
      'Check the dated evidence and current product disclosures before relying on these terms.',
    ],
  },
  'bittensor-dtao': {
    label: 'TAO / subnet alpha',
    status: "TAO is issued. Dynamic TAO uses separate subnet alpha tokens and AMM pools.",
    sources: ["https://www.bittensor.com/docs/guides/staking", museReview],
    steps: [
      "Review subnet selection, the validator take and the TAO-to-alpha price impact before considering a stake.",
      "Ordinary unstaking has no unbonding period. Some operations require at least 0.002 TAO. Validator take is capped at 18%. Swap cost and route eligibility are unverified.",
      'Check the dated evidence and current product disclosures before relying on these terms.',
    ],
  },
  'opentrade': {
    label: 'Product claims',
    status: "OpenTrade product claims represent lending positions. No verified OpenTrade governance token was identified.",
    sources: ["https://www.opentrade.io/", museReview],
    steps: [
      "Identify the OpenTrade-powered yield product and check whether its distribution partner serves your jurisdiction.",
      "Review who holds the position, what it invests in, the partner's fee schedule, minimum and settlement. These terms depend on the route.",
      'Check the dated evidence and current product disclosures before relying on these terms.',
    ],
  },
  'symbiotic': {
    label: 'Points documented',
    status: "Symbiotic Points Season 2 was documented, with no confirmed airdrop. Vault claims depend on the specific deposit.",
    sources: ["https://app.symbiotic.fi/", museReview],
    steps: [
      "Identify a vault and accepted collateral in the Symbiotic app. Review its operator and slashing exposure.",
      "Check fees, minimum, eligibility and the vault's withdrawal epoch. Point accrual and redemption conditions depend on the vault.",
      'Check the dated evidence and current product disclosures before relying on these terms.',
    ],
  },
  'plume-vaults': {
    label: 'PLUME / vault receipts',
    status: "PLUME is the issued chain token. Nest vaults issue individual receipts such as nOPAL and nBASIS.",
    sources: ["https://app.rwa.xyz/", museReview],
    steps: [
      "Inspect the exact Nest vault. The reviewed nOPAL listing specifies a 1 USDC minimum and no KYC for that route.",
      "The reviewed nOPAL listing shows zero management, performance, subscription and redemption fees and instant redemption. Network costs and terms for other vaults are unverified.",
      'Check the dated evidence and current product disclosures before relying on these terms.',
    ],
  },
  'hyperithm': {
    label: 'mHYPER issued',
    status: "mHYPER is a Midas-issued investment token for a Hyperithm-managed strategy. No verified Hyperithm governance token was identified.",
    sources: ["https://blog.midas.app/ledger-officially-integrates-midas-products-mtbill-mhyper-are-now-live-on-ledger-wallet/", gptReview],
    steps: [
      "Read the mHYPER product disclosures and identify the specific issuance, secondary-market or redemption route.",
      "Management, performance and standard redemption charges remain unverified. Confirm eligibility, minimum, liquidity and settlement for the chosen route.",
      'Check the dated evidence and current product disclosures before relying on these terms.',
    ],
  },
  'k3-capital': {
    label: 'Governance unverified',
    status: "No public K3 governance token was identified. Vault shares depend on the partner product.",
    sources: [museReview],
    steps: [
      "Identify the K3-curated product and confirm the network and accepted asset in the partner's own listing.",
      "K3's FAQ reports no protocol-level lockup and gas paid by the user. Check product-specific fees, minimum, eligibility and redemption separately.",
      'Check the dated evidence and current product disclosures before relying on these terms.',
    ],
  },
  'hive-protocol': {
    label: 'BTC staking / B2',
    status: "This record is B² Hive BTC staking, associated with the issued B2 token and B2 rewards.",
    sources: ["https://defillama.com/protocol/hive-protocol", "https://docs.bsquared.network/b2_tokenomics", gptReview],
    steps: [
      "Confirm that the listing points to the B² Network Hive BTC route. Use the published tokenomics to review the incentive disclosure.",
      "Current access, BTC-specific fees, minimum, eligibility, lock and withdrawal terms are unverified. Treat the route as research-only until confirmed.",
      'Check the dated evidence and current product disclosures before relying on these terms.',
    ],
  },
  'lagoon': {
    label: 'Vault shares',
    status: "Lagoon vault shares are product receipts. No verified Lagoon governance token was identified.",
    sources: [museReview],
    steps: [
      "Choose a named Lagoon vault and read its underlying strategy, actual fees and settlement process.",
      "The documented ceilings are 10% annual management, 50% performance above the high-water mark, 2% each for subscription and redemption, and 20% instant-exit haircut. Actual terms vary by vault.",
      'Check the dated evidence and current product disclosures before relying on these terms.',
    ],
  },
  'clearstar': {
    label: 'Vault shares',
    status: "A Clearstar-curated vault share represents that vault. No verified Clearstar governance token was identified.",
    sources: [museReview],
    steps: [
      "Locate the exact Clearstar-curated vault on its host platform and verify the curator and accepted asset.",
      "Check the host's fees, minimum, availability and withdrawal liquidity. A universal retail route and uniform terms are unverified.",
      'Check the dated evidence and current product disclosures before relying on these terms.',
    ],
  },
  'r25': {
    label: 'rcUSD issued',
    status: "rcUSD is an issued dollar-targeted stablecoin. It is separate from governance-token status.",
    sources: ["https://defillama.com/protocol/r25", museReview],
    steps: [
      "Review rcUSD subscription and redemption or a specifically named R25 vault in the official app.",
      "The reviewed listing does not publish fees or settlement time. Confirm eligibility, minimum, redemption and peg risk for the selected route.",
      'Check the dated evidence and current product disclosures before relying on these terms.',
    ],
  },
  'lightning-network': {
    label: 'BTC payment channels',
    status: "Lightning uses BTC in payment channels and has no separate token-farming route.",
    sources: [museReview],
    steps: [
      "Use a Lightning wallet for payments or review the requirements for operating a node.",
      "Check routing fees, channel liquidity and backup or closure procedures. There is no airdrop eligibility or required holding period.",
      'Check the dated evidence and current product disclosures before relying on these terms.',
    ],
  },
  'b14g': {
    label: 'DUALCORE issued',
    status: "DUALCORE was issued and had stopped trading on tracked venues at review. The 2026-10-31 staking-contract incident involved approximately 97 million CORE.",
    sources: ["https://app.b14g.xyz/", museReview],
    steps: [
      "Review the incident and the status of the individual product. The app lists dualCORE and self-custodial staking with points that do not establish a payout.",
      "Current operational status, fees, minimum, eligibility and exit timing are unverified. Keep this route research-only until the incident and withdrawals are resolved.",
      'Check the dated evidence and current product disclosures before relying on these terms.',
    ],
  },
};
