// Data store for application state
// In a real application, this would connect to a backend API

export interface Pickup {
  id: string
  userId: string
  userName: string
  address: string
  lat: number
  lng: number
  type: string
  quantity: number
  status: "Requested" | "Assigned" | "On the Way" | "Picked Up" | "Delivered"
  collectorId?: string
  collectorName?: string
  requestedDate: string
  assignedDate?: string
  pickedUpDate?: string
  deliveredDate?: string
  photoProof?: string
}

export interface Donation {
  id: string
  donorId: string
  donorName: string
  ngoId: string
  item: string
  quantity: number
  address: string
  lat: number
  lng: number
  status: "Pending" | "Accepted" | "Declined" | "Completed"
  date: string
  pickupDate?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: "citizen" | "admin" | "collector" | "ngo"
  address?: string
  lat?: number
  lng?: number
  stats?: {
    totalPickups?: number
    wasteCollected?: number
    co2Saved?: number
    greenPoints?: number
  }
}

export interface NGO {
  id: string
  name: string
  email: string
  address: string
  lat: number
  lng: number
  description: string
  acceptedWasteTypes: string[]
  inventory: InventoryItem[]
}

export interface InventoryItem {
  id: string
  item: string
  quantity: number
  date: string
  unit: string
}

// Sample data - replace with API calls in production
let pickups: Pickup[] = [
  {
    id: "P001",
    userId: "U001",
    userName: "John Doe",
    address: "123 Green Street, Eco City",
    lat: 51.505,
    lng: -0.09,
    type: "E-Waste",
    quantity: 15,
    status: "Delivered",
    collectorId: "C001",
    collectorName: "Mike Johnson",
    requestedDate: "2025-10-18T09:00:00",
    assignedDate: "2025-10-18T11:30:00",
    pickedUpDate: "2025-10-20T09:15:00",
    deliveredDate: "2025-10-20T11:00:00",
  },
  {
    id: "P002",
    userId: "U004",
    userName: "Jane Smith",
    address: "456 Oak Avenue, Eco City",
    lat: 51.51,
    lng: -0.1,
    type: "Plastic",
    quantity: 8,
    status: "Assigned",
    collectorId: "C002",
    collectorName: "Sarah Lee",
    requestedDate: "2025-10-21T10:00:00",
    assignedDate: "2025-10-21T11:00:00",
  },
  {
    id: "P003",
    userId: "U005",
    userName: "Bob Wilson",
    address: "789 Pine Road, Eco City",
    lat: 51.49,
    lng: -0.08,
    type: "Metal",
    quantity: 25,
    status: "On the Way",
    collectorId: "C001",
    collectorName: "Mike Johnson",
    requestedDate: "2025-10-22T08:00:00",
    assignedDate: "2025-10-22T09:00:00",
  },
]

let donations: Donation[] = [
  {
    id: "DON-001",
    donorId: "U001",
    donorName: "John Doe",
    ngoId: "NGO-001",
    item: "Aluminum Cans",
    quantity: 50,
    address: "123 Green Street",
    lat: 51.505,
    lng: -0.09,
    status: "Pending",
    date: "2025-10-20",
  },
  {
    id: "DON-002",
    donorId: "U004",
    donorName: "Jane Smith",
    ngoId: "NGO-001",
    item: "Plastic Bottles",
    quantity: 30,
    address: "456 Oak Avenue",
    lat: 51.51,
    lng: -0.1,
    status: "Pending",
    date: "2025-10-18",
  },
  {
    id: "DON-003",
    donorId: "U005",
    donorName: "Bob Wilson",
    ngoId: "NGO-001",
    item: "Electronic Waste",
    quantity: 20,
    address: "789 Pine Road",
    lat: 51.49,
    lng: -0.08,
    status: "Accepted",
    date: "2025-10-15",
    pickupDate: "2025-10-16",
  },
]

// Note: Users are now managed via Supabase authentication
// This in-memory store is kept for backward compatibility only
let users: User[] = []

// Note: NGOs are now managed via Supabase
// This in-memory store is kept for backward compatibility only
let ngos: NGO[] = []

// Pickup operations
export const getPickups = (): Pickup[] => pickups

export const getPickupById = (id: string): Pickup | undefined => pickups.find((p) => p.id === id)

export const getPickupsByUserId = (userId: string): Pickup[] => pickups.filter((p) => p.userId === userId)

export const getPickupsByCollectorId = (collectorId: string): Pickup[] =>
  pickups.filter((p) => p.collectorId === collectorId)

export const addPickup = (pickup: Pickup): void => {
  pickups.push(pickup)
}

export const updatePickup = (id: string, updates: Partial<Pickup>): boolean => {
  const index = pickups.findIndex((p) => p.id === id)
  if (index !== -1) {
    pickups[index] = { ...pickups[index], ...updates }
    return true
  }
  return false
}

export const deletePickup = (id: string): boolean => {
  const index = pickups.findIndex((p) => p.id === id)
  if (index !== -1) {
    pickups.splice(index, 1)
    return true
  }
  return false
}

// Donation operations
export const getDonations = (): Donation[] => donations

export const getDonationsByNGO = (ngoId: string): Donation[] => donations.filter((d) => d.ngoId === ngoId)

export const getDonationsByDonor = (donorId: string): Donation[] => donations.filter((d) => d.donorId === donorId)

export const addDonation = (donation: Donation): void => {
  donations.push(donation)
}

export const updateDonation = (id: string, updates: Partial<Donation>): boolean => {
  const index = donations.findIndex((d) => d.id === id)
  if (index !== -1) {
    donations[index] = { ...donations[index], ...updates }
    return true
  }
  return false
}

// User operations
export const getUsers = (): User[] => users

export const getUserById = (id: string): User | undefined => users.find((u) => u.id === id)

export const getUsersByRole = (role: string): User[] => users.filter((u) => u.role === role)

export const addUser = (user: User): void => {
  users.push(user)
}

export const updateUser = (id: string, updates: Partial<User>): boolean => {
  const index = users.findIndex((u) => u.id === id)
  if (index !== -1) {
    users[index] = { ...users[index], ...updates }
    return true
  }
  return false
}

export const deleteUser = (id: string): boolean => {
  const index = users.findIndex((u) => u.id === id)
  if (index !== -1) {
    users.splice(index, 1)
    return true
  }
  return false
}

// NGO operations
export const getNGOs = (): NGO[] => ngos

export const getNGOById = (id: string): NGO | undefined => ngos.find((n) => n.id === id)

export const updateNGOInventory = (ngoId: string, item: InventoryItem): boolean => {
  const ngo = ngos.find((n) => n.id === ngoId)
  if (ngo) {
    ngo.inventory.push(item)
    return true
  }
  return false
}

// Analytics
export const getSystemStats = () => {
  const totalPickups = pickups.length
  const activePickups = pickups.filter((p) => p.status !== "Delivered").length
  const totalWasteCollected = pickups.reduce((sum, p) => sum + p.quantity, 0)
  const totalCO2Saved = totalWasteCollected * 1.5 // Example calculation
  const totalDonations = donations.length
  const pendingDonations = donations.filter((d) => d.status === "Pending").length

  return {
    totalPickups,
    activePickups,
    totalWasteCollected,
    totalCO2Saved,
    totalDonations,
    pendingDonations,
    totalUsers: users.length,
    totalNGOs: ngos.length,
  }
}
