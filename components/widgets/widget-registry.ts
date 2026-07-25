import type { WidgetManifest, WidgetComponent } from './types'

interface WidgetRegistryEntry {
  manifest: WidgetManifest
  Component: WidgetComponent
}

class WidgetRegistry {
  private widgets = new Map<string, WidgetRegistryEntry>()

  register(manifest: WidgetManifest, Component: WidgetComponent) {
    this.widgets.set(manifest.id, { manifest, Component })
  }

  get(id: string): WidgetRegistryEntry | undefined {
    return this.widgets.get(id)
  }

  getManifest(id: string): WidgetManifest | undefined {
    return this.widgets.get(id)?.manifest
  }

  getComponent(id: string): WidgetComponent | undefined {
    return this.widgets.get(id)?.Component
  }

  getAll(): WidgetRegistryEntry[] {
    return Array.from(this.widgets.values())
  }

  getByCategory(category: string): WidgetRegistryEntry[] {
    return this.getAll().filter(e => e.manifest.category === category)
  }

  getPublicWidgets(): WidgetRegistryEntry[] {
    return this.getAll().filter(e => !e.manifest.permissions || e.manifest.permissions.length === 0)
  }

  getWidgetsForPermissions(userPermissions: string[]): WidgetRegistryEntry[] {
    return this.getAll().filter(e => {
      if (!e.manifest.permissions || e.manifest.permissions.length === 0) return true
      return e.manifest.permissions.some(p => userPermissions.includes(p) || userPermissions.includes('*'))
    })
  }
}

export const widgetRegistry = new WidgetRegistry()
