import { apiClient } from '@/lib/api-client'

export type FormFieldType =
  'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'toggle'

export interface FormField {
  id: string
  type: FormFieldType
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

export interface FormDefinition {
  id: string
  slug: string
  title: { fa?: string } | string
  description: { fa?: string } | string | null
  formType: 'DATA_COLLECTION' | 'AFISH_STRUCTURED'
  jsonSchema: { fields?: FormField[] }
  uiSchema: Record<string, unknown>
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED'
  createdAt: string
  updatedAt: string
  _count?: { submissions: number }
}

export interface FormSubmission {
  id: string
  data: Record<string, unknown>
  status: string
  submittedAt: string | null
  createdAt: string
  submitter: { id: string; name: string | { fa?: string } }
  formDefinition: { id: string; title: string | { fa?: string } }
}

export const formText = (value: string | { fa?: string } | null | undefined) =>
  typeof value === 'string' ? value : (value?.fa ?? '')

export const formsApi = {
  list: () => apiClient.get<FormDefinition[]>('/forms'),
  getActive: (slug: string) => apiClient.get<FormDefinition>(`/forms/public/${slug}`),
  create: (input: {
    title: string
    description?: string
    formType?: 'DATA_COLLECTION' | 'AFISH_STRUCTURED'
    fields: FormField[]
  }) => apiClient.post<FormDefinition>('/forms', input),
  activate: (id: string) => apiClient.post<FormDefinition>(`/forms/${id}/activate`),
  submit: (slug: string, data: Record<string, unknown>) =>
    apiClient.post<{ id: string }>(`/forms/${slug}/submissions`, { data }),
  listSubmissions: (id: string, status?: string) =>
    apiClient.get<FormSubmission[]>(`/forms/${id}/submissions`, {
      params: { status },
    }),
}
