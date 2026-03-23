export interface Producer {
  id: string
  name: string
  farmName: string
  location: string
  coordinates: {
    lat: number
    lng: number
  }
  certifications: string[]
  category: string
  batches: Batch[]
  products: Product[]
}

export interface Batch {
  id: string
  code: string
  productName: string
  fabricationDate: string
  registeredAt: string
  fabricationPlace: string
  tags: string[]
}

export interface Product {
  id: string
  name: string
  description: string
  unit: string
  packageSize: string
  available: boolean
}

export interface Location {
  id: string
  name: string
  type: string
  distanceKm: number
  coordinates: {
    lat: number
    lng: number
  }
}

export interface FAQItem {
  id: string
  question: string
  answer: string
}
