"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { fetchFAQItems } from "@/lib/api"
import type { FAQItem } from "@/lib/types"

export function AboutScreen() {
  const [faqs, setFaqs] = useState<FAQItem[]>([])

  useEffect(() => {
    async function loadFAQs() {
      const data = await fetchFAQItems()
      setFaqs(data)
    }
    loadFAQs()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border">
        <div className="max-w-lg mx-auto p-6 space-y-4">
          <div className="flex flex-col items-center gap-4">
            <Image src="/logo.png" alt="TrazAgro Logo" width={200} height={100} className="object-contain" />
            <p className="text-sm text-muted-foreground text-center">{"Trace it. Trust it."}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8 space-y-6 pb-24">
        <div className="text-center space-y-3">
          <h2 className="text-xl font-bold text-balance">{"Transparencia en cada paso"}</h2>
          <p className="text-muted-foreground text-balance">
            {"Conectamos productores y consumidores con información confiable sobre el origen de los alimentos."}
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card
              key={faq.id}
              className="p-6 space-y-3 rounded-2xl hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="flex items-start gap-4">
                <Avatar className="h-8 w-8 bg-primary/10 text-primary rounded-full">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {index + 1}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2 flex-1">
                  <h3 className="font-semibold text-lg">{faq.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Mission statement */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 rounded-2xl">
          <div className="space-y-3 text-center">
            <div className="flex justify-center">
              <div className="bg-white rounded-2xl p-3 shadow-sm">
                <Image src="/logo.png" alt="TrazAgro" width={60} height={30} className="object-contain" />
              </div>
            </div>
            <h3 className="font-bold text-lg">{"Nuestra misión"}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {
                "Crear un ecosistema transparente donde cada producto cuenta su historia, desde la semilla hasta tu mesa."
              }
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
