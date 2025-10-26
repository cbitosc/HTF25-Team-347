import { supabase } from "./client"
import type { Database } from "./database.types"

// Type aliases for convenience
type Pickup = Database["public"]["Tables"]["pickups"]["Row"]
type PickupInsert = Database["public"]["Tables"]["pickups"]["Insert"]
type PickupUpdate = Database["public"]["Tables"]["pickups"]["Update"]

type Donation = Database["public"]["Tables"]["donations"]["Row"]
type DonationInsert = Database["public"]["Tables"]["donations"]["Insert"]
type DonationUpdate = Database["public"]["Tables"]["donations"]["Update"]

type User = Database["public"]["Tables"]["users"]["Row"]
type UserInsert = Database["public"]["Tables"]["users"]["Insert"]
type UserUpdate = Database["public"]["Tables"]["users"]["Update"]

type UserStats = Database["public"]["Tables"]["user_stats"]["Row"]

type NGO = Database["public"]["Tables"]["ngos"]["Row"]
type NGOInsert = Database["public"]["Tables"]["ngos"]["Insert"]

type InventoryItem = Database["public"]["Tables"]["ngo_inventory"]["Row"]
type InventoryItemInsert = Database["public"]["Tables"]["ngo_inventory"]["Insert"]

type Schedule = Database["public"]["Tables"]["schedules"]["Row"]
type ScheduleInsert = Database["public"]["Tables"]["schedules"]["Insert"]

// ============= PICKUP OPERATIONS =============

