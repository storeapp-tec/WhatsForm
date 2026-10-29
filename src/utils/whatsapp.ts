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

  // Form title
  if (config.title?.trim()) {
    parts.push(`📋 *${config.title.trim().toUpperCase()}*`);
  }

  // Optional Intro Message
  if (config.introMessage?.trim()) {
    parts.push(config.introMessage.trim());
  }

  parts.push('────────────────────');

  // Loop through form items
  for (const item of config.items) {
    if (item.kind === 'text') {
      // If user enabled including this text block in WhatsApp message
      if (item.includeInWhatsApp && item.content.trim()) {
        let formatted = item.content.trim();
        if (item.isBold && item.isItalic) {
          formatted = `*_ ${formatted} _*`;
        } else if (item.isBold) {
          formatted = `*${formatted}*`;
        } else if (item.isItalic) {
          formatted = `_${formatted}_`;
        }
        
        if (item.size === 'title') {
          parts.push(`\n📌 *${item.content.trim().toUpperCase()}*`);
        } else if (item.size === 'subtitle') {
          parts.push(`\n▫️ ${formatted}`);
        } else {
          parts.push(formatted);
        }
      }
    } else if (item.kind === 'field') {
      const val = values[item.id];
      const hasValue = Array.isArray(val) ? val.length > 0 : (val && val.trim() !== '');

      let labelText = item.label.trim() || 'Pregunta';
      if (item.isBoldLabel) {
        labelText = `*${labelText}*`;
      } else {
        labelText = `*${labelText}:*`;
      }

      if (!hasValue) {
        // If empty in preview, show placeholder indicator
        parts.push(`${labelText} _(Sin responder)_`);
      } else if (Array.isArray(val)) {
        // Multi-select checkbox
        parts.push(`${labelText}`);
        for (const v of val) {
          parts.push(`  ✓ ${v}`);
        }
      } else {
        // Standard text, textarea, single select, date, etc.
        const stringVal = String(val).trim();
        if (item.fieldType === 'textarea' && stringVal.includes('\n')) {
          parts.push(`${labelText}\n> ${stringVal.replace(/\n/g, '\n> ')}`);
        } else {
          parts.push(`${labelText} ${stringVal}`);
        }
      }
    }
  }

  parts.push('────────────────────');

  // Optional Outro Message
  if (config.outroMessage?.trim()) {
    parts.push(`_${config.outroMessage.trim()}_`);
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
