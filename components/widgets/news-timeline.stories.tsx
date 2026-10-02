import type { Meta, StoryObj } from '@storybook/react'
import { NewsTimelineWidget } from './news-timeline'

const meta: Meta<typeof NewsTimelineWidget> = {
  title: 'Widgets/News Timeline',
  component: NewsTimelineWidget,
  tags: ['autodocs'],
  argTypes: {
    limit: {
      control: 'number',
      description: 'Number of news items to display',
    },
  },
}

export default meta
type Story = StoryObj<typeof NewsTimelineWidget>

export const Default: Story = {
  args: {
    limit: 5,
  },
}

export const FewItems: Story = {
  args: {
    limit: 3,
  },
}

export const ManyItems: Story = {
  args: {
    limit: 10,
  },
}
