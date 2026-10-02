import type { Meta, StoryObj } from '@storybook/react'
import { DeptAnnouncementsWidget } from './dept-announcements'

const meta: Meta<typeof DeptAnnouncementsWidget> = {
  title: 'Widgets/Department Announcements',
  component: DeptAnnouncementsWidget,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DeptAnnouncementsWidget>

export const Default: Story = {}

export const MultipleTabs: Story = {
  args: {
    showAllTabs: true,
  },
}
