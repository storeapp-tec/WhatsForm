export type TextSize = 'title' | 'subtitle' | 'normal' | 'small';

export interface TextBlock {
  id: string;
  kind: 'text';
  content: string;
  size: TextSize;
  isBold: boolean;
  isItalic: boolean;
  align?: 'left' | 'center' | 'right';
  includeInWhatsApp: boolean;
}

export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'date' 
  | 'select' 
  | 'radio' 
  | 'checkbox' 
  | 'phone' 
  | 'email';

export interface FieldBlock {
  id: string;
  kind: 'field';
  fieldType: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: string[]; // for select, radio, checkbox
  isBoldLabel?: boolean;
  isItalicLabel?: boolean;
}

export type FormItem = TextBlock | FieldBlock;

export interface CountryInfo {
  name: string;
  code: string;
  flag: string;
  maskExample: string;
}

export interface FormConfig {
  id: string;
  title: string;
  description?: string;
  countryCode: string;
  targetPhone: string;
  introMessage: string;
  outroMessage: string;
  items: FormItem[];
  themeColor?: string;
}

export type FormValues = Record<string, string | string[]>;
