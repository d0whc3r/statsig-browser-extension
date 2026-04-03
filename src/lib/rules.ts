const CONDITION_LABELS: Record<string, string> = {
  app_version: 'App Version',
  browser_name: 'Browser Name',
  browser_version: 'Browser Version',
  country: 'Country',
  custom: 'Custom',
  custom_field: 'Custom Field',
  device_model: 'Device Model',
  email: 'Email',
  environment_tier: 'Environment Tier',
  ip_address: 'IP Address',
  os_name: 'OS Name',
  os_version: 'OS Version',
  public: 'Public',
  time: 'Time',
  user_agent: 'User Agent',
  user_id: 'User ID',
}

export const getConditionLabel = (type: string) => {
  const label = CONDITION_LABELS[type]
  if (label) {
    return label
  }

  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// oxlint-disable-next-line max-statements
export const formatConditionDetails = (condition: {
  type: string
  operator?: string
  targetValue?: unknown
  field?: string
  customID?: string
}) => {
  const parts = [getConditionLabel(condition.type)]

  if (condition.field) {
    parts.push(`(${condition.field})`)
  }

  if (condition.operator) {
    parts.push(condition.operator)
  }

  if (condition.targetValue !== undefined && condition.targetValue !== null) {
    if (Array.isArray(condition.targetValue)) {
      parts.push(`[${condition.targetValue.join(', ')}]`)
    } else if (typeof condition.targetValue === 'object') {
      parts.push(JSON.stringify(condition.targetValue))
    } else {
      // oxlint-disable-next-line typescript/no-explicit-any, typescript/no-unsafe-type-assertion, typescript/no-unsafe-argument
      parts.push(condition.targetValue as any)
    }
  }

  return parts.join(' ')
}
