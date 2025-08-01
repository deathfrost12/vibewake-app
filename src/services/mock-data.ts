// Generic mock data service for universal mobile app template
// All data is generic and suitable for any application type

export interface MockUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: 'free' | 'premium';
  joinedAt: string;
  lastActive: string;
  stats: {
    totalSessions: number;
    streakDays: number;
    completedTasks: number;
  };
}

export interface MockPost {
  id: string;
  title: string;
  content: string;
  category: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  tags: string[];
  metrics: {
    views: number;
    likes: number;
    shares: number;
  };
}

export interface MockCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  itemCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface MockNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

// Mock Users
export const MOCK_USERS: MockUser[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://i.pravatar.cc/150?u=1',
    plan: 'premium',
    joinedAt: '2024-01-15T10:00:00Z',
    lastActive: '2024-01-20T16:30:00Z',
    stats: {
      totalSessions: 45,
      streakDays: 7,
      completedTasks: 123,
    },
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    avatar: 'https://i.pravatar.cc/150?u=2',
    plan: 'free',
    joinedAt: '2024-02-01T14:30:00Z',
    lastActive: '2024-01-20T18:15:00Z',
    stats: {
      totalSessions: 23,
      streakDays: 3,
      completedTasks: 67,
    },
  },
];

// Mock Posts
export const MOCK_POSTS: MockPost[] = [
  {
    id: '1',
    title: 'Getting Started with Mobile Development',
    content:
      'A comprehensive guide to building your first mobile application using modern frameworks and best practices.',
    category: 'Development',
    author: {
      id: '1',
      name: 'John Doe',
      avatar: 'https://i.pravatar.cc/150?u=1',
    },
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
    isPublished: true,
    tags: ['mobile', 'development', 'tutorial'],
    metrics: {
      views: 1234,
      likes: 89,
      shares: 12,
    },
  },
  {
    id: '2',
    title: 'Advanced UI/UX Design Patterns',
    content:
      'Exploring modern design patterns and user experience principles for creating intuitive mobile interfaces.',
    category: 'Design',
    author: {
      id: '2',
      name: 'Jane Smith',
      avatar: 'https://i.pravatar.cc/150?u=2',
    },
    createdAt: '2024-01-12T14:20:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
    isPublished: true,
    tags: ['ui', 'ux', 'design', 'mobile'],
    metrics: {
      views: 856,
      likes: 67,
      shares: 8,
    },
  },
  {
    id: '3',
    title: 'Performance Optimization Techniques',
    content:
      'Best practices for optimizing mobile app performance, including memory management and efficient rendering.',
    category: 'Performance',
    author: {
      id: '1',
      name: 'John Doe',
      avatar: 'https://i.pravatar.cc/150?u=1',
    },
    createdAt: '2024-01-14T10:15:00Z',
    updatedAt: '2024-01-19T09:30:00Z',
    isPublished: true,
    tags: ['performance', 'optimization', 'mobile'],
    metrics: {
      views: 642,
      likes: 45,
      shares: 6,
    },
  },
];

// Mock Categories
export const MOCK_CATEGORIES: MockCategory[] = [
  {
    id: '1',
    name: 'Development',
    description: 'Mobile app development tutorials and guides',
    icon: 'code',
    color: '#3B82F6',
    itemCount: 15,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Design',
    description: 'UI/UX design principles and best practices',
    icon: 'palette',
    color: '#10B981',
    itemCount: 8,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Performance',
    description: 'App optimization and performance tips',
    icon: 'speedometer',
    color: '#F59E0B',
    itemCount: 12,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Testing',
    description: 'Testing strategies and quality assurance',
    icon: 'checkmark-circle',
    color: '#EF4444',
    itemCount: 6,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

// Mock Notifications
export const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: '1',
    title: 'Welcome to the App!',
    message:
      'Thank you for joining our community. Explore all the features available to you.',
    type: 'info',
    isRead: false,
    createdAt: '2024-01-20T10:00:00Z',
    actionUrl: '/onboarding',
  },
  {
    id: '2',
    title: 'New Feature Released',
    message:
      'Check out our latest feature that will help you be more productive.',
    type: 'success',
    isRead: false,
    createdAt: '2024-01-19T15:30:00Z',
    actionUrl: '/features',
  },
  {
    id: '3',
    title: 'Maintenance Scheduled',
    message: 'We will be performing maintenance on Sunday at 2 AM EST.',
    type: 'warning',
    isRead: true,
    createdAt: '2024-01-18T12:00:00Z',
  },
];

// Utility functions for accessing mock data
export const MockDataService = {
  getCurrentUser: (): MockUser => MOCK_USERS[0],

  getAllUsers: (): MockUser[] => MOCK_USERS,

  getUserById: (id: string): MockUser | undefined =>
    MOCK_USERS.find(user => user.id === id),

  getPosts: (limit?: number): MockPost[] =>
    limit ? MOCK_POSTS.slice(0, limit) : MOCK_POSTS,

  getPostById: (id: string): MockPost | undefined =>
    MOCK_POSTS.find(post => post.id === id),

  getPostsByCategory: (category: string): MockPost[] =>
    MOCK_POSTS.filter(post => post.category === category),

  getCategories: (): MockCategory[] => MOCK_CATEGORIES,

  getCategoryById: (id: string): MockCategory | undefined =>
    MOCK_CATEGORIES.find(category => category.id === id),

  getNotifications: (unreadOnly = false): MockNotification[] =>
    unreadOnly ? MOCK_NOTIFICATIONS.filter(n => !n.isRead) : MOCK_NOTIFICATIONS,

  getUserStats: () => ({
    totalUsers: MOCK_USERS.length,
    activeUsers: MOCK_USERS.filter(
      u =>
        new Date(u.lastActive) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
    premiumUsers: MOCK_USERS.filter(u => u.plan === 'premium').length,
  }),

  getPopularPosts: (limit = 3): MockPost[] =>
    [...MOCK_POSTS]
      .sort((a, b) => b.metrics.views - a.metrics.views)
      .slice(0, limit),
};

// Simulate async operations
export const delay = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

// Mock API service with simulated network delays
export const MockApiService = {
  async getUser(id: string): Promise<MockUser | null> {
    await delay(300);
    return MockDataService.getUserById(id) || null;
  },

  async getPosts(limit?: number): Promise<MockPost[]> {
    await delay(500);
    return MockDataService.getPosts(limit);
  },

  async getPost(id: string): Promise<MockPost | null> {
    await delay(200);
    return MockDataService.getPostById(id) || null;
  },

  async getCategories(): Promise<MockCategory[]> {
    await delay(400);
    return MockDataService.getCategories();
  },

  async createPost(
    post: Omit<MockPost, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>
  ): Promise<MockPost> {
    await delay(600);
    const newPost: MockPost = {
      ...post,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metrics: {
        views: 0,
        likes: 0,
        shares: 0,
      },
    };
    return newPost;
  },

  async updatePost(
    id: string,
    updates: Partial<MockPost>
  ): Promise<MockPost | null> {
    await delay(400);
    const post = MockDataService.getPostById(id);
    if (!post) return null;

    return {
      ...post,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  },

  async deletePost(id: string): Promise<boolean> {
    await delay(300);
    return MockDataService.getPostById(id) !== undefined;
  },

  async markNotificationAsRead(id: string): Promise<boolean> {
    await delay(200);
    return true;
  },
};
