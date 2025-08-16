"use client"

import { useEffect, useState } from "react"
import { Minus, Plus, X } from "lucide-react"

// Import the font list
import { customFonts, googleFonts } from "@/lib/fonts"
import type { GradientFill, ShapeElement, SlideElement } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

interface ElementSettingsPanelProps {
  elements: SlideElement[]
  onUpdate: (updatedElements: SlideElement[]) => void
  onClose: () => void
}

export function ElementSettingsPanel({
  elements,
  onUpdate,
  onClose,
}: ElementSettingsPanelProps) {
  const [gradientType, setGradientType] = useState<
    "solid" | "linear" | "radial"
  >("solid")
  const [localElements, setLocalElements] = useState<SlideElement[]>([])

  useEffect(() => {
    setLocalElements(elements)
  }, [elements])

  // Check if elements is undefined or empty
  if (!localElements || localElements.length === 0) {
    return (
      <div className="bg-background w-64 overflow-y-auto border-l p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Element Settings</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p>No elements selected</p>
      </div>
    )
  }

  const handleInputChange = (key: string, value: string | number) => {
    const updatedElements = localElements.map((element) => ({
      ...element,
      [key]: value,
    }))
    setLocalElements(updatedElements)
    onUpdate(updatedElements)
  }

  const handleStyleChange = (key: string, value: string) => {
    const updatedElements = localElements.map((element) => ({
      ...element,
      style: { ...element.style, [key]: value },
    }))
    setLocalElements(updatedElements)
    onUpdate(updatedElements)
  }

  const handleContentChange = (key: string, value: string) => {
    const updatedElements = localElements.map((element) => ({
      ...element,
      content: { ...element.content, [key]: value },
    }))
    setLocalElements(updatedElements)
    onUpdate(updatedElements)
  }

  const handleShapeFillChange = (fill: string | GradientFill) => {
    const updatedElements = localElements.map((element) => {
      if (element.type === "rectangle" || element.type === "oval") {
        return { ...element, fill } as ShapeElement
      }
      return element
    })
    setLocalElements(updatedElements)
    onUpdate(updatedElements)
  }

  const handleChartTypeChange = (chartType: "bar" | "line") => {
    const updatedElements = localElements.map((element) => {
      if (element.type === "chart") {
        return {
          ...element,
          content: { ...element.content, chartType },
        }
      }
      return element
    })
    setLocalElements(updatedElements)
    onUpdate(updatedElements)
  }

  const renderShapeSettings = () => {
    const shapeElement = localElements[0] as ShapeElement
    const currentFill = shapeElement.fill || "#000000"
    
    // Определяем текущий тип заливки
    const currentFillType = typeof currentFill === "string" ? "solid" : 
                           (currentFill.type === "linear" ? "linear" : "radial")
    
    return (
      <>
        <div className="space-y-4">
          <div>
            <Label htmlFor="fillType" className="text-sm font-medium">Background Type</Label>
            <Select
              value={gradientType}
              onValueChange={(value: "solid" | "linear" | "radial") =>
                setGradientType(value)
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select background type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid Color</SelectItem>
                <SelectItem value="linear">Linear Gradient</SelectItem>
                <SelectItem value="radial">Radial Gradient</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {gradientType === "solid" && (
            <div>
              <Label htmlFor="fill" className="text-sm font-medium">Background Color</Label>
              <div className="mt-1 flex gap-2 items-center">
                <Input
                  id="fill"
                  type="color"
                  value={typeof currentFill === "string" ? currentFill : "#000000"}
                  onChange={(e) => handleShapeFillChange(e.target.value)}
                  className="h-10 flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShapeFillChange("transparent")}
                  className="text-xs"
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
          
          {(gradientType === "linear" || gradientType === "radial") && (
            <div>
              <Label className="text-sm font-medium">Gradient Settings</Label>
              <div className="mt-2">
                <GradientEditor
                  gradient={
                    typeof currentFill === "object"
                      ? currentFill
                      : {
                          type: gradientType,
                          colors: ["rgba(0,0,0,1)", "rgba(255,255,255,0.5)"],
                          stops: [0, 1],
                          angle: 0,
                        }
                  }
                  onChange={handleShapeFillChange}
                />
              </div>
            </div>
          )}
          
          <div>
            <Label className="text-sm font-medium">Border</Label>
            <div className="mt-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Width</Label>
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    value={(shapeElement as any).stroke?.width || 0}
                    onChange={(e) => {
                      const stroke = (shapeElement as any).stroke || {}
                      const updatedElements = localElements.map((element) => {
                        if (element.type === "rectangle" || element.type === "oval") {
                          return { 
                            ...element, 
                            stroke: { ...stroke, width: Number(e.target.value) }
                          } as ShapeElement
                        }
                        return element
                      })
                      setLocalElements(updatedElements)
                      onUpdate(updatedElements)
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Color</Label>
                  <Input
                    type="color"
                    value={(shapeElement as any).stroke?.color || "#000000"}
                    onChange={(e) => {
                      const stroke = (shapeElement as any).stroke || {}
                      const updatedElements = localElements.map((element) => {
                        if (element.type === "rectangle" || element.type === "oval") {
                          return { 
                            ...element, 
                            stroke: { ...stroke, color: e.target.value }
                          } as ShapeElement
                        }
                        return element
                      })
                      setLocalElements(updatedElements)
                      onUpdate(updatedElements)
                    }}
                    className="mt-1 h-8"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  const commonSettings = (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium">Position & Size</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <Label htmlFor="x" className="text-xs">X Position</Label>
            <Input
              id="x"
              type="number"
              value={localElements[0].x}
              onChange={(e) => handleInputChange("x", Number(e.target.value))}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="y" className="text-xs">Y Position</Label>
            <Input
              id="y"
              type="number"
              value={localElements[0].y}
              onChange={(e) => handleInputChange("y", Number(e.target.value))}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="width" className="text-xs">Width</Label>
            <Input
              id="width"
              type="number"
              min="1"
              value={localElements[0].width}
              onChange={(e) => handleInputChange("width", Number(e.target.value))}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="height" className="text-xs">Height</Label>
            <Input
              id="height"
              type="number"
              min="1"
              value={localElements[0].height}
              onChange={(e) => handleInputChange("height", Number(e.target.value))}
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderTypeSpecificSettings = () => {
    if (localElements.length !== 1) return null

    const element = localElements[0]

    switch (element.type) {
      case "text":
        return (
          <>
            <div className="space-y-3">
              <div>
                <Label htmlFor="text" className="text-sm font-medium">Text Content</Label>
                <Input
                  id="text"
                  value={element.content.text || ""}
                  onChange={(e) => handleContentChange("text", e.target.value)}
                  placeholder="Enter text..."
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="fontSize" className="text-sm font-medium">Font Size</Label>
                  <Input
                    id="fontSize"
                    type="number"
                    min="8"
                    max="200"
                    value={Number.parseInt(element.style.fontSize as string) || 16}
                    onChange={(e) =>
                      handleStyleChange("fontSize", `${e.target.value}px`)
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="fontWeight" className="text-sm font-medium">Weight</Label>
                  <Select
                    value={element.style.fontWeight || "normal"}
                    onValueChange={(value) => handleStyleChange("fontWeight", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="300">Light</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="500">Medium</SelectItem>
                      <SelectItem value="600">Semi Bold</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="fontFamily" className="text-sm font-medium">Font Family</Label>
                <Select
                  value={element.style.fontFamily || "Inter"}
                  onValueChange={(value) =>
                    handleStyleChange("fontFamily", value)
                  }
                >
                  <SelectTrigger className="mt-1" style={{ fontFamily: element.style.fontFamily || "Inter" }}>
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
                      <SelectItem value="Comic Sans MS" style={{ fontFamily: "Comic Sans MS" }}>
                        <span style={{ fontFamily: "Comic Sans MS" }}>Comic Sans MS</span>
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

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-sm font-medium">Align</Label>
                  <Select
                    value={element.style.textAlign || "left"}
                    onValueChange={(value) => handleStyleChange("textAlign", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">V-Align</Label>
                  <Select
                    value={element.style.verticalAlign || "center"}
                    onValueChange={(value) => handleStyleChange("verticalAlign", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Wrap</Label>
                  <Select
                    value={element.style.whiteSpace || "normal"}
                    onValueChange={(value) => handleStyleChange("whiteSpace", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Wrap</SelectItem>
                      <SelectItem value="nowrap">No Wrap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="color" className="text-sm font-medium">Text Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={element.style.color || "#000000"}
                  onChange={(e) => handleStyleChange("color", e.target.value)}
                  className="mt-1 h-10"
                />
              </div>
            </div>
          </>
        )
      case "image":
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="src" className="text-sm font-medium">Image Source</Label>
              <Input
                id="src"
                value={element.content.src || ""}
                onChange={(e) => handleContentChange("src", e.target.value)}
                placeholder="Enter image URL or path..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="alt" className="text-sm font-medium">Alt Text</Label>
              <Input
                id="alt"
                value={element.content.alt || ""}
                onChange={(e) => handleContentChange("alt", e.target.value)}
                placeholder="Alternative text for accessibility..."
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Image Fit</Label>
              <Select
                value={element.style.objectFit || "contain"}
                onValueChange={(value) => handleStyleChange("objectFit", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
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
        )
      case "chart":
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="chartType" className="text-sm font-medium">Chart Type</Label>
              <Select
                value={element.content.chartType || "bar"}
                onValueChange={(value: "bar" | "line") =>
                  handleChartTypeChange(value)
                }
              >
                <SelectTrigger id="chartType" className="mt-1">
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Chart Data</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Chart displays sample data. Future versions will support custom data input.
              </p>
            </div>
          </div>
        )
      case "rectangle":
      case "oval":
        return renderShapeSettings()
      default:
        return null
    }
  }

  return (
    <div className="bg-background w-72 overflow-y-auto border-l">
      <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Element Settings</h3>
          <p className="text-xs text-muted-foreground">
            {localElements.length === 1 ? `${localElements[0].type} element` : `${localElements.length} elements`}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {commonSettings}
        <div className="border-t pt-4">
          {renderTypeSpecificSettings()}
        </div>
      </div>
    </div>
  )
}

interface GradientEditorProps {
  gradient: GradientFill
  onChange: (gradient: GradientFill) => void
}

function GradientEditor({ gradient, onChange }: GradientEditorProps) {
  const addColorStop = () => {
    const newColors = [...gradient.colors, "rgba(0,0,0,1)"]
    const newStops = [...gradient.stops, 1]
    onChange({ ...gradient, colors: newColors, stops: newStops })
  }

  const removeColorStop = (index: number) => {
    if (gradient.colors.length <= 2) return // Минимум 2 цвета
    const newColors = gradient.colors.filter((_, i) => i !== index)
    const newStops = gradient.stops.filter((_, i) => i !== index)
    onChange({ ...gradient, colors: newColors, stops: newStops })
  }

  const updateColorStop = (index: number, color: string, stop: number) => {
    const newColors = [...gradient.colors]
    const newStops = [...gradient.stops]
    newColors[index] = color
    newStops[index] = stop
    onChange({ ...gradient, colors: newColors, stops: newStops })
  }

  const hexToRgba = (hex: string, alpha: number = 1) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const parseRgba = (color: string) => {
    if (color.startsWith('rgba')) {
      const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/)
      if (match) {
        const [, r, g, b, a] = match
        return {
          hex: `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`,
          alpha: parseFloat(a)
        }
      }
    }
    return { hex: color.startsWith('#') ? color : '#000000', alpha: 1 }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {gradient.colors.map((color, index) => {
          const { hex, alpha } = parseRgba(color)
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <div key={index} className="space-y-2 p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Color {index + 1}</Label>
                {gradient.colors.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeColorStop(index)}
                    className="h-6 w-6 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-2 items-center">
                <div>
                  <Label className="text-xs">Color</Label>
                  <Input
                    type="color"
                    value={hex}
                    onChange={(e) =>
                      updateColorStop(index, hexToRgba(e.target.value, alpha), gradient.stops[index])
                    }
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
                    onChange={(e) =>
                      updateColorStop(index, hexToRgba(hex, parseFloat(e.target.value)), gradient.stops[index])
                    }
                    className="h-8 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Position</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={Math.round(gradient.stops[index] * 100)}
                    onChange={(e) =>
                      updateColorStop(index, color, parseInt(e.target.value) / 100)
                    }
                    className="h-8 mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-xs">Position Slider</Label>
                <Slider
                  value={[gradient.stops[index] * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) =>
                    updateColorStop(index, color, value[0] / 100)
                  }
                  className="mt-1"
                />
              </div>
            </div>
          )
        })}
      </div>
      
      <Button onClick={addColorStop} variant="outline" className="w-full">
        <Plus className="mr-2 h-4 w-4" /> Add Color Stop
      </Button>
      
      {gradient.type === "linear" && (
        <div>
          <Label htmlFor="angle" className="text-sm font-medium">Gradient Angle</Label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <Input
              id="angle"
              type="number"
              min="0"
              max="360"
              value={gradient.angle || 0}
              onChange={(e) =>
                onChange({ ...gradient, angle: Number(e.target.value) })
              }
            />
            <Slider
              value={[gradient.angle || 0]}
              min={0}
              max={360}
              step={1}
              onValueChange={(value) =>
                onChange({ ...gradient, angle: value[0] })
              }
            />
          </div>
        </div>
      )}
    </div>
  )
}
