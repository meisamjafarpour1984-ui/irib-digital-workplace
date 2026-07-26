import { z } from 'zod'

// Content validators
export const contentStatusSchema = z.enum([
  'draft',
  'under_review',
  'approved',
  'published',
  'scheduled',
  'archived',
  'rejected',
  'deleted',
])

export const contentTypeSchema = z.enum([
  'news',
  'announcement',
  'gallery',
  'event',
  'call',
  'video',
  'software',
  'expert',
  'faq',
  'link',
  'form',
  'document',
  'legend',
  'survey',
  'afish',
])

export const createContentSchema = z.object({
  title: z.string().min(1, 'عنوان الزامی است').max(200),
  excerpt: z.string().max(500).optional(),
  body: z.string().optional(),
  contentType: contentTypeSchema,
  scope: z.array(z.string()).min(1, 'حداقل یک حوزه انتخاب کنید'),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  scheduledAt: z.string().datetime().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export const updateContentSchema = createContentSchema.partial()

// Form validators
export const formFieldSchema = z.object({
  id: z.string(),
  type: z.enum([
    'text',
    'textarea',
    'number',
    'date',
    'select',
    'checkbox',
    'toggle',
    'file',
    'table',
  ]),
  label: z.string().min(1),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
      message: z.string().optional(),
    })
    .optional(),
})

export const createFormSchema = z.object({
  title: z.string().min(1, 'عنوان فرم الزامی است'),
  description: z.string().optional(),
  fields: z.array(formFieldSchema).min(1, 'حداقل یک فیلد اضافه کنید'),
  mode: z.enum(['wizard', 'single']).default('single'),
  steps: z
    .array(
      z.object({
        title: z.string(),
        fieldIds: z.array(z.string()),
      })
    )
    .optional(),
})

export const formSubmissionSchema = z.record(z.string(), z.unknown())

// User validators
export const loginSchema = z.object({
  personnelCode: z.string().min(4, 'کد پرسنلی معتبر نیست'),
  mobile: z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر نیست'),
})

export const otpSchema = z.object({
  code: z.string().length(6, 'کد ۶ رقمی وارد کنید'),
})

export const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
})

// Ticket validators
export const createTicketSchema = z.object({
  title: z.string().min(1, 'عنوان الزامی است'),
  description: z.string().min(10, 'توضیحات باید حداقل ۱۰ کاراکتر باشد'),
  category: z.enum(['hardware', 'software', 'network', 'access', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  attachments: z.array(z.string()).optional(),
})

// Broadcast validators
export const broadcastSchema = z.object({
  subject: z.string().min(1, 'موضوع الزامی است'),
  body: z.string().min(1, 'متن پیام الزامی است'),
  audience: z.object({
    type: z.enum(['all', 'department', 'unit', 'role', 'custom']),
    targetIds: z.array(z.string()).optional(),
  }),
  sendVia: z.enum(['in_app', 'push', 'both']).default('in_app'),
  scheduledAt: z.string().datetime().optional(),
})

export type CreateContentInput = z.infer<typeof createContentSchema>
export type UpdateContentInput = z.infer<typeof updateContentSchema>
export type CreateFormInput = z.infer<typeof createFormSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type OTPInput = z.infer<typeof otpSchema>
export type CreateTicketInput = z.infer<typeof createTicketSchema>
export type BroadcastInput = z.infer<typeof broadcastSchema>
