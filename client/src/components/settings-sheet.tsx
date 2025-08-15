"use client"

import { useEffect, useState } from "react"

import type { SlideElement } from "@/lib/types"
import { useTranslations } from "@/providers/translations-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

import { AnimationSettings } from "./animation-settings"

interface SettingsSheetProps {
  isOpen: boolean
  onClose: () => void
  element: SlideElement | null
  onUpdate: (updatedElement: SlideElement) => void
}

export function SettingsSheet({
  isOpen,
  onClose,
  element,
  onUpdate,
}: SettingsSheetProps) {
  const { t } = useTranslations()
  const [localElement, setLocalElement] = useState<SlideElement | null>(null)

  useEffect(() => {
    setLocalElement(element)
  }, [element])

  const handleInputChange = (key: string, value: string | number) => {
    if (!localElement) return

    const updatedElement = { ...localElement, [key]: value }
    setLocalElement(updatedElement)
    onUpdate(updatedElement)
  }

  const handleStyleChange = (key: string, value: string) => {
    if (!localElement) return

    const updatedElement = {
      ...localElement,
      style: { ...localElement.style, [key]: value },
    }
    setLocalElement(updatedElement)
    onUpdate(updatedElement)
  }

  const handleContentChange = (key: string, value: string) => {
    if (!localElement) return

    const updatedElement = {
      ...localElement,
      content: { ...localElement.content, [key]: value },
    }
    setLocalElement(updatedElement)
    onUpdate(updatedElement)
  }

  // Helpers for RGBA color editing
  const hexToRgba = (hex: string, alpha: number): string => {
    let h = hex.replace('#', '')
    if (h.length === 3) h = h.split('').map((c) => c + c).join('')
    const n = Number.parseInt(h, 16)
    const r = (n >> 16) & 255
    const g = (n >> 8) & 255
    const b = n & 255
    const a = Math.min(Math.max(alpha, 0), 1)
    return `rgba(${r}, ${g}, ${b}, ${a})`
  }

  const parseRgba = (value: string): { hex: string; alpha: number } => {
    if (!value) return { hex: '#000000', alpha: 1 }
    if (value.startsWith('#')) return { hex: value, alpha: 1 }
    const m = value.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*(\d*\.?\d+))?\)/i)
    if (!m) return { hex: '#000000', alpha: 1 }
    const toHex = (v: number) => v.toString(16).padStart(2, '0')
    const r = Number(m[1]); const g = Number(m[2]); const b = Number(m[3]); const a = m[4] ? Number(m[4]) : 1
    return { hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`, alpha: a }
  }

  if (!localElement) return null

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent side="left" className="w-[360px] sm:w-[420px]">
        <SheetHeader>
          <SheetTitle>Element Settings</SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="properties" className="mt-4 w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="animation">Animation</TabsTrigger>
          </TabsList>
          <TabsContent value="properties" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="x">X Position</Label>
              <Input
                id="x"
                type="number"
                value={Number.isFinite(localElement.x as any) ? localElement.x : 0}
                onChange={(e) =>
                  handleInputChange("x", Number.parseInt(e.target.value))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="y">Y Position</Label>
              <Input
                id="y"
                type="number"
                value={Number.isFinite(localElement.y as any) ? localElement.y : 0}
                onChange={(e) =>
                  handleInputChange("y", Number.parseInt(e.target.value))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="number"
                value={Number.isFinite(localElement.width as any) ? localElement.width : 0}
                onChange={(e) =>
                  handleInputChange("width", Number.parseInt(e.target.value))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="number"
                value={Number.isFinite(localElement.height as any) ? localElement.height : 0}
                onChange={(e) =>
                  handleInputChange("height", Number.parseInt(e.target.value))
                }
              />
            </div>
            {localElement.type === "text" && (
              <div className="space-y-2">
                <Label htmlFor="text">Text Content</Label>
                <Input
                  id="text"
                  value={localElement.content?.text ?? ""}
                  onChange={(e) => handleContentChange("text", e.target.value)}
                />
              </div>
            )}
          </TabsContent>
          <TabsContent value="style" className="space-y-4">
            {localElement.type === "text" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Input
                    id="fontSize"
                    value={localElement.style?.fontSize ?? "16px"}
                    onChange={(e) =>
                      handleStyleChange("fontSize", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fontFamily">Font Family</Label>
                  <Input
                    id="fontFamily"
                    value={localElement.style?.fontFamily ?? "Inter, system-ui"}
                    onChange={(e) => handleStyleChange("fontFamily", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    type="color"
                    value={localElement.style?.color ?? "#000000"}
                    onChange={(e) => handleStyleChange("color", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fontWeight">Font Weight</Label>
                  <Input
                    id="fontWeight"
                    value={localElement.style?.fontWeight ?? "400"}
                    onChange={(e) =>
                      handleStyleChange("fontWeight", e.target.value)
                    }
                  />
                </div>
              </>
            )}

            {(localElement.type === "rectangle" || localElement.type === "oval") && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fillType">Fill Type</Label>
                  <Select
                    value={typeof localElement.fill === 'string' ? 'color' : (localElement.fill as any)?.type === 'image' ? 'image' : 'gradient'}
                    onValueChange={(val) => {
                      if (val === 'color') {
                        onUpdate({ ...localElement, fill: typeof localElement.fill === 'string' ? localElement.fill : '#000000' })
                      } else if (val === 'gradient') {
                        onUpdate({ ...localElement, fill: { type: 'linear', colors: ['#000000', '#ffffff'], stops: [0, 1], angle: 45 } as any })
                      } else if (val === 'image') {
                        onUpdate({ ...localElement, fill: { type: 'image', src: '', fit: 'cover' } as any })
                      }
                    }}
                  >
                    <SelectTrigger id="fillType" className="h-8 text-xs">
                      <SelectValue placeholder="Select fill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="color" className="text-xs">Color</SelectItem>
                      <SelectItem value="gradient" className="text-xs">Gradient</SelectItem>
                      <SelectItem value="image" className="text-xs">Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Color fill */}
                {typeof localElement.fill === 'string' && (
                  <div className="space-y-2">
                    <Label htmlFor="fillColor">Fill Color (supports rgba)</Label>
                    <Input id="fillColor" value={localElement.fill} onChange={(e) => onUpdate({ ...localElement, fill: e.target.value })} />
                  </div>
                )}

                {/* Gradient fill with RGBA editors */}
                {typeof localElement.fill === 'object' && (localElement.fill as any) && (localElement.fill as any).type !== 'image' && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="gradType">Gradient Type</Label>
                      <Select
                        value={(localElement.fill as any).type || 'linear'}
                        onValueChange={(t) => {
                          const next = { ...(localElement.fill as any), type: t }
                          if (t === 'radial') delete (next as any).angle
                          onUpdate({ ...localElement, fill: next as any })
                        }}
                      >
                        <SelectTrigger id="gradType" className="h-8 text-xs">
                          <SelectValue placeholder="Gradient type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="linear" className="text-xs">Linear</SelectItem>
                          <SelectItem value="radial" className="text-xs">Radial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Colors</Label>
                      <div className="space-y-2">
                        {(((localElement.fill as any).colors) || ['rgba(0,0,0,1)']).map((c: string, idx: number) => {
                          const { hex, alpha } = parseRgba(c)
                          return (
                            <div key={idx} className="flex items-center gap-2">
                              <Input type="color" className="h-8 w-10 p-1" value={hex}
                                onChange={(e) => {
                                  const colors = [ ...(((localElement.fill as any).colors) || []) ]
                                  colors[idx] = hexToRgba(e.target.value, alpha)
                                  const stops = colors.map((_, i) => (colors.length === 1 ? 1 : i / (colors.length - 1)))
                                  onUpdate({ ...localElement, fill: { ...(localElement.fill as any), colors, stops } as any })
                                }}
                              />
                              <div className="flex items-center gap-1">
                                <Label className="text-xs">Opacity</Label>
                                <Input type="number" className="w-16 h-8 text-xs" min={0} max={100} value={Math.round(alpha * 100)}
                                  onChange={(e) => {
                                    const a = Math.min(Math.max(Number(e.target.value) || 0, 0), 100) / 100
                                    const colors = [ ...(((localElement.fill as any).colors) || []) ]
                                    colors[idx] = hexToRgba(hex, a)
                                    const stops = colors.map((_, i) => (colors.length === 1 ? 1 : i / (colors.length - 1)))
                                    onUpdate({ ...localElement, fill: { ...(localElement.fill as any), colors, stops } as any })
                                  }}
                                />
                              </div>
                              <Button variant="ghost" size="sm" className="h-8 px-2"
                                onClick={() => {
                                  const colors = [ ...(((localElement.fill as any).colors) || []) ]
                                  if (colors.length <= 1) return
                                  colors.splice(idx, 1)
                                  const stops = colors.map((_, i) => (colors.length === 1 ? 1 : i / (colors.length - 1)))
                                  onUpdate({ ...localElement, fill: { ...(localElement.fill as any), colors, stops } as any })
                                }}
                              >−</Button>
                            </div>
                          )
                        })}
                      </div>
                      <Button variant="outline" size="sm" className="h-8"
                        onClick={() => {
                          const colors = [ ...(((localElement.fill as any).colors) || []) ]
                          const last = colors[colors.length - 1] || 'rgba(0,0,0,1)'
                          colors.push(last)
                          const stops = colors.map((_, i) => (colors.length === 1 ? 1 : i / (colors.length - 1)))
                          onUpdate({ ...localElement, fill: { ...(localElement.fill as any), colors, stops } as any })
                        }}
                      >{t('editor.settings.addColor')}</Button>
                    </div>

                    {((localElement.fill as any).type === 'linear') && (
                      <>
                        <Label htmlFor="gradAngle">Angle</Label>
                        <Input id="gradAngle" type="number" value={(localElement.fill as any).angle ?? 45}
                          onChange={(e) => onUpdate({ ...localElement, fill: { ...(localElement.fill as any), angle: Number(e.target.value) || 0 } })}
                        />
                      </>
                    )}
                  </div>
                )}

                {/* Image fill */}
                {typeof localElement.fill === 'object' && (localElement.fill as any)?.type === 'image' && (
                  <div className="space-y-2">
                    <Label htmlFor="fillImage">Image URL</Label>
                    <Input id="fillImage" value={(localElement.fill as any).src ?? ''}
                      onChange={(e) => onUpdate({ ...localElement, fill: { ...(localElement.fill as any), src: e.target.value } as any })}
                    />
                  </div>
                )}

                {/* Stroke */}
                <div className="space-y-2">
                  <Label htmlFor="strokeWidth">Stroke Width</Label>
                  <Input id="strokeWidth" type="number" value={localElement.stroke?.width ?? 0}
                    onChange={(e) => onUpdate({ ...localElement, stroke: { ...(localElement.stroke || {}), width: Number(e.target.value) || 0 } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="strokeColor">Stroke Color (supports rgba)</Label>
                  <Input id="strokeColor" value={localElement.stroke?.color ?? '#000000'}
                    onChange={(e) => onUpdate({ ...localElement, stroke: { ...(localElement.stroke || {}), color: e.target.value } })}
                  />
                </div>
              </>
            )}

            {/* 3D */}
            <>
              <div className="space-y-2">
                <Label htmlFor="rotateX">Rotate X (deg)</Label>
                <Input id="rotateX" type="number" value={localElement.transform3d?.rotateX ?? 0}
                  onChange={(e) => onUpdate({ ...localElement, transform3d: { ...(localElement.transform3d || {}), rotateX: Number(e.target.value) || 0 } })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rotateY">Rotate Y (deg)</Label>
                <Input id="rotateY" type="number" value={localElement.transform3d?.rotateY ?? 0}
                  onChange={(e) => onUpdate({ ...localElement, transform3d: { ...(localElement.transform3d || {}), rotateY: Number(e.target.value) || 0 } })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rotateZ">Rotate Z (deg)</Label>
                <Input id="rotateZ" type="number" value={localElement.transform3d?.rotateZ ?? 0}
                  onChange={(e) => onUpdate({ ...localElement, transform3d: { ...(localElement.transform3d || {}), rotateZ: Number(e.target.value) || 0 } })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="translateZ">Translate Z (px)</Label>
                <Input id="translateZ" type="number" value={localElement.transform3d?.translateZ ?? 0}
                  onChange={(e) => onUpdate({ ...localElement, transform3d: { ...(localElement.transform3d || {}), translateZ: Number(e.target.value) || 0 } })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="perspective">Perspective (px)</Label>
                <Input id="perspective" type="number" value={localElement.transform3d?.perspective ?? 0}
                  onChange={(e) => onUpdate({ ...localElement, transform3d: { ...(localElement.transform3d || {}), perspective: Number(e.target.value) || 0 } })}
                />
              </div>
            </>
          </TabsContent>
          <TabsContent value="animation">
            <AnimationSettings
              element={localElement}
              onUpdate={(updatedElement) => {
                setLocalElement(updatedElement)
                onUpdate(updatedElement)
              }}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
