import type { Meta, StoryObj } from '@storybook/react'
import { CalendarPrayerWidget } from './calendar-prayer'

const meta: Meta<typeof CalendarPrayerWidget> = {
  title: 'Widgets/Calendar Prayer',
  component: CalendarPrayerWidget,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof CalendarPrayerWidget>

export const Default: Story = {}

export const Compact: Story = {
  args: {
    compact: true,
  },
}
