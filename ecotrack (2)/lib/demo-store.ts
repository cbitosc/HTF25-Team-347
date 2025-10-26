// Shared demo data store for all demo accounts
// This allows data to be shared across citizen, collector, ngo, and admin accounts

export interface DemoUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'citizen' | 'collector' | 'ngo' | 'admin';
}

export interface Pickup {
  id: string;
  userId: string;
  userName: string;
  type: string;
  weight: number;
  status: 'pending' | 'scheduled' | 'collected' | 'completed';
  scheduledDate?: string;
  address: string;
  collectorId?: string;
  collectorName?: string;
  createdAt: string;
}

export interface Donation {
  id: string;
  userId: string;
  userName: string;
  ngoId: string;
  ngoName: string;
  amount: number;
  message?: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  type: 'pickup' | 'donation' | 'collection' | 'user_action';
  description: string;
  timestamp: string;
}

// Demo accounts
export const DEMO_USERS: DemoUser[] = [
  {
    id: 'user-citizen-1',
    email: 'citizen@demo.com',
    password: 'demo123',
    name: 'John Citizen',
    role: 'citizen',
  },
  {
    id: 'user-collector-1',
    email: 'collector@demo.com',
    password: 'demo123',
    name: 'Mike Collector',
    role: 'collector',
  },
  {
    id: 'user-ngo-1',
    email: 'ngo@demo.com',
    password: 'demo123',
    name: 'Green Earth NGO',
    role: 'ngo',
  },
  {
    id: 'user-admin-1',
    email: 'admin@demo.com',
    password: 'demo123',
    name: 'Admin User',
    role: 'admin',
  },
];

// Initialize demo data
export function initializeDemoData() {
  if (typeof window === 'undefined') return;

  // Initialize only if not already set
  if (!localStorage.getItem('demo_pickups')) {
    const initialPickups: Pickup[] = [
      {
        id: 'pickup-1',
        userId: 'user-citizen-1',
        userName: 'John Citizen',
        type: 'Plastic',
        weight: 5,
        status: 'pending',
        address: '123 Main St, City',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    localStorage.setItem('demo_pickups', JSON.stringify(initialPickups));
  }

  if (!localStorage.getItem('demo_donations')) {
    const initialDonations: Donation[] = [];
    localStorage.setItem('demo_donations', JSON.stringify(initialDonations));
  }

  if (!localStorage.getItem('demo_activities')) {
    const initialActivities: Activity[] = [
      {
        id: 'activity-1',
        userId: 'user-citizen-1',
        userName: 'John Citizen',
        type: 'pickup',
        description: 'Scheduled a plastic waste pickup (5kg)',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    localStorage.setItem('demo_activities', JSON.stringify(initialActivities));
  }
}

// Pickups operations
export function getPickups(): Pickup[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('demo_pickups');
  return data ? JSON.parse(data) : [];
}

export function addPickup(pickup: Omit<Pickup, 'id' | 'createdAt'>): Pickup {
  const pickups = getPickups();
  const newPickup: Pickup = {
    ...pickup,
    id: `pickup-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  pickups.push(newPickup);
  localStorage.setItem('demo_pickups', JSON.stringify(pickups));

  // Add activity
  addActivity({
    userId: pickup.userId,
    userName: pickup.userName,
    type: 'pickup',
    description: `Scheduled a ${pickup.type} waste pickup (${pickup.weight}kg)`,
  });

  return newPickup;
}

export function updatePickup(id: string, updates: Partial<Pickup>): void {
  const pickups = getPickups();
  const index = pickups.findIndex((p) => p.id === id);
  if (index !== -1) {
    pickups[index] = { ...pickups[index], ...updates };
    localStorage.setItem('demo_pickups', JSON.stringify(pickups));

    // Add activity for status changes
    if (updates.status === 'collected') {
      addActivity({
        userId: updates.collectorId || '',
        userName: updates.collectorName || 'Collector',
        type: 'collection',
        description: `Collected ${pickups[index].type} waste from ${pickups[index].userName}`,
      });
    }
  }
}

export function deletePickup(id: string): void {
  const pickups = getPickups();
  const filtered = pickups.filter((p) => p.id !== id);
  localStorage.setItem('demo_pickups', JSON.stringify(filtered));
}

// Donations operations
export function getDonations(): Donation[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('demo_donations');
  return data ? JSON.parse(data) : [];
}

export function addDonation(donation: Omit<Donation, 'id' | 'createdAt'>): Donation {
  const donations = getDonations();
  const newDonation: Donation = {
    ...donation,
    id: `donation-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  donations.push(newDonation);
  localStorage.setItem('demo_donations', JSON.stringify(donations));

  // Add activity
  addActivity({
    userId: donation.userId,
    userName: donation.userName,
    type: 'donation',
    description: `Donated $${donation.amount} to ${donation.ngoName}`,
  });

  return newDonation;
}

export function updateDonation(id: string, updates: Partial<Donation>): void {
  const donations = getDonations();
  const index = donations.findIndex((d) => d.id === id);
  if (index !== -1) {
    donations[index] = { ...donations[index], ...updates };
    localStorage.setItem('demo_donations', JSON.stringify(donations));
  }
}

// Activities operations
export function getActivities(): Activity[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('demo_activities');
  return data ? JSON.parse(data) : [];
}

export function addActivity(activity: Omit<Activity, 'id' | 'timestamp'>): void {
  const activities = getActivities();
  const newActivity: Activity = {
    ...activity,
    id: `activity-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  activities.unshift(newActivity); // Add to beginning
  // Keep only last 100 activities
  if (activities.length > 100) {
    activities.pop();
  }
  localStorage.setItem('demo_activities', JSON.stringify(activities));
}

// User operations
export function getCurrentUser(): DemoUser | null {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem('currentUser');
  return userData ? JSON.parse(userData) : null;
}

export function setCurrentUser(user: DemoUser | null): void {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
}

export function authenticateUser(email: string, password: string): DemoUser | null {
  const user = DEMO_USERS.find((u) => u.email === email && u.password === password);
  if (user) {
    setCurrentUser(user);
    return user;
  }
  return null;
}

export function logoutUser(): void {
  setCurrentUser(null);
}
