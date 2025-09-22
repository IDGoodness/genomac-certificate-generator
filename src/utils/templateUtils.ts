export const TEMPLATE_DESIGNS = {
  '1': { name: 'Classic Blue', description: 'Traditional formal design with blue color scheme' },
  '2': { name: 'Genomac Institute', description: 'Official Genomac Institute template with institutional branding and signatures' },
} as const;

export type TemplateId = keyof typeof TEMPLATE_DESIGNS;

export function getTemplateName(templateId: string): string {
  return TEMPLATE_DESIGNS[templateId as TemplateId]?.name || `Template ${templateId}`;
}

export function getTemplateDescription(templateId: string): string {
  return TEMPLATE_DESIGNS[templateId as TemplateId]?.description || 'Unknown template';
}
