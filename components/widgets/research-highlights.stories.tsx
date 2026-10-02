import type { Meta, StoryObj } from '@storybook/react'
import { ResearchHighlightsWidget } from './research-highlights'

const meta: Meta<typeof ResearchHighlightsWidget> = {
  title: 'Widgets/Research Highlights',
  component: ResearchHighlightsWidget,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ResearchHighlightsWidget>

export const Default: Story = {}

export const Compact: Story = {
  args: {
    compact: true,
  },
}
