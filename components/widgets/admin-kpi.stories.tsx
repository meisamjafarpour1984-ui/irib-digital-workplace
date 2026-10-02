import type { Meta, StoryObj } from '@storybook/react'
import { AdminKPIWidget } from './admin-kpi'

const meta: Meta<typeof AdminKPIWidget> = {
  title: 'Widgets/Admin KPI',
  component: AdminKPIWidget,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof AdminKPIWidget>

export const Default: Story = {}

export const WithTrend: Story = {
  args: {
    showTrend: true,
  },
}
