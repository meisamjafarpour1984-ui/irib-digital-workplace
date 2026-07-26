import type { Preview } from '@storybook/react'
import '../app/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#fafcfd' },
        { name: 'dark', value: '#0b1220' },
      ],
    },
    rtl: true,
  },
  globalTypes: {
    direction: {
      description: 'Text direction',
      toolbar: {
        title: 'Direction',
        items: [
          { value: 'rtl', title: 'RTL' },
          { value: 'ltr', title: 'LTR' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    direction: 'rtl',
  },
  decorators: [
    (Story, context) => {
      const direction = context.globals.direction || 'rtl'
      return (
        <div dir={direction} lang="fa" style={{ padding: '1rem' }}>
          <Story />
        </div>
      )
    },
  ],
}

export default preview
