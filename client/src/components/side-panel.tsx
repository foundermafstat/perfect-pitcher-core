"use client"

import { useState } from "react"
import { Box, ChevronDown, ChevronUp, Palette, Type, Image, BarChart, Table, Square, Circle, Layout, Layers as LayersIcon } from "lucide-react"

import type { Blueprint, Slide, SlideElement } from "@/lib/types"
import { useTranslations } from "@/providers/translations-context"
import { Card, CardContent } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayersPanel } from "@/components/layers-panel"

interface SidePanelProps {
  slide: Slide
  blueprints: Blueprint[]
  onAddElement: (blueprint: Blueprint) => void
  onReorderElements: (reorderedElements: SlideElement[]) => void
  onBackgroundChange: (background: string) => void
  onBackgroundTypeChange: (type: string, value?: string) => void
}

export function SidePanel({
  slide,
  blueprints,
  onAddElement,
  onReorderElements,
  onBackgroundChange,
  onBackgroundTypeChange,
}: SidePanelProps) {
  const { t } = useTranslations()
  const [activeTab, setActiveTab] = useState("all")
  const [isBlueprintsOpen, setIsBlueprintsOpen] = useState(true)
  const [isBackgroundOpen, setIsBackgroundOpen] = useState(true)
  const [isLayersOpen, setIsLayersOpen] = useState(true)
  const [backgroundType, setBackgroundType] = useState(
    slide.backgroundType || "color"
  )
  const [youtubeUrl, setYoutubeUrl] = useState(slide.youtubeBackground || "")

  const filteredBlueprints =
    activeTab === "all"
      ? blueprints
      : blueprints.filter((bp) => bp.category === activeTab)

  const getIconForType = (type: string) => {
    switch (type) {
      case "text":
        return <Type className="h-4 w-4" />
      case "image":
        return <Image className="h-4 w-4" />
      case "chart":
        return <BarChart className="h-4 w-4" />
      case "table":
        return <Table className="h-4 w-4" />
      case "rectangle":
        return <Square className="h-4 w-4" />
      case "oval":
        return <Circle className="h-4 w-4" />
      default:
        return <Layout className="h-4 w-4" />
    }
  }

  // Reorder handled by dnd-kit inside LayersPanel

  const handleBackgroundTypeChange = (type: string) => {
    setBackgroundType(type)
    onBackgroundTypeChange(type)
  }

  const handleYoutubeUrlChange = (url: string) => {
    setYoutubeUrl(url)
    onBackgroundTypeChange("youtube", url)
  }

  return (
    <div className="bg-muted/40 flex w-56 flex-col overflow-auto border-r">
      {/* Blueprints Section */}
      <Collapsible open={isBlueprintsOpen} onOpenChange={setIsBlueprintsOpen}>
        <CollapsibleTrigger className="hover:bg-muted/60 flex w-full items-center justify-between border-b py-2 px-3">
          <div className="flex items-center gap-2">
            <Box className="h-3.5 w-3.5" />
            <h2 className="text-sm font-medium">{t('editor.panels.elements')}</h2>
          </div>
          {isBlueprintsOpen ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col"
          >
            <div className="px-2 pt-1">
              <TabsList className="w-full h-7">
                <TabsTrigger value="all" className="flex-1 text-xs">
                  {t('editor.panels.all')}
                </TabsTrigger>
                <TabsTrigger value="text" className="flex-1 text-xs">
                  {t('editor.panels.text')}
                </TabsTrigger>
                <TabsTrigger value="shapes" className="flex-1 text-xs">
                  {t('editor.panels.shapes')}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="flex-1 overflow-auto p-2">
              <div className="grid grid-cols-2 gap-1.5">
                {filteredBlueprints.map((blueprint) => (
                  <Card
                    key={blueprint.id}
                    className="hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => onAddElement(blueprint)}
                  >
                    <CardContent className="flex items-center gap-2 p-2">
                      <div className="text-primary flex-shrink-0">
                        {getIconForType(blueprint.type)}
                      </div>
                      <span className="text-xs">
                        {blueprint.name}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CollapsibleContent>
      </Collapsible>

      {/* Background Settings Section */}
      <Collapsible open={isBackgroundOpen} onOpenChange={setIsBackgroundOpen}>
        <CollapsibleTrigger className="hover:bg-muted/60 flex w-full items-center justify-between border-b py-2 px-3">
          <div className="flex items-center gap-2">
            <Palette className="h-3.5 w-3.5" />
            <h2 className="text-sm font-medium">{t('editor.panels.background')}</h2>
          </div>
          {isBackgroundOpen ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 p-3">
          <div>
            <Label htmlFor="backgroundType" className="text-xs">{t('editor.panels.backgroundType')}</Label>
            <Select
              value={backgroundType}
              onValueChange={handleBackgroundTypeChange}
            >
              <SelectTrigger id="backgroundType" className="h-8 text-xs">
                <SelectValue placeholder={t('editor.panels.backgroundTypeSelect')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-xs">{t('editor.panels.transparent')}</SelectItem>
                <SelectItem value="color" className="text-xs">{t('editor.panels.color')}</SelectItem>
                <SelectItem value="gradient" className="text-xs">{t('editor.panels.gradient')}</SelectItem>
                <SelectItem value="youtube" className="text-xs">{t('editor.panels.youtube')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {backgroundType === "color" && (
            <div>
              <Label htmlFor="backgroundColor">{t('editor.panels.backgroundColor')}</Label>
              <Input
                id="backgroundColor"
                type="color"
                value={slide.background || "#ffffff"}
                onChange={(e) => onBackgroundChange(e.target.value)}
              />
            </div>
          )}

          {backgroundType === "gradient" && (
            <div className="space-y-2">
              <Label>{t('editor.panels.gradientColors')}</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={slide.gradientStart || "#ffffff"}
                  onChange={(e) =>
                    onBackgroundTypeChange(
                      "gradient",
                      JSON.stringify({
                        start: e.target.value,
                        end: slide.gradientEnd || "#000000",
                        angle: slide.gradientAngle || 45,
                      })
                    )
                  }
                />
                <Input
                  type="color"
                  value={slide.gradientEnd || "#000000"}
                  onChange={(e) =>
                    onBackgroundTypeChange(
                      "gradient",
                      JSON.stringify({
                        start: slide.gradientStart || "#ffffff",
                        end: e.target.value,
                        angle: slide.gradientAngle || 45,
                      })
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="gradientAngle">{t('editor.panels.gradientAngle')}</Label>
                <Input
                  id="gradientAngle"
                  type="number"
                  min="0"
                  max="360"
                  value={slide.gradientAngle || 45}
                  onChange={(e) =>
                    onBackgroundTypeChange(
                      "gradient",
                      JSON.stringify({
                        start: slide.gradientStart || "#ffffff",
                        end: slide.gradientEnd || "#000000",
                        angle: Number.parseInt(e.target.value) || 0,
                      })
                    )
                  }
                />
              </div>
            </div>
          )}

          {backgroundType === "youtube" && (
            <div>
              <Label htmlFor="youtubeUrl">{t('editor.panels.youtubeUrl')}</Label>
              <Input
                id="youtubeUrl"
                placeholder={t('editor.panels.youtubeUrlPlaceholder')}
                value={youtubeUrl}
                onChange={(e) => handleYoutubeUrlChange(e.target.value)}
              />
              <p className="text-muted-foreground mt-1 text-xs">
                {t('editor.panels.youtubeHint')}
              </p>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Layers Section moved into left panel with same style as others */}
      <Collapsible open={isLayersOpen} onOpenChange={setIsLayersOpen}>
        <CollapsibleTrigger className="hover:bg-muted/60 flex w-full items-center justify-between border-b py-2 px-3">
          <div className="flex items-center gap-2">
            <LayersIcon className="h-3.5 w-3.5" />
            <h2 className="text-sm font-medium">{t('editor.panels.layers')}</h2>
          </div>
          {isLayersOpen ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <LayersPanel elements={slide.elements} onReorder={onReorderElements} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
