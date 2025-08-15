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
    return (
      <>
        <div>
          <Label htmlFor="fillType">Fill Type</Label>
          <Select
            value={gradientType}
            onValueChange={(value: "solid" | "linear" | "radial") =>
              setGradientType(value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select fill type" />
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
            <Label htmlFor="fill">Fill Color</Label>
            <Input
              id="fill"
              type="color"
              value={typeof currentFill === "string" ? currentFill : "#000000"}
              onChange={(e) => handleShapeFillChange(e.target.value)}
            />
          </div>
        )}
        {(gradientType === "linear" || gradientType === "radial") && (
          <GradientEditor
            gradient={
              typeof currentFill === "object"
                ? currentFill
                : {
                    type: gradientType,
                    colors: ["#000000", "#ffffff"],
                    stops: [0, 1],
                    angle: 0,
                  }
            }
            onChange={handleShapeFillChange}
          />
        )}
      </>
    )
  }

  const commonSettings = (
    <>
      <div>
        <Label htmlFor="x">X Position</Label>
        <Input
          id="x"
          type="number"
          value={localElements[0].x}
          onChange={(e) => handleInputChange("x", Number(e.target.value))}
        />
      </div>
      <div>
        <Label htmlFor="y">Y Position</Label>
        <Input
          id="y"
          type="number"
          value={localElements[0].y}
          onChange={(e) => handleInputChange("y", Number(e.target.value))}
        />
      </div>
      <div>
        <Label htmlFor="width">Width</Label>
        <Input
          id="width"
          type="number"
          value={localElements[0].width}
          onChange={(e) => handleInputChange("width", Number(e.target.value))}
        />
      </div>
      <div>
        <Label htmlFor="height">Height</Label>
        <Input
          id="height"
          type="number"
          value={localElements[0].height}
          onChange={(e) => handleInputChange("height", Number(e.target.value))}
        />
      </div>
    </>
  )

  const renderTypeSpecificSettings = () => {
    if (localElements.length !== 1) return null

    const element = localElements[0]

    switch (element.type) {
      case "text":
        return (
          <>
            <div>
              <Label htmlFor="text">Text Content</Label>
              <Input
                id="text"
                value={element.content.text}
                onChange={(e) => handleContentChange("text", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="fontSize">Font Size</Label>
              <Input
                id="fontSize"
                type="number"
                value={Number.parseInt(element.style.fontSize as string) || 16}
                onChange={(e) =>
                  handleStyleChange("fontSize", `${e.target.value}px`)
                }
              />
            </div>
            <div>
              <Label htmlFor="fontFamily">Font Family</Label>
              <Select
                value={element.style.fontFamily}
                onValueChange={(value) =>
                  handleStyleChange("fontFamily", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Google Fonts</SelectLabel>
                    {googleFonts.map((font) => (
                      <SelectItem key={font.name} value={font.name}>
                        {font.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Custom Fonts</SelectLabel>
                    {customFonts.map((font) => (
                      <SelectItem key={font} value={font}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                type="color"
                value={element.style.color}
                onChange={(e) => handleStyleChange("color", e.target.value)}
              />
            </div>
          </>
        )
      case "image":
        return (
          <div>
            <Label htmlFor="src">Image Source</Label>
            <Input
              id="src"
              value={element.content.src}
              onChange={(e) => handleContentChange("src", e.target.value)}
            />
          </div>
        )
      case "chart":
        return (
          <div>
            <Label htmlFor="chartType">Chart Type</Label>
            <Select
              value={element.content.chartType}
              onValueChange={(value: "bar" | "line") =>
                handleChartTypeChange(value)
              }
            >
              <SelectTrigger id="chartType">
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
              </SelectContent>
            </Select>
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
    <div className="bg-background w-64 overflow-y-auto border-l p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Element Settings</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {commonSettings}
        {renderTypeSpecificSettings()}
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
    const newColors = [...gradient.colors, "#000000"]
    const newStops = [...gradient.stops, 1]
    onChange({ ...gradient, colors: newColors, stops: newStops })
  }

  const removeColorStop = (index: number) => {
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

  return (
    <div className="space-y-4">
      {gradient.colors.map((color, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <div key={index} className="flex items-center space-x-2">
          <Input
            type="color"
            value={color}
            onChange={(e) =>
              updateColorStop(index, e.target.value, gradient.stops[index])
            }
          />
          <Slider
            value={[gradient.stops[index] * 100]}
            min={0}
            max={100}
            step={1}
            onValueChange={(value) =>
              updateColorStop(index, color, value[0] / 100)
            }
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => removeColorStop(index)}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button onClick={addColorStop}>
        <Plus className="mr-2 h-4 w-4" /> Add Color Stop
      </Button>
      {gradient.type === "linear" && (
        <div>
          <Label htmlFor="angle">Angle</Label>
          <Input
            id="angle"
            type="number"
            value={gradient.angle || 0}
            onChange={(e) =>
              onChange({ ...gradient, angle: Number(e.target.value) })
            }
          />
        </div>
      )}
    </div>
  )
}
