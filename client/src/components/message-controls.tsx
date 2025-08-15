import { useState } from "react"
import type { Message as MessageType } from "@/types"
import { Terminal } from "lucide-react"

import type { Conversation } from "@/lib/conversations"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Transcriber } from "@/components/ui/transcriber"
import { useTranslations } from "@/providers/translations-context"

function FilterControls({
  typeFilter,
  setTypeFilter,
  searchQuery,
  setSearchQuery,
  messageTypes,
  messages,
}: {
  typeFilter: string
  setTypeFilter: (value: string) => void
  searchQuery: string
  setSearchQuery: (value: string) => void
  messageTypes: string[]
  messages: MessageType[]
}) {
  const { t } = useTranslations()

  return (
    <div className="mb-4 flex gap-4">
      <Select value={typeFilter} onValueChange={setTypeFilter}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          {messageTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        placeholder={t("messageControls.search")}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1"
      />
      <Button variant="outline" onClick={() => console.log(messages)}>
        <Terminal />
        {t("messageControls.log")}
      </Button>
    </div>
  )
}

export function MessageControls({
  conversation,
  msgs,
}: {
  conversation: Conversation[]
  msgs: MessageType[]
}) {
  const { t } = useTranslations()
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  if (conversation.length === 0) return null

  // Get unique message types
  const messageTypes = ["all", ...new Set(msgs.map((msg) => msg.type))]

  // Filter messages based on type and search query
  const filteredMsgs = msgs.filter((msg) => {
    const matchesType = typeFilter === "all" || msg.type === typeFilter
    const matchesSearch =
      searchQuery === "" ||
      JSON.stringify(msg).toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{t("messageControls.logs")}</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              {t("messageControls.view")}
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-auto max-w-full overflow-y-auto p-4">
            <DialogHeader>
              <DialogTitle>{t("messageControls.logs")}</DialogTitle>
            </DialogHeader>
            <FilterControls
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              messageTypes={messageTypes}
              messages={filteredMsgs}
            />
            <div className="mt-4">
              <ScrollArea className="h-[80vh]">
                <Table className="max-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("messageControls.type")}</TableHead>
                      <TableHead>{t("messageControls.content")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMsgs.map((msg, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">
                          {msg.type}
                        </TableCell>
                        <TableCell className="max-w-full] font-mono text-sm break-words whitespace-pre-wrap">
                          {JSON.stringify(msg, null, 2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Transcriber conversation={conversation.slice(-1)} />
    </div>
  )
}
