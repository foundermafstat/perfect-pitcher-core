"use client"

import { useState } from "react"

import type { SlideElement } from "@/lib/types"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

interface AnimationSettingsProps {
  element: SlideElement
  onUpdate: (updatedElement: SlideElement) => void
}

const animationTypes = ["fade-in", "slide-in", "zoom-in", "bounce", "rotate"]

export function AnimationSettings({
  element,
  onUpdate,
}: AnimationSettingsProps) {
  const [animation, setAnimation] = useState(
    element.animation || {
      type: "",
      duration: 1,
      delay: 0,
      easing: "ease",
      repeat: false,
    }
  )

  const handleAnimationChange = (
    key: string,
    value: string | number | boolean
  ) => {
    const updatedAnimation = { ...animation, [key]: value }
    setAnimation(updatedAnimation)
    onUpdate({
      ...element,
      animation: updatedAnimation,
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="animationType">Animation Type</Label>
        <Select
          value={animation.type}
          onValueChange={(value) => handleAnimationChange("type", value)}
        >
          <SelectTrigger id="animationType">
            <SelectValue placeholder="Select animation type" />
          </SelectTrigger>
          <SelectContent>
            {animationTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="animationDuration">Duration (seconds)</Label>
        <Slider
          id="animationDuration"
          min={0.1}
          max={5}
          step={0.1}
          value={[animation.duration]}
          onValueChange={([value]) => handleAnimationChange("duration", value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="animationDelay">Delay (seconds)</Label>
        <Slider
          id="animationDelay"
          min={0}
          max={5}
          step={0.1}
          value={[animation.delay]}
          onValueChange={([value]) => handleAnimationChange("delay", value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="animationEasing">Easing</Label>
        <Select
          value={animation.easing}
          onValueChange={(value) => handleAnimationChange("easing", value)}
        >
          <SelectTrigger id="animationEasing">
            <SelectValue placeholder="Select easing function" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linear">Linear</SelectItem>
            <SelectItem value="ease">Ease</SelectItem>
            <SelectItem value="ease-in">Ease In</SelectItem>
            <SelectItem value="ease-out">Ease Out</SelectItem>
            <SelectItem value="ease-in-out">Ease In Out</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="animationRepeat"
          checked={animation.repeat}
          onCheckedChange={(checked) =>
            handleAnimationChange("repeat", checked)
          }
        />
        <Label htmlFor="animationRepeat">Repeat Animation</Label>
      </div>
    </div>
  )
}
