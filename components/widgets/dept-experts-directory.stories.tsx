import type { Meta, StoryObj } from '@storybook/react'
import { DeptExpertsDirectoryWidget } from './dept-experts-directory'

const meta: Meta<typeof DeptExpertsDirectoryWidget> = {
  title: 'Widgets/Department Experts Directory',
  component: DeptExpertsDirectoryWidget,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DeptExpertsDirectoryWidget>

export const Default: Story = {}

export const Grid: Story = {
  args: {
    layout: 'grid',
  },
}
