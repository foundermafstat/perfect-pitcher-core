"use client"

import { useEffect, useState } from "react"

import type { SlideElement } from "@/lib/types"
import { useTranslations } from "@/providers/translations-context"
import { customFonts, googleFonts } from "@/lib/fonts"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Select, 
  SelectContent, 
  SelectGroup,
  SelectItem, 
  SelectLabel,
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
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
          <TabsContent value="properties" className="space-y-6 px-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Position</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="space-y-2">
                    <Label htmlFor="x" className="text-xs text-muted-foreground">X Position</Label>
              <Input
                id="x"
                type="number"
                value={Number.isFinite(localElement.x as any) ? localElement.x : 0}
                onChange={(e) =>
                  handleInputChange("x", Number.parseInt(e.target.value))
                }
                      className="w-full"
              />
            </div>
            <div className="space-y-2">
                    <Label htmlFor="y" className="text-xs text-muted-foreground">Y Position</Label>
              <Input
                id="y"
                type="number"
                value={Number.isFinite(localElement.y as any) ? localElement.y : 0}
                onChange={(e) =>
                  handleInputChange("y", Number.parseInt(e.target.value))
                }
                      className="w-full"
              />
            </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Size</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="space-y-2">
                    <Label htmlFor="width" className="text-xs text-muted-foreground">Width</Label>
              <Input
                id="width"
                type="number"
                      min="1"
                value={Number.isFinite(localElement.width as any) ? localElement.width : 0}
                onChange={(e) =>
                  handleInputChange("width", Number.parseInt(e.target.value))
                }
                      className="w-full"
              />
            </div>
            <div className="space-y-2">
                    <Label htmlFor="height" className="text-xs text-muted-foreground">Height</Label>
              <Input
                id="height"
                type="number"
                      min="1"
                value={Number.isFinite(localElement.height as any) ? localElement.height : 0}
                onChange={(e) =>
                  handleInputChange("height", Number.parseInt(e.target.value))
                }
                      className="w-full"
              />
                  </div>
                </div>
              </div>
            </div>
            {localElement.type === "text" && (
              <div className="space-y-3">
                <Label htmlFor="text" className="text-sm font-medium">Text Content</Label>
                <Input
                  id="text"
                  value={localElement.content?.text ?? ""}
                  onChange={(e) => handleContentChange("text", e.target.value)}
                  placeholder="Enter text content..."
                  className="w-full"
                />
              </div>
            )}
          </TabsContent>
          <TabsContent value="style" className="space-y-6 px-4">
            {localElement.type === "text" && (
              <>
                <div className="space-y-3">
                  <Label htmlFor="fontSize" className="text-sm font-medium">Font Size</Label>
                  <Input
                    id="fontSize"
                    type="number"
                    min="8"
                    max="200"
                    value={parseInt(localElement.style?.fontSize?.replace('px', '') ?? "16")}
                    onChange={(e) =>
                      handleStyleChange("fontSize", `${e.target.value}px`)
                    }
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="fontFamily" className="text-sm font-medium">Font Family</Label>
                  <Select
                    value={localElement.style?.fontFamily ?? "Inter"}
                    onValueChange={(value) => handleStyleChange("fontFamily", value)}
                  >
                    <SelectTrigger 
                    id="fontFamily"
                      className="w-full" 
                      style={{ fontFamily: localElement.style?.fontFamily ?? "Inter" }}
                    >
                      <SelectValue placeholder="Select a font" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      <SelectGroup>
                        <SelectLabel>System Fonts</SelectLabel>
                        <SelectItem value="Arial" style={{ fontFamily: "Arial" }}>
                          <span style={{ fontFamily: "Arial" }}>Arial</span>
                        </SelectItem>
                        <SelectItem value="Helvetica" style={{ fontFamily: "Helvetica" }}>
                          <span style={{ fontFamily: "Helvetica" }}>Helvetica</span>
                        </SelectItem>
                        <SelectItem value="Times New Roman" style={{ fontFamily: "Times New Roman" }}>
                          <span style={{ fontFamily: "Times New Roman" }}>Times New Roman</span>
                        </SelectItem>
                        <SelectItem value="Georgia" style={{ fontFamily: "Georgia" }}>
                          <span style={{ fontFamily: "Georgia" }}>Georgia</span>
                        </SelectItem>
                        <SelectItem value="Verdana" style={{ fontFamily: "Verdana" }}>
                          <span style={{ fontFamily: "Verdana" }}>Verdana</span>
                        </SelectItem>
                        <SelectItem value="Courier New" style={{ fontFamily: "Courier New" }}>
                          <span style={{ fontFamily: "Courier New" }}>Courier New</span>
                        </SelectItem>
                        <SelectItem value="Trebuchet MS" style={{ fontFamily: "Trebuchet MS" }}>
                          <span style={{ fontFamily: "Trebuchet MS" }}>Trebuchet MS</span>
                        </SelectItem>
                        <SelectItem value="Tahoma" style={{ fontFamily: "Tahoma" }}>
                          <span style={{ fontFamily: "Tahoma" }}>Tahoma</span>
                        </SelectItem>
                        <SelectItem value="Impact" style={{ fontFamily: "Impact" }}>
                          <span style={{ fontFamily: "Impact" }}>Impact</span>
                        </SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Google Fonts</SelectLabel>
                        {googleFonts.map((font) => (
                          <SelectItem key={font.name} value={font.name} style={{ fontFamily: font.name }}>
                            <span style={{ fontFamily: font.name }}>{font.name}</span>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Custom Fonts</SelectLabel>
                        {customFonts.map((font) => (
                          <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                            <span style={{ fontFamily: font }}>{font}</span>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="color" className="text-sm font-medium">Color</Label>
                  <Input
                    id="color"
                    type="color"
                    value={localElement.style?.color ?? "#000000"}
                    onChange={(e) => handleStyleChange("color", e.target.value)}
                    className="w-full h-12"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="fontWeight" className="text-sm font-medium">Font Weight</Label>
                  <Select
                    value={localElement.style?.fontWeight ?? "400"}
                    onValueChange={(value) => handleStyleChange("fontWeight", value)}
                  >
                    <SelectTrigger id="fontWeight" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="300">Light (300)</SelectItem>
                      <SelectItem value="400">Normal (400)</SelectItem>
                      <SelectItem value="500">Medium (500)</SelectItem>
                      <SelectItem value="600">Semi Bold (600)</SelectItem>
                      <SelectItem value="700">Bold (700)</SelectItem>
                      <SelectItem value="800">Extra Bold (800)</SelectItem>
                      <SelectItem value="900">Black (900)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {(localElement.type === "rectangle" || localElement.type === "oval") && (
              <>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Background</Label>
                    <div className="space-y-3 mt-2">
                      <div>
                        <Label htmlFor="fillType" className="text-xs text-muted-foreground">Fill Type</Label>
                        <Select
                          value={typeof localElement.fill === 'string' ? 'color' : (localElement.fill as any)?.type === 'image' ? 'image' : 'gradient'}
                          onValueChange={(val) => {
                            const updatedElement = { ...localElement }
                            if (val === 'color') {
                              updatedElement.fill = typeof localElement.fill === 'string' ? localElement.fill : '#000000'
                            } else if (val === 'gradient') {
                              updatedElement.fill = { type: 'linear', colors: ['rgba(0,0,0,1)', 'rgba(255,255,255,0.5)'], stops: [0, 1], angle: 45 }
                            } else if (val === 'image') {
                              updatedElement.fill = { type: 'image', src: '', fit: 'cover' }
                            }
                            setLocalElement(updatedElement)
                            onUpdate(updatedElement)
                          }}
                        >
                          <SelectTrigger id="fillType" className="w-full mt-1">
                            <SelectValue placeholder="Select background type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="color">Solid Color</SelectItem>
                            <SelectItem value="gradient">Gradient</SelectItem>
                            <SelectItem value="image">Image</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Color fill */}
                      {typeof localElement.fill === 'string' && (
                        <div>
                          <Label htmlFor="fillColor" className="text-xs text-muted-foreground">Background Color</Label>
                          <div className="flex gap-2 items-center mt-1">
                            <Input 
                              id="fillColor" 
                              type="color"
                              value={localElement.fill.startsWith('#') ? localElement.fill : '#000000'}
                              onChange={(e) => {
                                const updatedElement = { ...localElement, fill: e.target.value }
                                setLocalElement(updatedElement)
                                onUpdate(updatedElement)
                              }}
                              className="h-10 flex-1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const updatedElement = { ...localElement, fill: "transparent" }
                                setLocalElement(updatedElement)
                                onUpdate(updatedElement)
                              }}
                              className="text-xs"
                            >
                              Clear
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Gradient fill */}
                      {typeof localElement.fill === 'object' && (localElement.fill as any) && (localElement.fill as any).type !== 'image' && (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="gradType" className="text-xs text-muted-foreground">Gradient Type</Label>
                            <Select
                              value={(localElement.fill as any).type || 'linear'}
                              onValueChange={(t) => {
                                const next = { ...(localElement.fill as any), type: t }
                                if (t === 'radial') delete (next as any).angle
                                const updatedElement = { ...localElement, fill: next }
                                setLocalElement(updatedElement)
                                onUpdate(updatedElement)
                              }}
                            >
                              <SelectTrigger id="gradType" className="w-full mt-1">
                                <SelectValue placeholder="Gradient type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="linear">Linear Gradient</SelectItem>
                                <SelectItem value="radial">Radial Gradient</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-xs text-muted-foreground">Gradient Colors</Label>
                            {(((localElement.fill as any).colors) || ['rgba(0,0,0,1)']).map((c: string, idx: number) => {
                              const parseRgba = (colorStr: string) => {
                                if (colorStr.startsWith('rgba')) {
                                  const match = colorStr.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/)
                                  if (match) {
                                    const [, r, g, b, a] = match
                                    return {
                                      hex: `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`,
                                      alpha: parseFloat(a)
                                    }
                                  }
                                }
                                return { hex: colorStr.startsWith('#') ? colorStr : '#000000', alpha: 1 }
                              }

                              const hexToRgba = (hex: string, alpha: number) => {
                                const r = parseInt(hex.slice(1, 3), 16)
                                const g = parseInt(hex.slice(3, 5), 16)
                                const b = parseInt(hex.slice(5, 7), 16)
                                return `rgba(${r}, ${g}, ${b}, ${alpha})`
                              }

                              const { hex, alpha } = parseRgba(c)

                              return (
                                <div key={idx} className="p-3 border rounded-lg space-y-3">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-xs font-medium">Color {idx + 1}</Label>
                                    {(((localElement.fill as any).colors) || []).length > 2 && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const colors = [ ...(((localElement.fill as any).colors) || []) ]
                                          if (colors.length <= 2) return
                                          colors.splice(idx, 1)
                                          const stops = colors.map((_, i) => (colors.length === 1 ? 1 : i / (colors.length - 1)))
                                          const updatedElement = { ...localElement, fill: { ...(localElement.fill as any), colors, stops } }
                                          setLocalElement(updatedElement)
                                          onUpdate(updatedElement)
                                        }}
                                        className="h-6 w-6 p-0"
                                      >
                                        ×
                                      </Button>
                                    )}
                                  </div>
                                  
                                  <div className="grid grid-cols-3 gap-2">
                                    <div>
                                      <Label className="text-xs">Color</Label>
                                      <Input
                                        type="color"
                                        value={hex}
                                        onChange={(e) => {
                                          const colors = [ ...(((localElement.fill as any).colors) || []) ]
                                          colors[idx] = hexToRgba(e.target.value, alpha)
                                          const stops = colors.map((_, i) => (colors.length === 1 ? 1 : i / (colors.length - 1)))
                                          const updatedElement = { ...localElement, fill: { ...(localElement.fill as any), colors, stops } }
                                          setLocalElement(updatedElement)
                                          onUpdate(updatedElement)
                                        }}
                                        className="h-8 mt-1"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">Alpha</Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={alpha}
                                        onChange={(e) => {
                                          const colors = [ ...(((localElement.fill as any).colors) || []) ]
                                          colors[idx] = hexToRgba(hex, parseFloat(e.target.value))
                                          const stops = colors.map((_, i) => (colors.length === 1 ? 1 : i / (colors.length - 1)))
                                          const updatedElement = { ...localElement, fill: { ...(localElement.fill as any), colors, stops } }
                                          setLocalElement(updatedElement)
                                          onUpdate(updatedElement)
                                        }}
                                        className="h-8 mt-1"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">Position</Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={Math.round(((((localElement.fill as any).stops) || [0, 1])[idx] || 0) * 100)}
                                        onChange={(e) => {
                                          const stops = [ ...(((localElement.fill as any).stops) || [0, 1]) ]
                                          stops[idx] = parseInt(e.target.value) / 100
                                          const updatedElement = { ...localElement, fill: { ...(localElement.fill as any), stops } }
                                          setLocalElement(updatedElement)
                                          onUpdate(updatedElement)
                                        }}
                                        className="h-8 mt-1"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                            
                            <Button 
                              onClick={() => {
                                const colors = [ ...(((localElement.fill as any).colors) || []), 'rgba(0,0,0,1)' ]
                                const stops = colors.map((_, i) => (colors.length === 1 ? 1 : i / (colors.length - 1)))
                                const updatedElement = { ...localElement, fill: { ...(localElement.fill as any), colors, stops } }
                                setLocalElement(updatedElement)
                                onUpdate(updatedElement)
                              }}
                              variant="outline" 
                              className="w-full"
                            >
                              + Add Color Stop
                            </Button>
                          </div>

                          {((localElement.fill as any).type === 'linear') && (
                            <div>
                              <Label htmlFor="gradAngle" className="text-xs text-muted-foreground">Gradient Angle</Label>
                              <div className="grid grid-cols-2 gap-2 mt-1">
                                <Input
                                  id="gradAngle"
                                  type="number"
                                  min="0"
                                  max="360"
                                  value={(localElement.fill as any).angle ?? 45}
                                  onChange={(e) => {
                                    const updatedElement = { ...localElement, fill: { ...(localElement.fill as any), angle: Number(e.target.value) || 0 } }
                                    setLocalElement(updatedElement)
                                    onUpdate(updatedElement)
                                  }}
                                />
                                <div className="text-xs text-muted-foreground pt-2">degrees</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Image fill */}
                      {typeof localElement.fill === 'object' && (localElement.fill as any)?.type === 'image' && (
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="imageSrc" className="text-xs text-muted-foreground">Image URL</Label>
                            <Input
                              id="imageSrc"
                              value={(localElement.fill as any).src ?? ''}
                              onChange={(e) => {
                                const updatedElement = { ...localElement, fill: { ...(localElement.fill as any), src: e.target.value } }
                                setLocalElement(updatedElement)
                                onUpdate(updatedElement)
                              }}
                              placeholder="Enter image URL..."
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="imageFit" className="text-xs text-muted-foreground">Image Fit</Label>
                            <Select
                              value={(localElement.fill as any).fit || 'cover'}
                              onValueChange={(fit) => {
                                const updatedElement = { ...localElement, fill: { ...(localElement.fill as any), fit } }
                                setLocalElement(updatedElement)
                                onUpdate(updatedElement)
                              }}
                            >
                              <SelectTrigger id="imageFit" className="w-full mt-1">
                                <SelectValue placeholder="Image fit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cover">Cover</SelectItem>
                                <SelectItem value="contain">Contain</SelectItem>
                                <SelectItem value="fill">Fill</SelectItem>
                                <SelectItem value="none">None</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Border</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Width</Label>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={localElement.stroke?.width ?? 0}
                        onChange={(e) => onUpdate({ ...localElement, stroke: { ...(localElement.stroke || {}), width: Number(e.target.value) || 0 } })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Color</Label>
                      <Input
                        type="color"
                        value={localElement.stroke?.color ?? '#000000'}
                        onChange={(e) => onUpdate({ ...localElement, stroke: { ...(localElement.stroke || {}), color: e.target.value } })}
                        className="mt-1 h-8"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {localElement.type === "image" && (
              <>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Image Settings</Label>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Image URL</Label>
                      <Input
                        value={localElement.content?.src || ""}
                        onChange={(e) => handleContentChange("src", e.target.value)}
                        placeholder="Enter image URL..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Alt Text</Label>
                      <Input
                        value={localElement.content?.alt || ""}
                        onChange={(e) => handleContentChange("alt", e.target.value)}
                        placeholder="Enter alt text..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Image Fit</Label>
                      <Select
                        value={localElement.style?.objectFit || "contain"}
                        onValueChange={(value) => handleStyleChange("objectFit", value)}
                      >
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Select image fit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contain">Contain</SelectItem>
                          <SelectItem value="cover">Cover</SelectItem>
                          <SelectItem value="fill">Fill</SelectItem>
                          <SelectItem value="scale-down">Scale Down</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {localElement.type === "chart" && (
              <>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Chart Settings</Label>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Chart Type</Label>
                      <Select
                        value={localElement.content?.chartType || "bar"}
                        onValueChange={(value) => handleContentChange("chartType", value)}
                      >
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Select chart type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bar">Bar Chart</SelectItem>
                          <SelectItem value="line">Line Chart</SelectItem>
                          <SelectItem value="pie">Pie Chart</SelectItem>
                          <SelectItem value="doughnut">Doughnut Chart</SelectItem>
                          <SelectItem value="area">Area Chart</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Chart Data</Label>
                      <div className="text-xs text-muted-foreground mt-1 p-2 border rounded">
                        Custom data input will be available in future updates
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-3">
              <Label className="text-sm font-medium">3D Transform</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Rotate X</Label>
                  <Input
                    type="number"
                    value={localElement.transform3d?.rotateX ?? 0}
                    onChange={(e) => onUpdate({ ...localElement, transform3d: { ...(localElement.transform3d || {}), rotateX: Number(e.target.value) || 0 } })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Rotate Y</Label>
                  <Input
                    type="number"
                    value={localElement.transform3d?.rotateY ?? 0}
                    onChange={(e) => onUpdate({ ...localElement, transform3d: { ...(localElement.transform3d || {}), rotateY: Number(e.target.value) || 0 } })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Rotate Z</Label>
                  <Input
                    type="number"
                    value={localElement.transform3d?.rotateZ ?? 0}
                    onChange={(e) => onUpdate({ ...localElement, transform3d: { ...(localElement.transform3d || {}), rotateZ: Number(e.target.value) || 0 } })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Translate Z</Label>
                  <Input
                    type="number"
                    value={localElement.transform3d?.translateZ ?? 0}
                    onChange={(e) => onUpdate({ ...localElement, transform3d: { ...(localElement.transform3d || {}), translateZ: Number(e.target.value) || 0 } })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Perspective</Label>
                <Input
                  type="number"
                  value={localElement.transform3d?.perspective ?? 0}
                  onChange={(e) => onUpdate({ ...localElement, transform3d: { ...(localElement.transform3d || {}), perspective: Number(e.target.value) || 0 } })}
                  className="mt-1"
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="animation" className="px-4">
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
