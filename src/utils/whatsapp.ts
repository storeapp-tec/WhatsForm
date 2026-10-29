import { CountryInfo, FormConfig, FormItem, FormValues } from '../types/form';

export const POPULAR_COUNTRIES: CountryInfo[] = [
  { name: 'México', code: '52', flag: '🇲🇽', maskExample: '55 1234 5678' },
  { name: 'Colombia', code: '57', flag: '🇨🇴', maskExample: '300 123 4567' },
  { name: 'España', code: '34', flag: '🇪🇸', maskExample: '612 345 678' },
  { name: 'Argentina', code: '54', flag: '🇦🇷', maskExample: '9 11 1234 5678' },
  { name: 'Estados Unidos / Canadá', code: '1', flag: '🇺🇸', maskExample: '415 555 2671' },
  { name: 'Chile', code: '56', flag: '🇨🇱', maskExample: '9 1234 5678' },
  { name: 'Perú', code: '51', flag: '🇵🇪', maskExample: '912 345 678' },
  { name: 'Ecuador', code: '593', flag: '🇪🇨', maskExample: '99 123 4567' },
  { name: 'Guatemala', code: '502', flag: '🇬🇹', maskExample: '5123 4567' },
  { name: 'Costa Rica', code: '506', flag: '🇨🇷', maskExample: '8123 4567' },
  { name: 'Panamá', code: '507', flag: '🇵🇦', maskExample: '6123 4567' },
  { name: 'Uruguay', code: '598', flag: '🇺🇾', maskExample: '99 123 456' },
  { name: 'República Dominicana', code: '1809', flag: '🇩🇴', maskExample: '809 123 4567' },
  { name: 'Bolivia', code: '591', flag: '🇧🇴', maskExample: '71234567' },
  { name: 'Venezuela', code: '58', flag: '🇻🇪', maskExample: '412 1234567' },
];

/**
 * Clean phone number removing spaces, dashes, brackets
 */
export function sanitizePhoneNumber(countryCode: string, rawPhone: string): string {
  const digitsOnly = rawPhone.replace(/\D/g, '');
  const cleanCountry = countryCode.replace(/\D/g, '');
  
  if (!digitsOnly) return '';
  
  // If digits already start with the country code, avoid duplicating
  if (digitsOnly.startsWith(cleanCountry)) {
    return digitsOnly;
  }
  return `${cleanCountry}${digitsOnly}`;
}

/**
 * Builds the WhatsApp message text formatted with WhatsApp native markdown:
 * *bold*, _italics_, lists, and clean structure.
 */
export function generateWhatsAppMessage(
  config: FormConfig,
  values: FormValues = {}
): string {
  const parts: string[] = [];

  // Form title (Single clean header)
  if (config.title?.trim()) {
    parts.push(`📋 *${config.title.trim().toUpperCase()}*`);
  }

  // Only add intro if distinct and not repeating the title
  if (
    config.introMessage?.trim() &&
    !config.introMessage.includes('DATOS') &&
    !config.introMessage.includes('REGISTRO')
  ) {
    parts.push(config.introMessage.trim());
  }

  // Loop through form items
  for (const item of config.items) {
    if (item.kind === 'text') {
      if (item.includeInWhatsApp && item.content.trim()) {
        if (item.size === 'title') {
          parts.push(`\n📌 *${item.content.trim().toUpperCase()}*`);
        } else if (item.size === 'subtitle') {
          parts.push(`\n▫️ *${item.content.trim()}*`);
        } else {
          parts.push(item.content.trim());
        }
      }
    } else if (item.kind === 'field') {
      const val = values[item.id];
      const hasValue = Array.isArray(val) ? val.length > 0 : (val && String(val).trim() !== '');

      let labelText = item.label.trim() || 'Pregunta';
      if (!labelText.endsWith(':')) {
        labelText = `${labelText}:`;
      }
      const boldLabel = `*${labelText}*`;

      if (!hasValue) {
        parts.push(`\n${boldLabel}\n_(Sin responder)_`);
      } else if (Array.isArray(val)) {
        // Multi-select checkbox
        parts.push(`\n${boldLabel}`);
        for (const v of val) {
          parts.push(`  ✓ ${v}`);
        }
      } else {
        let stringVal = String(val).trim();
        // If field is Semestre, guarantee it outputs ONLY the number (e.g. "3")
        if (item.label.toLowerCase().includes('semestre') || item.id.includes('semestre')) {
          stringVal = stringVal.replace(/^(semestre\s*)/i, '').trim();
        }

        if (item.fieldType === 'textarea' && stringVal.includes('\n')) {
          parts.push(`\n${boldLabel}\n> ${stringVal.replace(/\n/g, '\n> ')}`);
        } else {
          parts.push(`\n${boldLabel}\n${stringVal}`);
        }
      }
    }
  }

  // Privacy consent confirmation
  parts.push(`\n✓ Aceptó aviso de privacidad (fines de atención y cobranza escolar).`);

  // Outro Message without trailing separator lines
  if (config.outroMessage?.trim()) {
    parts.push(`\n_${config.outroMessage.trim()}_`);
  }

  return parts.join('\n');
}

/**
 * Creates the direct wa.me link with encoded message
 */
export function buildWhatsAppUrl(
  config: FormConfig,
  values: FormValues = {}
): string {
  const fullPhone = sanitizePhoneNumber(config.countryCode, config.targetPhone);
  const message = generateWhatsAppMessage(config, values);
  const encodedText = encodeURIComponent(message);
  
  if (fullPhone) {
    return `https://wa.me/${fullPhone}?text=${encodedText}`;
  }
  // If no phone is set, wa.me text-only opens WhatsApp and lets user choose recipient
  return `https://wa.me/?text=${encodedText}`;
}

/**
 * Validates whether all required fields have non-empty values
 */
export function validateFormResponses(
  items: FormItem[],
  values: FormValues
): { isValid: boolean; missingFieldIds: string[]; missingLabels: string[] } {
  const missingFieldIds: string[] = [];
  const missingLabels: string[] = [];

  for (const item of items) {
    if (item.kind === 'field' && item.required) {
      const val = values[item.id];
      const isEmpty = !val || (Array.isArray(val) ? val.length === 0 : val.trim() === '');
      if (isEmpty) {
        missingFieldIds.push(item.id);
        missingLabels.push(item.label || 'Campo obligatorio');
      }
    }
  }

  return {
    isValid: missingFieldIds.length === 0,
    missingFieldIds,
    missingLabels,
  };
}

/**
 * Serializes form config to URL safe string
 */
export function encodeFormToHash(config: FormConfig): string {
  try {
    const jsonStr = JSON.stringify(config);
    return encodeURIComponent(btoa(unescape(encodeURIComponent(jsonStr))));
  } catch (e) {
    console.error('Error encoding form', e);
    return '';
  }
}

/**
 * Deserializes form config from URL safe string
 */
export function decodeFormFromHash(hash: string): FormConfig | null {
  try {
    const decoded = decodeURIComponent(hash);
    const jsonStr = decodeURIComponent(escape(atob(decoded)));
    const parsed = JSON.parse(jsonStr);
    if (parsed && Array.isArray(parsed.items)) {
      return parsed as FormConfig;
    }
    return null;
  } catch (e) {
    console.error('Error decoding form', e);
    return null;
  }
}
