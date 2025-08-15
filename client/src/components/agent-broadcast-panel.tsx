"use client"

import React from "react"
import { motion } from "framer-motion"
import { AgentInterface } from "@/components/agent-interface"

export function AgentBroadcastPanel(): React.ReactElement {
  return (
    <motion.div
      className="h-full w-full overflow-hidden"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="h-full w-full">
        <AgentInterface />
      </div>
    </motion.div>
  )
}


