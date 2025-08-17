"use client"

import { useState, useEffect } from "react"
import { notFound, useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useTranslations } from "@/providers/translations-context"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SlideViewer } from "@/components/slide-viewer"
import { updateSlide } from "@/actions/slide"

interface Story {
  id: string
  title: string
  description: string | null
  createdAt: string
  updatedAt: string
  deckType: string | null
  locale: string | null
  brandColor: string | null
  userId?: string | null
  projectId?: string | null
  slides: Array<{
    id: string
    title: string
    elements: Array<any>
    background?: string
    backgroundType?: string
    context?: string
    gradientStart?: string
    gradientEnd?: string
    gradientAngle?: number
    youtubeBackground?: string
  }>
  project?: {
    id: string
    name: string
    shortDescription: string | null
  } | null
  finalDataEn?: any
  qaLocalized?: any
  thumbnail?: string | null
}

interface JsonField {
  key: string
  value: any
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'select' | 'multiselect' | 'tags'
  options?: string[]
  isMultiValue?: boolean
}

interface ParsedJsonData {
  fields: JsonField[]
  originalData: any
}

export default function EditStoryPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const { t, has } = useTranslations()
  const [story, setStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deckType: "",
    locale: "",
    brandColor: "",
    thumbnail: ""
  })
  
  const [finalDataEnFields, setFinalDataEnFields] = useState<JsonField[]>([])
  const [qaLocalizedFields, setQaLocalizedFields] = useState<JsonField[]>([])
  const [originalFinalDataEn, setOriginalFinalDataEn] = useState<any>(null)
  const [originalQaLocalized, setOriginalQaLocalized] = useState<any>(null)

  const [slideContexts, setSlideContexts] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!id) return

    fetch(`/api/stories/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Story not found')
        return res.json()
      })
      .then(data => {
        console.log('API response:', data)
        if (data.success && data.story) {
          setStory(data.story)
          
          // Отладочная информация
          console.log('Story data from API:', data.story)
          console.log('finalDataEn type:', typeof data.story.finalDataEn, 'value:', data.story.finalDataEn)
          console.log('qaLocalized type:', typeof data.story.qaLocalized, 'value:', data.story.qaLocalized)
          
          // Дополнительная отладка для JSON полей
          if (data.story.finalDataEn) {
            console.log('finalDataEn is truthy, attempting to parse...')
            console.log('finalDataEn JSON.stringify:', JSON.stringify(data.story.finalDataEn))
          }
          if (data.story.qaLocalized) {
            console.log('qaLocalized is truthy, attempting to parse...')
            console.log('qaLocalized JSON.stringify:', JSON.stringify(data.story.qaLocalized))
          }
          
          const formDataToSet = {
            title: data.story.title || "",
            description: data.story.description || "",
            deckType: data.story.deckType || "",
            locale: data.story.locale || "",
            brandColor: data.story.brandColor || "",
            thumbnail: data.story.thumbnail || ""
          }
          
          setFormData(formDataToSet)
          
          // Parse JSON fields
          if (data.story.finalDataEn) {
            console.log('Parsing finalDataEn...')
            const parsedFinalData = parseJsonToFields(data.story.finalDataEn)
            console.log('Parsed finalDataEn fields:', parsedFinalData.fields)
            setFinalDataEnFields(parsedFinalData.fields)
            setOriginalFinalDataEn(data.story.finalDataEn)
          } else {
            console.log('finalDataEn is empty or null')
            setFinalDataEnFields([])
            setOriginalFinalDataEn(null)
          }
          
          if (data.story.qaLocalized) {
            console.log('Parsing qaLocalized...')
            const parsedQaData = parseJsonToFields(data.story.qaLocalized)
            console.log('Parsed qaLocalized fields:', parsedQaData.fields)
            setQaLocalizedFields(parsedQaData.fields)
            setOriginalQaLocalized(data.story.qaLocalized)
          } else {
            console.log('qaLocalized is empty or null')
            setQaLocalizedFields([])
            setOriginalQaLocalized(null)
          }

          if (data.story.slides) {
            const initialContexts = data.story.slides.reduce((acc: Record<string, string>, slide: any) => {
              acc[slide.id] = slide.context || ""
              return acc
            }, {})
            setSlideContexts(initialContexts)
          }
        } else {
          console.error('API returned success: false or no story')
          throw new Error('Story not found')
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching story:', error)
        setError(true)
        setLoading(false)
      })
  }, [id])

  // Function to parse JSON data into editable fields
  const parseJsonToFields = (jsonData: any): ParsedJsonData => {
    const fields: JsonField[] = []
    
    // First, try to parse the data if it's a string
    let parsedData = jsonData
    if (typeof jsonData === 'string') {
      try {
        parsedData = JSON.parse(jsonData)
      } catch (error) {
        console.log('Data is a string but not valid JSON, treating as string:', jsonData)
        fields.push({ key: 'content', value: jsonData, type: 'string' })
        return { fields, originalData: jsonData }
      }
    }
    
    console.log('Parsing data:', parsedData, 'Type:', typeof parsedData)
    
    // Helper function to detect field type based on key name and value
    const detectFieldType = (key: string, value: any): JsonField['type'] => {
      const keyLower = key.toLowerCase()
      
      // Detect select fields
      if (keyLower.includes('type') || keyLower.includes('category') || keyLower.includes('status')) {
        return 'select'
      }
      
      // Detect tag/multi-value fields
      if (keyLower.includes('tags') || keyLower.includes('keywords') || keyLower.includes('categories')) {
        return 'tags'
      }
      
      // Detect arrays that should be multi-select
      if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
        return 'multiselect'
      }
      
      // Default type detection
      if (typeof value === 'boolean') return 'boolean'
      if (typeof value === 'number') return 'number'
      if (Array.isArray(value)) return 'array'
      if (typeof value === 'object' && value !== null) return 'object'
      return 'string'
    }
    
    // Helper function to get options for select fields
    const getFieldOptions = (key: string, value: any): string[] => {
      const keyLower = key.toLowerCase()
      
      if (keyLower.includes('type')) {
        return ['startup', 'sales', 'launch', 'strategy', 'investor', 'education', 'keynote']
      }
      
      if (keyLower.includes('category')) {
        return ['business', 'technology', 'marketing', 'finance', 'product', 'other']
      }
      
      if (keyLower.includes('status')) {
        return ['draft', 'review', 'published', 'archived']
      }
      
      if (keyLower.includes('language') || keyLower.includes('locale')) {
        return ['en', 'ru', 'es', 'fr', 'de', 'zh']
      }
      
      return []
    }
    
    const processValue = (key: string, value: any, path: string = '') => {
      const fullKey = path ? `${path}.${key}` : key
      
      if (value === null || value === undefined) {
        fields.push({ key: fullKey, value: '', type: 'string' })
      } else {
        const fieldType = detectFieldType(key, value)
        const options = getFieldOptions(key, value)
        
        if (fieldType === 'multiselect' || fieldType === 'tags') {
          fields.push({ 
            key: fullKey, 
            value: Array.isArray(value) ? value : [value], 
            type: fieldType,
            options,
            isMultiValue: true
          })
        } else if (fieldType === 'select') {
          fields.push({ 
            key: fullKey, 
            value, 
            type: fieldType,
            options
          })
        } else if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === 'object' && item !== null) {
              Object.entries(item).forEach(([subKey, subValue]) => {
                processValue(`${key}[${index}].${subKey}`, subValue, path)
              })
            } else {
              processValue(`${key}[${index}]`, item, path)
            }
          })
        } else if (typeof value === 'object') {
          Object.entries(value).forEach(([subKey, subValue]) => {
            processValue(subKey, subValue, fullKey)
          })
        } else {
          fields.push({ key: fullKey, value, type: fieldType, options })
        }
      }
    }
    
    // Handle different data types
    if (parsedData === null || parsedData === undefined) {
      console.log('Data is null or undefined')
      return { fields: [], originalData: parsedData }
    } else if (typeof parsedData === 'object' && !Array.isArray(parsedData)) {
      console.log('Processing object with keys:', Object.keys(parsedData))
      Object.entries(parsedData).forEach(([key, value]) => {
        processValue(key, value)
      })
    } else if (Array.isArray(parsedData)) {
      console.log('Processing array with length:', parsedData.length)
      parsedData.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          Object.entries(item).forEach(([key, value]) => {
            processValue(`[${index}].${key}`, value)
          })
        } else {
          processValue(`[${index}]`, item)
        }
      })
    } else {
      // Handle primitive values
      console.log('Processing primitive value:', parsedData)
      fields.push({ key: 'value', value: parsedData, type: typeof parsedData as any })
    }
    
    console.log('Generated fields:', fields)
    return { fields, originalData: parsedData }
  }

  // Function to reconstruct JSON from fields
  const reconstructJsonFromFields = (fields: JsonField[], originalData: any): any => {
    if (!fields.length) return originalData
    
    const result = JSON.parse(JSON.stringify(originalData)) // Deep clone
    
    fields.forEach(field => {
      const keys = field.key.split('.')
      let current = result
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i]
        const arrayMatch = key.match(/^(.+)\[(\d+)\]$/)
        
        if (arrayMatch) {
          const [, arrayKey, index] = arrayMatch
          if (!current[arrayKey]) current[arrayKey] = []
          if (!current[arrayKey][parseInt(index)]) current[arrayKey][parseInt(index)] = {}
          current = current[arrayKey][parseInt(index)]
        } else {
          if (!current[key]) current[key] = {}
          current = current[key]
        }
      }
      
      const lastKey = keys[keys.length - 1]
      const arrayMatch = lastKey.match(/^(.+)\[(\d+)\]$/)
      
      if (arrayMatch) {
        const [, arrayKey, index] = arrayMatch
        if (!current[arrayKey]) current[arrayKey] = []
        current[arrayKey][parseInt(index)] = field.value
      } else {
        current[lastKey] = field.value
      }
    })
    
    return result
  }

  // Update field value
  const updateFieldValue = (fields: JsonField[], setFields: React.Dispatch<React.SetStateAction<JsonField[]>>, key: string, value: any) => {
    const newFields = fields.map(field => 
      field.key === key ? { ...field, value } : field
    )
    setFields(newFields)
  }

  // Add/remove tag from multi-value field
  const toggleTag = (fields: JsonField[], setFields: React.Dispatch<React.SetStateAction<JsonField[]>>, key: string, tag: string) => {
    const newFields = fields.map(field => {
      if (field.key === key && field.isMultiValue) {
        const currentValues = Array.isArray(field.value) ? field.value : []
        const newValues = currentValues.includes(tag)
          ? currentValues.filter(v => v !== tag)
          : [...currentValues, tag]
        return { ...field, value: newValues }
      }
      return field
    })
    setFields(newFields)
  }

  // i18n helpers for dynamic JSON keys
  const sanitizeKeyForI18n = (key: string): string => {
    return key.replace(/\[\d+\]/g, '[]')
  }

  const lastSegment = (path: string): string => {
    const parts = path.split('.')
    return parts[parts.length - 1]
  }

  const prettyLabelFromKey = (key: string): string => {
    const cleaned = key.replace(/\[\]/g, '').replace(/\[\d+\]/g, '')
    return cleaned
      .split(/[\._-]/)
      .map((s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s))
      .join(' ')
  }

  const getFieldMeta = (fullKey: string): { label: string; description?: string } => {
    const sanitized = sanitizeKeyForI18n(fullKey)
    const last = lastSegment(sanitized)
    const pathBase = `storyEdit.jsonFields.paths.${sanitized}`
    const keyBase = `storyEdit.jsonFields.keys.${last}`
    const label =
      (has(`${pathBase}.label`) && t(`${pathBase}.label`)) ||
      (has(`${keyBase}.label`) && t(`${keyBase}.label`)) ||
      prettyLabelFromKey(last)
    const description =
      (has(`${pathBase}.description`) && t(`${pathBase}.description`)) ||
      (has(`${keyBase}.description`) && t(`${keyBase}.description`)) ||
      undefined
    return { label, description }
  }

  // Render enhanced field input based on type
  const renderFieldInput = (field: JsonField, fieldId: string, onUpdate: (value: any) => void) => {
    switch (field.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={fieldId}
              checked={field.value}
              onChange={(e) => onUpdate(e.target.checked)}
              className="rounded border border-input"
            />
            <label htmlFor={fieldId} className="text-sm">
              {field.value ? t('storyEdit.boolean.true') : t('storyEdit.boolean.false')}
            </label>
          </div>
        )

      case 'number':
        return (
          <Input
            id={fieldId}
            type="number"
            value={field.value}
            onChange={(e) => onUpdate(parseFloat(e.target.value) || 0)}
          />
        )

      case 'select':
        return (
          <Select value={field.value} onValueChange={onUpdate}>
            <SelectTrigger>
              <SelectValue placeholder={t('storyEdit.inputs.selectPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'tags':
      case 'multiselect':
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {Array.isArray(field.value) && field.value.map((tag, index) => (
                <Badge key={index} variant="secondary" className="cursor-pointer">
                  {tag}
                  <button
                    type="button"
                    onClick={() => {
                      const newValues = field.value.filter((_: any, i: number) => i !== index)
                      onUpdate(newValues)
                    }}
                    className="ml-1 text-xs"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            {field.options && field.options.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {field.options.map((option) => (
                  <Badge
                    key={option}
                    variant={Array.isArray(field.value) && field.value.includes(option) ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => {
                      const currentValues = Array.isArray(field.value) ? field.value : []
                      const newValues = currentValues.includes(option)
                        ? currentValues.filter(v => v !== option)
                        : [...currentValues, option]
                      onUpdate(newValues)
                    }}
                  >
                    {option}
                  </Badge>
                ))}
              </div>
            )}
            <Input
              placeholder={t('storyEdit.inputs.tagPlaceholder')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const input = e.target as HTMLInputElement
                  const newTag = input.value.trim()
                  if (newTag && !field.value.includes(newTag)) {
                    onUpdate([...field.value, newTag])
                    input.value = ''
                  }
                }
              }}
            />
          </div>
        )

      default:
        return (
          <Textarea
            id={fieldId}
            value={field.value}
            onChange={(e) => onUpdate(e.target.value)}
            rows={3}
          />
        )
    }
  }

  const handleUpdateSlideContext = async (slideId: string) => {
    const context = slideContexts[slideId]
    
    setSaving(true)
    try {
      const result = await updateSlide(slideId, { context })
      if (result) {
        toast.success(t('storyEdit.slidesTab.saveContextSuccess'))
        // Update story state to reflect the change
        setStory(prev => {
          if (!prev) return null
          const updatedSlides = prev.slides.map(s => 
            s.id === slideId ? { ...s, context: result.context } : s
          )
          return { ...prev, slides: updatedSlides }
        })
      } else {
        throw new Error('Failed to update slide')
      }
    } catch (error) {
      console.error('Error updating slide context:', error)
      toast.error(t('storyEdit.slidesTab.saveContextError'))
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    if (!story) return
    
    setSaving(true)
    try {
      // Reconstruct JSON data from fields
      const finalDataEn = finalDataEnFields.length > 0 
        ? reconstructJsonFromFields(finalDataEnFields, originalFinalDataEn)
        : originalFinalDataEn
      
      const qaLocalized = qaLocalizedFields.length > 0
        ? reconstructJsonFromFields(qaLocalizedFields, originalQaLocalized)
        : originalQaLocalized
      
      const response = await fetch(`/api/stories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          finalDataEn,
          qaLocalized
        }),
      })

      if (response.ok) {
        toast.success(t('storyEdit.successMessage'))
        router.push(`/stories/${id}`)
      } else {
        throw new Error(t('storyEdit.errorMessage'))
      }
    } catch (error) {
      toast.error(t('storyEdit.errorMessage'))
      console.error('Error saving story:', error)
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = () => {
    if (!story) return false
    
    const basicFieldsChanged = (
      story.title !== formData.title ||
      story.description !== formData.description ||
      story.deckType !== formData.deckType ||
      story.locale !== formData.locale ||
      story.brandColor !== formData.brandColor ||
      story.thumbnail !== formData.thumbnail
    )
    
    // Check if JSON fields have changes
    const finalDataChanged = finalDataEnFields.length > 0 && 
      JSON.stringify(reconstructJsonFromFields(finalDataEnFields, originalFinalDataEn)) !== JSON.stringify(originalFinalDataEn)
    
    const qaLocalizedChanged = qaLocalizedFields.length > 0 &&
      JSON.stringify(reconstructJsonFromFields(qaLocalizedFields, originalQaLocalized)) !== JSON.stringify(originalQaLocalized)
    
    return basicFieldsChanged || finalDataChanged || qaLocalizedChanged
  }

  if (loading) return <div className="container mx-auto max-w-5xl p-6">{t('stories.loading')}</div>
  if (error || !story) return notFound()

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {t('storyEdit.title')}
            {hasChanges() && <span className="ml-2 text-sm text-orange-600">{t('storyEdit.hasChanges')}</span>}
          </h1>
          <p className="text-sm text-muted-foreground">{t('storyEdit.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/stories/${story.id}`}>{t('storyEdit.cancel')}</Link>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setFormData({
                title: story.title || "",
                description: story.description || "",
                deckType: story.deckType || "",
                locale: story.locale || "",
                brandColor: story.brandColor || "",
                thumbnail: story.thumbnail || ""
              })
              
              // Reset JSON fields
              if (story.finalDataEn) {
                const parsedFinalData = parseJsonToFields(story.finalDataEn)
                setFinalDataEnFields(parsedFinalData.fields)
              } else {
                setFinalDataEnFields([])
              }
              
              if (story.qaLocalized) {
                const parsedQaData = parseJsonToFields(story.qaLocalized)
                setQaLocalizedFields(parsedQaData.fields)
              } else {
                setQaLocalizedFields([])
              }
            }}
          >
            {t('storyEdit.resetChanges')}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t('storyEdit.saving') : t('storyEdit.save')}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">{t('storyEdit.tabs.basic')}</TabsTrigger>
          <TabsTrigger value="slides">{t('storyEdit.tabs.slides')}</TabsTrigger>
          <TabsTrigger value="finalDataEn">{t('storyEdit.tabs.finalDataEn')}</TabsTrigger>
          <TabsTrigger value="qaLocalized">{t('storyEdit.tabs.qaLocalized')}</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">{t('storyEdit.fields.title.label')}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={t('storyEdit.fields.title.placeholder')}
                required
              />
              {story.title !== formData.title && (
                <div className="text-xs text-muted-foreground">
                  <strong>{t('storyEdit.fields.title.currentValue')}</strong> {story.title}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deckType">{t('storyEdit.fields.deckType.label')}</Label>
              <Input
                id="deckType"
                value={formData.deckType}
                onChange={(e) => setFormData(prev => ({ ...prev, deckType: e.target.value }))}
                placeholder={t('storyEdit.fields.deckType.placeholder')}
              />
              {story.deckType !== formData.deckType && story.deckType && (
                <div className="text-xs text-muted-foreground">
                  <strong>{t('storyEdit.fields.title.currentValue')}</strong> {story.deckType}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('storyEdit.fields.description.label')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t('storyEdit.fields.description.placeholder')}
              rows={4}
              required
            />
            {story.description !== formData.description && story.description && (
              <div className="text-xs text-muted-foreground">
                <strong>{t('storyEdit.fields.title.currentValue')}</strong> {story.description}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail">{t('storyEdit.fields.thumbnail.label')}</Label>
            <Input
              id="thumbnail"
              value={formData.thumbnail}
              onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
              placeholder={t('storyEdit.fields.thumbnail.placeholder')}
            />
            {story.thumbnail !== formData.thumbnail && story.thumbnail && (
              <div className="text-xs text-muted-foreground">
                <strong>{t('storyEdit.fields.title.currentValue')}</strong> {story.thumbnail}
              </div>
            )}
            {formData.thumbnail && (
              <div className="mt-2">
                <img 
                  src={formData.thumbnail} 
                  alt={t('storyEdit.fields.thumbnail.previewAlt')} 
                  className="h-20 w-32 object-cover rounded border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="locale">{t('storyEdit.fields.locale.label')}</Label>
              <Input
                id="locale"
                value={formData.locale}
                onChange={(e) => setFormData(prev => ({ ...prev, locale: e.target.value }))}
                placeholder={t('storyEdit.fields.locale.placeholder')}
              />
              {story.locale !== formData.locale && story.locale && (
                <div className="text-xs text-muted-foreground">
                  <strong>{t('storyEdit.fields.title.currentValue')}</strong> {story.locale}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="brandColor">{t('storyEdit.fields.brandColor.label')}</Label>
              <div className="flex gap-2">
                <Input
                  id="brandColor"
                  value={formData.brandColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, brandColor: e.target.value }))}
                  placeholder={t('storyEdit.fields.brandColor.placeholder')}
                />
                {formData.brandColor && (
                  <div 
                    className="h-10 w-10 rounded border"
                    style={{ backgroundColor: formData.brandColor }}
                  />
                )}
              </div>
              {story.brandColor !== formData.brandColor && story.brandColor && (
                <div className="text-xs text-muted-foreground">
                  <strong>{t('storyEdit.fields.title.currentValue')}</strong> {story.brandColor}
                </div>
              )}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('storyEdit.sections.additionalData.title')}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p><strong>{t('storyEdit.sections.additionalData.storyId')}</strong> {story.id}</p>
              <p><strong>{t('storyEdit.sections.additionalData.created')}</strong> {new Date(story.createdAt).toLocaleString()}</p>
              <p><strong>{t('storyEdit.sections.additionalData.updated')}</strong> {new Date(story.updatedAt).toLocaleString()}</p>
              {story.userId && <p><strong>{t('storyEdit.sections.additionalData.userId')}</strong> {story.userId}</p>}
              {story.projectId && <p><strong>{t('storyEdit.sections.additionalData.projectId')}</strong> {story.projectId}</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slides" className="space-y-6">
          <div className="space-y-4">
            {story.slides && story.slides.length > 0 ? (
              story.slides.map((slide) => {
                const originalSlide = story.slides.find(s => s.id === slide.id)
                const originalContext = originalSlide?.context ?? ''
                const currentContext = slideContexts[slide.id] ?? ''
                const hasContextChanged = originalContext !== currentContext

                return (
                  <Card key={slide.id}>
                    <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                      <div className="md:col-span-1 aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border">
                        <SlideViewer slide={slide as any} />
                      </div>
                      <div className="md:col-span-2 space-y-3">
                        <div className="flex justify-between items-start">
                           <h3 className="font-bold text-lg">{slide.title}</h3>
                           <Button asChild variant="outline" size="sm">
                             <Link href={`/editor/${story.id}?slide=${slide.id}`} target="_blank">{t('storyEdit.sections.slidesInfo.editSlides')}</Link>
                           </Button>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor={`context-${slide.id}`}>
                            {t('storyEdit.slidesTab.contextLabel')}
                          </Label>
                          <Textarea
                            id={`context-${slide.id}`}
                            value={currentContext}
                            onChange={(e) =>
                              setSlideContexts((prev) => ({
                                ...prev,
                                [slide.id]: e.target.value,
                              }))
                            }
                            placeholder={t('storyEdit.slidesTab.contextPlaceholder')}
                            rows={5}
                            className="text-sm"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Button
                            onClick={() => handleUpdateSlideContext(slide.id)}
                            disabled={!hasContextChanged || saving}
                            size="sm"
                          >
                            {saving ? t('storyEdit.saving') : t('storyEdit.slidesTab.saveContextButton')}
                          </Button>
                          {hasContextChanged && (
                             <Badge variant="outline" className="text-orange-600 border-orange-600">
                               {t('storyEdit.hasChanges')}
                             </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t('storyEdit.slidesTab.noSlides')}</p>
                 <Button asChild variant="outline" size="sm" className="mt-4">
                   <Link href={`/editor/${story.id}`}>{t('storyEdit.sections.slidesInfo.editSlides')}</Link>
                 </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="finalDataEn" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('storyEdit.sections.finalDataEn.title')}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {t('storyEdit.sections.finalDataEn.description')}
              </p>
            </CardHeader>
            <CardContent>
              {finalDataEnFields.length > 0 ? (
                <div className="space-y-4">
                  {finalDataEnFields.map((field, index) => {
                    const meta = getFieldMeta(field.key)
                    return (
                      <div key={index} className="space-y-2">
                        <Label htmlFor={`finalDataEn-${field.key}`}>
                          {meta.label}
                          <Badge variant="outline" className="ml-2 text-xs">
                            {t(`storyEdit.fieldTypes.${field.type}`)}
                          </Badge>
                        </Label>
                        {renderFieldInput(
                          field,
                          `finalDataEn-${field.key}`,
                          (value) => updateFieldValue(finalDataEnFields, setFinalDataEnFields, field.key, value)
                        )}
                        {meta.description && (
                          <p className="text-xs text-muted-foreground">{meta.description}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{t('storyEdit.sections.finalDataEn.noData')}</p>
                  <p className="text-xs">{t('storyEdit.sections.finalDataEn.noDataSubtext')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qaLocalized" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('storyEdit.sections.qaLocalized.title')}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {t('storyEdit.sections.qaLocalized.description')}
              </p>
            </CardHeader>
            <CardContent>
              {qaLocalizedFields.length > 0 ? (
                <div className="space-y-4">
                  {qaLocalizedFields.map((field, index) => {
                    const meta = getFieldMeta(field.key)
                    return (
                      <div key={index} className="space-y-2">
                        <Label htmlFor={`qaLocalized-${field.key}`}>
                          {meta.label}
                          <Badge variant="outline" className="ml-2 text-xs">
                            {t(`storyEdit.fieldTypes.${field.type}`)}
                          </Badge>
                        </Label>
                        {renderFieldInput(
                          field,
                          `qaLocalized-${field.key}`,
                          (value) => updateFieldValue(qaLocalizedFields, setQaLocalizedFields, field.key, value)
                        )}
                        {meta.description && (
                          <p className="text-xs text-muted-foreground">{meta.description}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{t('storyEdit.sections.qaLocalized.noData')}</p>
                  <p className="text-xs">{t('storyEdit.sections.qaLocalized.noDataSubtext')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
