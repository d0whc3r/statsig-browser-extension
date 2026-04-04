import { formatConditionDetails, getConditionLabel } from './rules'

describe('rules utility', () => {
  describe(getConditionLabel, () => {
    it('should return mapped label for known condition types', () => {
      expect(getConditionLabel('country')).toBe('Country')
      expect(getConditionLabel('user_id')).toBe('User ID')
      expect(getConditionLabel('browser_name')).toBe('Browser Name')
      expect(getConditionLabel('email')).toBe('Email')
      expect(getConditionLabel('ip_address')).toBe('IP Address')
    })

    it('should format unknown types by splitting on underscores and capitalizing', () => {
      expect(getConditionLabel('custom_field_type')).toBe('Custom Field Type')
      expect(getConditionLabel('some_new_condition')).toBe('Some New Condition')
      expect(getConditionLabel('single')).toBe('Single')
    })

    it('should handle empty string', () => {
      expect(getConditionLabel('')).toBe('')
    })
  })

  describe(formatConditionDetails, () => {
    it('should format basic condition with type label', () => {
      const result = formatConditionDetails({
        operator: 'equals',
        targetValue: 'US',
        type: 'country',
      })

      expect(result).toBe('Country equals US')
    })

    it('should include field name when provided', () => {
      const result = formatConditionDetails({
        field: 'custom_attribute',
        operator: 'contains',
        targetValue: 'value',
        type: 'custom',
      })

      expect(result).toBe('Custom (custom_attribute) contains value')
    })

    it('should format array targetValues correctly', () => {
      const result = formatConditionDetails({
        operator: 'any',
        targetValue: ['US', 'CA', 'UK'],
        type: 'country',
      })

      expect(result).toBe('Country any [US, CA, UK]')
    })

    it('should stringify object targetValues', () => {
      const result = formatConditionDetails({
        operator: 'equals',
        targetValue: { max: 65, min: 18 },
        type: 'custom',
      })

      expect(result).toBe('Custom equals {"max":65,"min":18}')
    })

    it('should handle primitive targetValues', () => {
      const numberResult = formatConditionDetails({
        operator: '>',
        targetValue: 42,
        type: 'user_id',
      })
      expect(numberResult).toBe('User ID > 42')

      const boolResult = formatConditionDetails({
        operator: 'is',
        targetValue: true,
        type: 'custom',
      })
      expect(boolResult).toBe('Custom is true')
    })

    it('should omit targetValue when undefined', () => {
      const result = formatConditionDetails({
        operator: 'exists',
        type: 'email',
      })

      expect(result).toBe('Email exists')
    })

    it('should omit targetValue when null', () => {
      const result = formatConditionDetails({
        operator: 'is_null',
        type: 'custom_field',
      })

      expect(result).toBe('Custom Field is_null')
    })

    it('should handle missing operator', () => {
      const result = formatConditionDetails({
        targetValue: 'value',
        type: 'user_id',
      })

      expect(result).toBe('User ID value')
    })

    it('should handle complex condition with all fields', () => {
      const result = formatConditionDetails({
        field: 'age',
        operator: 'between',
        targetValue: [18, 65],
        type: 'custom_field',
      })

      expect(result).toBe('Custom Field (age) between [18, 65]')
    })

    it('should handle customID field', () => {
      const result = formatConditionDetails({
        customID: 'employee_id',
        operator: 'equals',
        targetValue: 'emp_123',
        type: 'user_id',
      })

      expect(result).toBe('User ID equals emp_123')
    })
  })
})
