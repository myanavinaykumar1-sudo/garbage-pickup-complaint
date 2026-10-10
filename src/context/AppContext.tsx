import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
  Priority,
  SanitationWorker,
  User,
  UserRole,
  NotificationItem,
  TimelineEvent,
  ComplaintLocation,
} from '../types';
import {
  INITIAL_COMPLAINTS,
  MOCK_USERS,
  MOCK_WORKERS,
  INITIAL_NOTIFICATIONS,
  COMPLAINT_CATEGORIES,
} from '../data/mockData';

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
}

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  complaints: Complaint[];
  workers: SanitationWorker[];
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Modals & Selection
  selectedComplaintId: string | null;
  setSelectedComplaintId: (id: string | null) => void;
  isNewComplaintModalOpen: boolean;
  setIsNewComplaintModalOpen: (open: boolean) => void;
  assignTargetComplaint: Complaint | null;
  setAssignTargetComplaint: (c: Complaint | null) => void;
  resolveTargetComplaint: Complaint | null;
  setResolveTargetComplaint: (c: Complaint | null) => void;
  isSchemaModalOpen: boolean;
  setIsSchemaModalOpen: (open: boolean) => void;

  // Actions
  addComplaint: (data: {
    category: ComplaintCategory;
    description: string;
    location: ComplaintLocation;
    imageUrl: string;
    priority: Priority;
  }) => string;
  assignWorkerToComplaint: (complaintId: string, workerId: string, priority?: Priority) => void;
  updateComplaintStatus: (complaintId: string, newStatus: ComplaintStatus, note: string) => void;
  resolveComplaint: (complaintId: string, resolutionNotes: string, resolutionImageUrl: string) => void;
  submitFeedback: (complaintId: string, rating: number, comment: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  resetToDemoData: () => void;
  exportDataJson: () => void;
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  COMPLAINTS: 'cleancity_complaints_v1',
  WORKERS: 'cleancity_workers_v1',
  NOTIFICATIONS: 'cleancity_notifications_v1',
  USER_ROLE: 'cleancity_user_role_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedRole = localStorage.getItem(STORAGE_KEYS.USER_ROLE) as UserRole | null;
    if (savedRole) {
      const match = MOCK_USERS.find((u) => u.role === savedRole);
      if (match) return match;
    }
    return MOCK_USERS[0];
  });

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored complaints', e);
    }
    return INITIAL_COMPLAINTS;
  });

  const [workers, setWorkers] = useState<SanitationWorker[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WORKERS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored workers', e);
    }
    return MOCK_WORKERS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse notifications', e);
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [isNewComplaintModalOpen, setIsNewComplaintModalOpen] = useState(false);
  const [assignTargetComplaint, setAssignTargetComplaint] = useState<Complaint | null>(null);
  const [resolveTargetComplaint, setResolveTargetComplaint] = useState<Complaint | null>(null);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, currentUser.role);
  }, [currentUser]);

  const showToast = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'alert' = 'info') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const switchRole = (role: UserRole) => {
    const targetUser = MOCK_USERS.find((u) => u.role === role) || MOCK_USERS[0];
    setCurrentUser(targetUser);
    showToast('Role Switched', `Now viewing as ${targetUser.name} (${role.toUpperCase()})`, 'info');
  };

  const addComplaint = (data: {
    category: ComplaintCategory;
    description: string;
    location: ComplaintLocation;
    imageUrl: string;
    priority: Priority;
  }): string => {
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `CC-2026-${randNum}`;
    const nowIso = new Date().toISOString();
    const categoryObj = COMPLAINT_CATEGORIES.find((c) => c.id === data.category);

    const initialTimeline: TimelineEvent = {
      id: `tl-${Date.now()}-1`,
      status: 'Pending',
      timestamp: nowIso,
      actor: currentUser.name,
      actorRole: 'Citizen',
      note: 'Complaint registered and submitted to municipal queue.',
    };

    const newComplaint: Complaint = {
      id: newId,
      citizenId: currentUser.id,
      citizenName: currentUser.name,
      citizenPhone: currentUser.phone,
      category: data.category,
      categoryLabel: categoryObj ? categoryObj.label : 'Garbage Issue',
      description: data.description,
      location: data.location,
      imageUrl: data.imageUrl,
      status: 'Pending',
      priority: data.priority,
      createdAt: nowIso,
      updatedAt: nowIso,
      timeline: [initialTimeline],
    };

    setComplaints((prev) => [newComplaint, ...prev]);

    // Create notifications for citizen and admin
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      title: 'Complaint Registered Successfully',
      message: `Your complaint ${newId} has been logged in ${data.location.area}.`,
      complaintId: newId,
      timestamp: nowIso,
      read: false,
      type: 'status_change',
    };

    setNotifications((prev) => [newNotif, ...prev]);
    showToast('Complaint Submitted', `Complaint ID ${newId} generated successfully.`, 'success');

    return newId;
  };

  const assignWorkerToComplaint = (complaintId: string, workerId: string, priority?: Priority) => {
    const worker = workers.find((w) => w.id === workerId);
    if (!worker) return;

    const nowIso = new Date().toISOString();

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;

        const newTimelineEvent: TimelineEvent = {
          id: `tl-${Date.now()}`,
          status: 'Assigned',
          timestamp: nowIso,
          actor: currentUser.name,
          actorRole: 'Municipal Administrator',
          note: `Assigned to ${worker.name} (${worker.vehicleType} - ${worker.vehicleNumber})`,
        };

        return {
          ...c,
          status: 'Assigned',
          priority: priority || c.priority,
          assignedWorkerId: worker.id,
          assignedWorkerName: worker.name,
          assignedWorkerVehicle: worker.vehicleNumber,
          assignedAt: nowIso,
          updatedAt: nowIso,
          timeline: [...c.timeline, newTimelineEvent],
        };
      })
    );

    // Update worker workload stats
    setWorkers((prev) =>
      prev.map((w) => (w.id === workerId ? { ...w, activeComplaints: w.activeComplaints + 1 } : w))
    );

    // Add notification
    const assignmentNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: worker.id,
      title: 'New Complaint Assignment',
      message: `Complaint ${complaintId} has been assigned to you.`,
      complaintId: complaintId,
      timestamp: nowIso,
      read: false,
      type: 'assignment',
    };
    setNotifications((prev) => [assignmentNotif, ...prev]);

    showToast('Task Assigned', `Assigned ${complaintId} to ${worker.name}.`, 'success');
  };

  const updateComplaintStatus = (complaintId: string, newStatus: ComplaintStatus, note: string) => {
    const nowIso = new Date().toISOString();

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;

        const newTimelineEvent: TimelineEvent = {
          id: `tl-${Date.now()}`,
          status: newStatus,
          timestamp: nowIso,
          actor: currentUser.name,
          actorRole: currentUser.role === 'admin' ? 'Municipal Administrator' : 'Sanitation Worker',
          note: note || `Status updated to ${newStatus}`,
        };

        return {
          ...c,
          status: newStatus,
          updatedAt: nowIso,
          timeline: [...c.timeline, newTimelineEvent],
        };
      })
    );

    const updateNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: 'user-c1',
      title: `Complaint Status: ${newStatus}`,
      message: `Complaint ${complaintId} is now ${newStatus}.`,
      complaintId: complaintId,
      timestamp: nowIso,
      read: false,
      type: 'status_change',
    };
    setNotifications((prev) => [updateNotif, ...prev]);
    showToast('Status Updated', `${complaintId} updated to ${newStatus}.`, 'info');
  };

  const resolveComplaint = (
    complaintId: string,
    resolutionNotes: string,
    resolutionImageUrl: string
  ) => {
    const nowIso = new Date().toISOString();

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;

        const newTimelineEvent: TimelineEvent = {
          id: `tl-${Date.now()}`,
          status: 'Resolved',
          timestamp: nowIso,
          actor: currentUser.name,
          actorRole: currentUser.role === 'worker' ? 'Sanitation Worker' : 'Municipal Administrator',
          note: resolutionNotes || 'Cleanup operations completed and verified.',
          photoUrl: resolutionImageUrl,
        };

        return {
          ...c,
          status: 'Resolved',
          resolvedAt: nowIso,
          updatedAt: nowIso,
          resolutionNotes,
          resolutionImageUrl,
          timeline: [...c.timeline, newTimelineEvent],
        };
      })
    );

    // Update worker stats if assigned
    setWorkers((prev) =>
      prev.map((w) => {
        const c = complaints.find((x) => x.id === complaintId);
        if (c && c.assignedWorkerId === w.id) {
          return {
            ...w,
            activeComplaints: Math.max(0, w.activeComplaints - 1),
            completedComplaints: w.completedComplaints + 1,
          };
        }
        return w;
      })
    );

    const resNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: 'user-c1',
      title: 'Complaint Resolved 🎉',
      message: `Complaint ${complaintId} has been resolved! Please share your rating.`,
      complaintId: complaintId,
      timestamp: nowIso,
      read: false,
      type: 'resolution',
    };
    setNotifications((prev) => [resNotif, ...prev]);
    showToast('Resolved!', `Complaint ${complaintId} marked as resolved with completion photo.`, 'success');
  };

  const submitFeedback = (complaintId: string, rating: number, comment: string) => {
    const nowIso = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;
        return {
          ...c,
          feedback: {
            rating,
            comment,
            submittedAt: nowIso,
          },
        };
      })
    );
    showToast('Feedback Received', `Thank you! Rated ${rating}/5 stars.`, 'success');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const resetToDemoData = () => {
    setComplaints(INITIAL_COMPLAINTS);
    setWorkers(MOCK_WORKERS);
    setNotifications(INITIAL_NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.COMPLAINTS);
    localStorage.removeItem(STORAGE_KEYS.WORKERS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    showToast('Reset Complete', 'Restored pristine sample data with 7 complaints and 4 workers.', 'info');
  };

  const exportDataJson = () => {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      complaints,
      workers,
      notifications,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cleancity-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data Exported', 'CleanCity dataset exported as JSON.', 'success');
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        complaints,
        workers,
        notifications,
        unreadNotificationCount,
        searchQuery,
        setSearchQuery,
        activeTab,
        setActiveTab,
        selectedComplaintId,
        setSelectedComplaintId,
        isNewComplaintModalOpen,
        setIsNewComplaintModalOpen,
        assignTargetComplaint,
        setAssignTargetComplaint,
        resolveTargetComplaint,
        setResolveTargetComplaint,
        isSchemaModalOpen,
        setIsSchemaModalOpen,
        addComplaint,
        assignWorkerToComplaint,
        updateComplaintStatus,
        resolveComplaint,
        submitFeedback,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resetToDemoData,
        exportDataJson,
        toasts,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
