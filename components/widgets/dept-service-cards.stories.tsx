import type { Meta, StoryObj } from '@storybook/react'
import { DeptServiceCardsWidget } from './dept-service-cards'

const meta: Meta<typeof DeptServiceCardsWidget> = {
  title: 'Widgets/Department Service Cards',
  component: DeptServiceCardsWidget,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DeptServiceCardsWidget>

export const Default: Story = {}

export const Horizontal: Story = {
  args: {
    layout: 'horizontal',
  },
}
