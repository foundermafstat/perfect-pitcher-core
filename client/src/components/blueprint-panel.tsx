"use client"

import { useState } from "react"
import {
  BarChartIcon as ChartBar,
  ChevronDown,
  ChevronUp,
  Circle,
  Image,
  Layout,
  Square,
  Table,
  Text,
} from "lucide-react"

import type { Blueprint } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface BlueprintPanelProps {
  blueprints: Blueprint[]
  onAddElement: (blueprint: Blueprint) => void
}

export function BlueprintPanel({
  blueprints,
  onAddElement,
}: BlueprintPanelProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [isOpen, setIsOpen] = useState(true)

  const filteredBlueprints =
    activeTab === "all"
      ? blueprints
      : blueprints.filter((bp) => bp.category === activeTab)

  const getIconForType = (type: string) => {
    switch (type) {
      case "text":
        return <Text className="h-5 w-5" />
      case "image":
        return <Image className="h-5 w-5" />
      case "chart":
        return <ChartBar className="h-5 w-5" />
      case "table":
        return <Table className="h-5 w-5" />
      case "rectangle":
        return <Square className="h-5 w-5" />
      case "oval":
        return <Circle className="h-5 w-5" />
      default:
        return <Layout className="h-5 w-5" />
    }
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="bg-muted/40 w-64 border-r"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between border-b p-4">
        <h2 className="font-semibold">Blueprints</h2>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col"
        >
          <div className="px-2 pt-2">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                All
              </TabsTrigger>
              <TabsTrigger value="text" className="flex-1">
                Text
              </TabsTrigger>
              <TabsTrigger value="media" className="flex-1">
                Media
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="flex-1 overflow-auto p-2">
            <div className="grid grid-cols-2 gap-2">
              {filteredBlueprints.map((blueprint) => (
                <Card
                  key={blueprint.id}
                  className="hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => onAddElement(blueprint)}
                >
                  <CardContent className="flex flex-col items-center justify-center p-3 text-center">
                    <div className="text-primary mb-2">
                      {getIconForType(blueprint.type)}
                    </div>
                    <span className="text-xs font-medium">
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
  )
}