export async function getPickups(): Promise<Pickup[]> {
  const { data, error } = await supabase.from("pickups").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getPickupById(id: string): Promise<Pickup | null> {
  const { data, error } = await supabase.from("pickups").select("*").eq("id", id).single()

  if (error) throw error
  return data
}

export async function getPickupsByUserId(userId: string): Promise<Pickup[]> {
  const { data, error } = await supabase
    .from("pickups")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getPickupsByCollectorId(collectorId: string): Promise<Pickup[]> {
  const { data, error } = await supabase
    .from("pickups")
    .select("*")
    .eq("collector_id", collectorId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function addPickup(pickup: PickupInsert): Promise<Pickup> {
  const { data, error } = await supabase.from("pickups").insert(pickup as any).select().single()

  if (error) throw error
  return data as Pickup
}

export async function updatePickup(id: string, updates: PickupUpdate): Promise<Pickup> {
  // @ts-expect-error - Supabase type inference issue
  const { data, error } = await supabase.from("pickups").update(updates as any).eq("id", id).select().single()

  if (error) {
    console.error('Pickup Update Error:', {
      code: error.code,
      message: error.message,
      details: error.details,
      pickupId: id,
      updates
    })
    throw error
  }
  
  const pickup = data as Pickup
  // Update user stats when pickup is delivered
  if (updates.status === "Delivered" && pickup && pickup.user_id) {
    await incrementUserStats(pickup.user_id, pickup.quantity)
  }
  
  return pickup
}

export async function deletePickup(id: string): Promise<void> {
  const { error } = await supabase.from("pickups").delete().eq("id", id)

  if (error) throw error
}

// ============= DONATION OPERATIONS =============

export async function getDonations(): Promise<Donation[]> {
  const { data, error } = await supabase.from("donations").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getDonationsByNGO(ngoId: string): Promise<Donation[]> {
  const { data, error } = await supabase
    .from("donations")
    .select("*")
    .eq("ngo_id", ngoId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getDonationsByDonor(donorId: string): Promise<Donation[]> {
  const { data, error } = await supabase
    .from("donations")
    .select("*")
    .eq("donor_id", donorId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function addDonation(donation: DonationInsert): Promise<Donation> {
  const { data, error } = await supabase.from("donations").insert(donation as any).select().single()

  if (error) throw error
  return data as Donation
}

export async function updateDonation(id: string, updates: DonationUpdate): Promise<Donation> {
  // @ts-expect-error - Supabase type inference issue
  const { data, error } = await supabase.from("donations").update(updates as any).eq("id", id).select().single()

  if (error) throw error
  const donation = data as Donation
  // If donation is accepted, reflect donated items into the NGO inventory
  if (updates.status === "Accepted" && donation && donation.ngo_id) {
    try {
      await updateNGOInventory(donation.ngo_id, {
        ngo_id: donation.ngo_id,
        item: donation.item,
        quantity: donation.quantity,
        date: new Date().toISOString().split("T")[0],
        unit: "kg",
      })
    } catch (invErr: any) {
      // Log detailed error but don't block the donation update result
      console.error("Failed to update NGO inventory after donation accepted:", {
        error: invErr,
        message: invErr?.message,
        code: invErr?.code,
        details: invErr?.details,
        donationId: donation.id,
        ngoId: donation.ngo_id
      })
    }
  }
  return donation
}

// ============= USER OPERATIONS =============

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase.from("users").select("*")

  if (error) throw error
  return data || []
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

  if (error) throw error
  return data
}

export async function getUsersByRole(role: string): Promise<User[]> {
  const { data, error } = await supabase.from("users").select("*").eq("role", role)

  if (error) throw error
  return data || []
}

export async function addUser(user: UserInsert): Promise<User> {
  const { data, error } = await supabase.from("users").insert(user as any).select().single()

  if (error) throw error
  
  const newUser = data as User
  // Create initial stats for citizen users
  if (newUser && newUser.role === "citizen") {
    await supabase.from("user_stats").insert({
      user_id: newUser.id,
      total_pickups: 0,
      waste_collected: 0,
      co2_saved: 0,
      green_points: 0,
    } as any)
  }
  
  return newUser
}

export async function updateUser(id: string, updates: UserUpdate): Promise<User> {
  // @ts-expect-error - Supabase type inference issue
  const { data, error } = await supabase.from("users").update(updates as any).eq("id", id).select().single()

  if (error) throw error
  return data as User
}

export async function deleteUser(id: string): Promise<void> {
  const { error } = await supabase.from("users").delete().eq("id", id)

  if (error) throw error
}

// ============= USER STATS OPERATIONS =============

export async function getUserStats(userId: string): Promise<UserStats | null> {
  const { data, error } = await supabase.from("user_stats").select("*").eq("user_id", userId).single()

  if (error) {
    if (error.code === "PGRST116") return null // Not found
    throw error
  }
  return data
}

async function incrementUserStats(userId: string, wasteAmount: number): Promise<void> {
  const stats = await getUserStats(userId)
  
  if (stats) {
    const updateData = {
      total_pickups: stats.total_pickups + 1,
      waste_collected: Number(stats.waste_collected) + wasteAmount,
      co2_saved: Number(stats.co2_saved) + wasteAmount * 1.5,
      green_points: stats.green_points + Math.floor(wasteAmount * 10),
    }
    // @ts-expect-error - Supabase type inference issue
    await supabase
      .from("user_stats")
      .update(updateData as any)
      .eq("user_id", userId)
  }
}

// ============= NGO OPERATIONS =============

export async function getNGOs(): Promise<NGO[]> {
  const { data, error } = await supabase.from("ngos").select("*")

  if (error) throw error
  return data || []
}

export async function getNGOById(id: string): Promise<(NGO & { inventory: InventoryItem[] }) | null> {
  const { data: ngo, error: ngoError } = await supabase.from("ngos").select("*").eq("id", id).single()

  if (ngoError) throw ngoError
  if (!ngo) return null

  const { data: inventory, error: invError } = await supabase
    .from("ngo_inventory")
    .select("*")
    .eq("ngo_id", id)
    .order("created_at", { ascending: false })

  if (invError) throw invError

  return {
    ...(ngo as NGO),
    inventory: inventory || [],
  } as NGO & { inventory: InventoryItem[] }
}

export async function addNGO(ngo: NGOInsert): Promise<NGO> {
  const { data, error } = await supabase.from("ngos").insert(ngo as any).select().single()

  if (error) throw error
  return data as NGO
}

export async function updateNGOInventory(ngoId: string, item: InventoryItemInsert): Promise<InventoryItem> {
  // Generate UUID for the inventory item
  const inventoryItem = {
    ...item,
    id: crypto.randomUUID(),
  }
  
  const { data, error } = await supabase.from("ngo_inventory").insert(inventoryItem as any).select().single()

  if (error) {
    console.error('NGO Inventory Insert Error:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    })
    throw error
  }
  return data as InventoryItem
}

// ============= NGO MATERIALS OPERATIONS =============

export async function getNGOMaterials(ngoId: string) {
  const { data, error } = await supabase
    .from("ngo_materials")
    .select("*")
    .eq("ngo_id", ngoId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function addNGOMaterial(material: {
  ngo_id: string;
  material_type: string;
  weight: number;
  source: string;
  notes?: string;
}) {
  const { data, error } = await supabase
    .from("ngo_materials")
    .insert(material as any)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============= SCHEDULE OPERATIONS =============

export async function getSchedulesByUserId(userId: string): Promise<Schedule[]> {
  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .eq("user_id", userId)
    .order("next_pickup", { ascending: true })

  if (error) throw error
  return data || []
}

export async function addSchedule(schedule: ScheduleInsert): Promise<Schedule> {
  const { data, error } = await supabase.from("schedules").insert(schedule as any).select().single()

  if (error) throw error
  return data as Schedule
}

export async function updateSchedule(id: string, updates: Partial<Schedule>): Promise<Schedule> {
  // @ts-expect-error - Supabase type inference issue
  const { data, error } = await supabase.from("schedules").update(updates as any).eq("id", id).select().single()

  if (error) throw error
  return data as Schedule
}

export async function deleteSchedule(id: string): Promise<void> {
  const { error } = await supabase.from("schedules").delete().eq("id", id)

  if (error) throw error
}

// ============= ANALYTICS =============

export async function getSystemStats() {
  const [pickupsData, donationsData, usersData, ngosData] = await Promise.all([
    supabase.from("pickups").select("quantity, status"),
    supabase.from("donations").select("status"),
    supabase.from("users").select("id"),
    supabase.from("ngos").select("id"),
  ])

  const pickups = pickupsData.data || []
  const donations = donationsData.data || []

  const totalPickups = pickups.length
  const activePickups = pickups.filter((p: any) => p.status !== "Delivered").length
  const totalWasteCollected = pickups.reduce((sum: number, p: any) => sum + Number(p.quantity), 0)
  const totalCO2Saved = totalWasteCollected * 1.5
  const totalDonations = donations.length
  const pendingDonations = donations.filter((d: any) => d.status === "Pending").length

  return {
    totalPickups,
    activePickups,
    totalWasteCollected,
    totalCO2Saved,
    totalDonations,
    pendingDonations,
    totalUsers: usersData.data?.length || 0,
    totalNGOs: ngosData.data?.length || 0,
  }
}

// ============= REAL-TIME SUBSCRIPTIONS =============

export function subscribeToPickups(callback: (payload: any) => void) {
  return supabase
    .channel("pickups-channel")
    .on("postgres_changes", { event: "*", schema: "public", table: "pickups" }, callback)
    .subscribe()
}

export function subscribeToDonations(callback: (payload: any) => void) {
  return supabase
    .channel("donations-channel")
    .on("postgres_changes", { event: "*", schema: "public", table: "donations" }, callback)
    .subscribe()
}

export function subscribeToUserStats(userId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`user-stats-${userId}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "user_stats", filter: `user_id=eq.${userId}` },
      callback
    )
    .subscribe()
}
