import type { Meta, StoryObj } from '@storybook/react'
import { WeatherWidget } from './weather'

const meta: Meta<typeof WeatherWidget> = {
  title: 'Widgets/Weather',
  component: WeatherWidget,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof WeatherWidget>

export const Default: Story = {}

export const CustomCity: Story = {
  args: {
    city: 'Tehran',
  },
}
