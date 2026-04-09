import { z } from 'zod'

// Zod schemas for pipeline validation
export const RoomProfileSchema = z.object({
  room_type: z.enum(['bedroom', 'living room', 'kitchen', 'office', 'dining', 'bathroom', 'other']),
  style: z.enum(['modern', 'minimalist', 'bohemian', 'industrial', 'farmhouse', 'luxury', 'eclectic', 'classic']),
  palette: z.array(z.string()).length(3),
  mood: z.enum(['warm', 'cool', 'energetic', 'calm', 'sophisticated']),
  lighting: z.enum(['natural-left', 'natural-right', 'natural-center', 'artificial-warm', 'artificial-cool']),
  floor_material: z.string(),
  wall_color: z.string(),
  existing_furniture: z.array(z.string()),
  missing_items: z.array(z.string()),
  style_notes: z.string(),
})

export type RoomProfile = z.infer<typeof RoomProfileSchema>

export const NormalizedMetadataSchema = z.object({
  original_width: z.number(),
  original_height: z.number(),
  processed_width: z.number(),
  processed_height: z.number(),
  scale_x: z.number(),
  scale_y: z.number(),
})

export type NormalizedMetadata = z.infer<typeof NormalizedMetadataSchema>

export const DetectedObjectSchema = z.object({
  name: z.string(),
  bbox: z.array(z.number()).length(4),
  confidence: z.number().optional(),
})

export type DetectedObject = z.infer<typeof DetectedObjectSchema>

export const PlacementSchema = z.object({
  product_id: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number().default(0),
  depth_zone: z.enum(['near', 'mid', 'far']),
  scale_factor: z.number(),
  shadow_intensity: z.number(),
})

export type Placement = z.infer<typeof PlacementSchema>

export const DesignConceptSchema = z.object({
  title: z.string(),
  description: z.string(),
  placement_plan: z.array(PlacementSchema),
  budget_total: z.number(),
  estimated_furniture_count: z.number(),
})

export type DesignConcept = z.infer<typeof DesignConceptSchema>
