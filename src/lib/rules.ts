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
