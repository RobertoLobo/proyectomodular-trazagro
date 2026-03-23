import { mockProducers, mockNearbyLocations, mockFAQs } from "./mock-data"
import type { Producer, Location, FAQItem, Batch } from "./types"

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchProducerByBatchCode(
  batchCode: string,
): Promise<{ producer: Producer; batch: Batch } | null> {
  await delay(500)

  for (const producer of mockProducers) {
    const batch = producer.batches.find((b) => b.code === batchCode)
    if (batch) {
      return { producer, batch }
    }
  }

  return null
}

export async function fetchProducerById(producerId: string): Promise<Producer | null> {
  await delay(300)
  return mockProducers.find((p) => p.id === producerId) || null
}

export async function fetchAllProducers(): Promise<Producer[]> {
  await delay(400)
  return mockProducers
}

export async function fetchNearbyStores(): Promise<Location[]> {
  await delay(300)
  return mockNearbyLocations
}

export async function fetchFAQItems(): Promise<FAQItem[]> {
  await delay(200)
  return mockFAQs
}
