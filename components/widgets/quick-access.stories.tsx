import type { Meta, StoryObj } from '@storybook/react'
import { QuickAccessWidget } from './quick-access'

const meta: Meta<typeof QuickAccessWidget> = {
  title: 'Widgets/Quick Access',
  component: QuickAccessWidget,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof QuickAccessWidget>

export const Default: Story = {}

export const CustomLinks: Story = {
  args: {
    customLinks: [
      { icon: '📧', label: 'ایمیل', url: 'https://mail.irib.ir' },
      { icon: '📅', label: 'تقویم', url: 'https://calendar.irib.ir' },
    ],
  },
}
