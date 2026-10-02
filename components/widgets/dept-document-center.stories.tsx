import type { Meta, StoryObj } from '@storybook/react'
import { DeptDocumentCenterWidget } from './dept-document-center'

const meta: Meta<typeof DeptDocumentCenterWidget> = {
  title: 'Widgets/Department Document Center',
  component: DeptDocumentCenterWidget,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DeptDocumentCenterWidget>

export const Default: Story = {}

export const WithFilters: Story = {
  args: {
    showFilters: true,
  },
}
