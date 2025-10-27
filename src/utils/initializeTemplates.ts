import { Template, DEFAULT_TEMPLATES } from '@/types/template';

export const initializeDefaultTemplates = (): void => {
  const storedTemplates = localStorage.getItem('templates');
  
  if (!storedTemplates) {
    const userTemplates: Template[] = DEFAULT_TEMPLATES.map((template, index) => ({
      ...template,
      id: `template-${index + 1}`,
      userId: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    
    localStorage.setItem('templates', JSON.stringify(userTemplates));
  }
};
