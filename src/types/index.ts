export type UserRole = 'citizen' | 'admin' | 'worker';

export type ComplaintCategory =
  | 'not_collected'
  | 'overflowing_bins'
  | 'missed_schedule'
  | 'illegal_dumping'
  | 'vehicle_not_arriving';

export type ComplaintStatus = 'Pending' | 'Assigned' | 'In Progress' | 'Resolved';

export type Priority = 'Low' | 'Medium' | 'High' | 'Emergency';

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface ComplaintLocation {
  street: string;
  area: string;
  postalCode: string;
  landmark?: string;
  lat: number;
  lng: number;
}

export interface TimelineEvent {
  id: string;
  status: ComplaintStatus;
  timestamp: string;
  actor: string;
  actorRole: string;
  note: string;
  photoUrl?: string;
}

export interface CitizenFeedback {
  rating: number; // 1 - 5
  comment: string;
  submittedAt: string;
}

export interface Complaint {
  id: string; // e.g., CC-2026-1042
  citizenId: string;
  citizenName: string;
  citizenPhone: string;
  category: ComplaintCategory;
  categoryLabel: string;
  description: string;
  location: ComplaintLocation;
  imageUrl: string;
  status: ComplaintStatus;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  assignedWorkerVehicle?: string;
  assignedAt?: string;
  resolutionNotes?: string;
  resolutionImageUrl?: string;
  resolvedAt?: string;
  timeline: TimelineEvent[];
  feedback?: CitizenFeedback;
}

export interface SanitationWorker {
  id: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  vehicleType: string;
  zone: string;
  activeComplaints: number;
  completedComplaints: number;
  rating: number;
  avatar: string;
  status: 'Available' | 'On Duty' | 'Off Duty';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  ward?: string;
  badgeNumber?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  complaintId: string;
  timestamp: string;
  read: boolean;
  type: 'status_change' | 'assignment' | 'resolution' | 'system';
}

export interface WardHotspot {
  area: string;
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  primaryIssue: string;
  riskLevel: 'Low' | 'Moderate' | 'Critical';
}
