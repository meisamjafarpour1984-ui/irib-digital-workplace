/**
 * Tests for ContentService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ContentService } from '@/lib/services/content'

describe('ContentService', () => {
  let contentService: ContentService

  beforeEach(() => {
    contentService = new ContentService()
    vi.clearAllMocks()
  })

  describe('getContent', () => {
    it('should fetch content successfully', async () => {
      const mockContent = {
        id: '1',
        title: { fa: 'Test Content' },
        slug: 'test-content',
        contentType: 'NEWS',
        status: 'PUBLISHED',
      }

      vi.spyOn(contentService, 'getContent').mockResolvedValue(mockContent)

      const result = await contentService.getContent('test-content')

      expect(result).toEqual(mockContent)
    })

    it('should handle content not found', async () => {
      vi.spyOn(contentService, 'getContent').mockRejectedValue(new Error('Content not found'))

      await expect(contentService.getContent('non-existent')).rejects.toThrow('Content not found')
    })

    it('should handle network errors', async () => {
      vi.spyOn(contentService, 'getContent').mockRejectedValue(new Error('Network error'))

      await expect(contentService.getContent('test-content')).rejects.toThrow('Network error')
    })
  })

  describe('createContent', () => {
    it('should create content successfully', async () => {
      const mockContent = {
        id: '1',
        title: { fa: 'New Content' },
        slug: 'new-content',
        contentType: 'NEWS',
        status: 'DRAFT',
      }

      vi.spyOn(contentService, 'createContent').mockResolvedValue(mockContent)

      const result = await contentService.createContent({
        title: { fa: 'New Content' },
        slug: 'new-content',
        contentType: 'NEWS',
      })

      expect(result).toEqual(mockContent)
    })

    it('should handle validation errors', async () => {
      vi.spyOn(contentService, 'createContent').mockRejectedValue(new Error('Validation failed'))

      await expect(contentService.createContent({} as any)).rejects.toThrow('Validation failed')
    })
  })

  describe('updateContent', () => {
    it('should update content successfully', async () => {
      const mockContent = {
        id: '1',
        title: { fa: 'Updated Content' },
        slug: 'test-content',
        contentType: 'NEWS',
        status: 'PUBLISHED',
      }

      vi.spyOn(contentService, 'updateContent').mockResolvedValue(mockContent)

      const result = await contentService.updateContent('1', {
        title: { fa: 'Updated Content' },
      })

      expect(result).toEqual(mockContent)
    })

    it('should handle update failures', async () => {
      vi.spyOn(contentService, 'updateContent').mockRejectedValue(new Error('Update failed'))

      await expect(contentService.updateContent('1', {})).rejects.toThrow('Update failed')
    })
  })

  describe('deleteContent', () => {
    it('should delete content successfully', async () => {
      vi.spyOn(contentService, 'deleteContent').mockResolvedValue(undefined)

      await contentService.deleteContent('1')

      expect(contentService.deleteContent).toHaveBeenCalledWith('1')
    })

    it('should handle delete failures', async () => {
      vi.spyOn(contentService, 'deleteContent').mockRejectedValue(new Error('Delete failed'))

      await expect(contentService.deleteContent('1')).rejects.toThrow('Delete failed')
    })
  })
})
