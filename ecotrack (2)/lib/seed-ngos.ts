import { supabase } from "./supabase/client"

// Sample NGOs with realistic coordinates (London area)
const sampleNGOs = [
  {
    id: "NGO-001",
    name: "Green Earth Foundation",
    email: "contact@greenearth.org",
    address: "123 Eco Street, London, UK",
    lat: 51.5074,
    lng: -0.1278,
    description: "Dedicated to recycling and environmental sustainability",
    accepted_waste_types: ["Plastic", "Metal", "Paper", "Glass"],
  },
  {
    id: "NGO-002",
    name: "Eco Warriors",
    email: "info@ecowarriors.org",
    address: "456 Recycle Ave, London, UK",
    lat: 51.5155,
    lng: -0.0922,
    description: "Fighting pollution through active recycling programs",
    accepted_waste_types: ["Plastic", "E-Waste", "Metal"],
  },
  {
    id: "NGO-003",
    name: "Recycle Now Initiative",
    email: "hello@recyclenow.org",
    address: "789 Green Road, London, UK",
    lat: 51.4975,
    lng: -0.1357,
    description: "Community-driven recycling and waste management",
    accepted_waste_types: ["Paper", "Glass", "Plastic", "Metal", "E-Waste"],
  },
]

export async function seedNGOs() {
  console.log("Starting NGO seeding...")
  
  for (const ngo of sampleNGOs) {
    try {
      // Check if NGO already exists
      const { data: existing } = await supabase
        .from("ngos")
        .select("id")
        .eq("id", ngo.id)
        .single()
      
      if (existing) {
        console.log(`NGO ${ngo.id} already exists, skipping...`)
        continue
      }
      
      // Insert NGO
      const { error } = await supabase.from("ngos").insert(ngo as any)
      
      if (error) {
        console.error(`Failed to insert NGO ${ngo.id}:`, error)
      } else {
        console.log(`Successfully inserted NGO ${ngo.id}`)
      }
    } catch (err) {
      console.error(`Error processing NGO ${ngo.id}:`, err)
    }
  }
  
  console.log("NGO seeding completed!")
}

// Run if executed directly
if (typeof window === "undefined") {
  seedNGOs().then(() => {
    console.log("Done!")
    process.exit(0)
  }).catch((err) => {
    console.error("Seeding failed:", err)
    process.exit(1)
  })
}
