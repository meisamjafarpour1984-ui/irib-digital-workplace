import type { Meta, StoryObj } from '@storybook/react'
import { DeptFormsCenterWidget } from './dept-forms-center'

const meta: Meta<typeof DeptFormsCenterWidget> = {
  title: 'Widgets/Department Forms Center',
  component: DeptFormsCenterWidget,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DeptFormsCenterWidget>

export const Default: Story = {}

export const Compact: Story = {
  args: {
    compact: true,
  },
}
