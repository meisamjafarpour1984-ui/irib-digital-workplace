import type { Meta, StoryObj } from '@storybook/react'
import { HeroMediaWidget } from './hero-media'

const meta: Meta<typeof HeroMediaWidget> = {
  title: 'Widgets/Hero Media',
  component: HeroMediaWidget,
  tags: ['autodocs'],
  argTypes: {
    slides: {
      control: 'object',
      description: 'Array of media slides with title, subtitle, and media URL',
    },
  },
}

export default meta
type Story = StoryObj<typeof HeroMediaWidget>

export const Default: Story = {
  args: {
    slides: [
      {
        title: { fa: 'خوش آمدید', en: 'Welcome' },
        subtitle: {
          fa: 'درگاه جامع صدا و سیمای آذربایجان شرقی',
          en: 'IRIB East Azerbaijan Gateway',
        },
        media: '/images/hero-1.jpg',
        type: 'image',
      },
      {
        title: { fa: 'خدمات نوین', en: 'Modern Services' },
        subtitle: {
          fa: 'دسترسی سریع به تمام خدمات سازمانی',
          en: 'Quick access to all organizational services',
        },
        media: '/images/hero-2.jpg',
        type: 'image',
      },
    ],
  },
}

export const SingleSlide: Story = {
  args: {
    slides: [
      {
        title: { fa: 'خوش آمدید', en: 'Welcome' },
        subtitle: {
          fa: 'درگاه جامع صدا و سیمای آذربایجان شرقی',
          en: 'IRIB East Azerbaijan Gateway',
        },
        media: '/images/hero-1.jpg',
        type: 'image',
      },
    ],
  },
}

export const WithVideo: Story = {
  args: {
    slides: [
      {
        title: { fa: 'رویداد سال', en: 'Annual Event' },
        subtitle: { fa: 'جشنواره فناوری و نوآوری', en: 'Technology and Innovation Festival' },
        media: '/videos/hero-video.mp4',
        type: 'video',
      },
    ],
  },
}
