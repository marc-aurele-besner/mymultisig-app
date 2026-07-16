import React from 'react'

import useAdvancedFeatures, {
  FEATURE_TIMELOCK,
  FEATURE_GUARD,
  FEATURE_ALLOWLIST,
  FEATURE_ALLOWANCE,
  FEATURE_MODULE
} from '../../hooks/useAdvancedFeatures'

interface AdvancedFeaturesPanelProps {
  multiSigAddress: `0x${string}`
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const formatDuration = (seconds: bigint) => {
  if (seconds >= 86400n) {
    const days = Number(seconds / 86400n)
    return `${days} day${days === 1 ? '' : 's'}`
  }
  if (seconds >= 3600n) return `${Number(seconds / 3600n)} h`
  return `${Number(seconds)} s`
}

// Read-only overview of the 0.5.0 advanced surface (advancedFeaturesEnabled
// bitmask + per-feature details). Renders nothing on wallets without it;
// configuration happens through the admin actions above the panel.
const AdvancedFeaturesPanel: React.FC<AdvancedFeaturesPanelProps> = ({ multiSigAddress }) => {
  const {
    supportsAdvanced,
    featuresBitmask,
    timelockDelay,
    guard,
    allowedTargetsEnabled,
    sensitiveValueThreshold,
    modules
  } = useAdvancedFeatures(multiSigAddress)

  if (!supportsAdvanced) return null

  const features: { label: string; bit: number; detail: React.ReactNode }[] = [
    {
      label: 'Timelock',
      bit: FEATURE_TIMELOCK,
      detail:
        timelockDelay != null && timelockDelay > 0n ? (
          <>
            Sensitive calls wait {formatDuration(timelockDelay)}
            {sensitiveValueThreshold != null && sensitiveValueThreshold > 0n
              ? `; transfers of ${sensitiveValueThreshold.toString()} wei or more count as sensitive`
              : ''}
            .
          </>
        ) : (
          'No delay configured — every call executes immediately.'
        )
    },
    {
      label: 'Transaction guard',
      bit: FEATURE_GUARD,
      detail:
        guard != null && guard.toLowerCase() !== ZERO_ADDRESS ? (
          <span className='break-all font-mono'>{guard}</span>
        ) : (
          'No guard contract set.'
        )
    },
    {
      label: 'Target allowlist',
      bit: FEATURE_ALLOWLIST,
      detail: allowedTargetsEnabled
        ? 'On — the wallet only calls allowed targets (including inside batches and module calls).'
        : 'Off — it turns on with the first allowed target.'
    },
    {
      label: 'Spending allowances',
      bit: FEATURE_ALLOWANCE,
      detail:
        (featuresBitmask & FEATURE_ALLOWANCE) !== 0
          ? 'At least one owner has a daily single-signer spending cap.'
          : 'No owner has a daily spending cap.'
    },
    {
      label: 'Modules',
      bit: FEATURE_MODULE,
      detail:
        modules.length > 0 ? (
          <span className='flex flex-col gap-1'>
            {modules.map((module) => (
              <span key={module} className='break-all font-mono'>
                {module}
              </span>
            ))}
          </span>
        ) : (
          'No modules enabled. Modules act for the wallet without owner signatures.'
        )
    }
  ]

  return (
    <div className='flex w-full flex-col gap-4 rounded-lg border border-border p-4'>
      <div>
        <h3 className='text-xl font-bold text-foreground'>Advanced features</h3>
        <p className='text-sm text-muted-foreground'>
          Optional 0.5.0 protections, all off by default. Configure them through the administration actions above —
          each change is itself a multisig transaction.
        </p>
      </div>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
        {features.map((feature) => {
          const enabled = (featuresBitmask & feature.bit) !== 0
          return (
            <div key={feature.label} className='flex flex-col gap-1 rounded-lg border border-border p-3'>
              <div className='flex items-center justify-between gap-2'>
                <span className='text-sm font-semibold text-foreground'>{feature.label}</span>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    enabled ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {enabled ? 'Enabled' : 'Off'}
                </span>
              </div>
              <span className='text-xs text-muted-foreground'>{feature.detail}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AdvancedFeaturesPanel
