import { Award, Group, User } from '../types';

// Mock Users
export const mockUsers: User[] = [
  { id: '1', name: 'Gabriel', avatar: undefined },
  { id: '2', name: 'María', avatar: undefined },
  { id: '3', name: 'Carlos', avatar: undefined },
  { id: '4', name: 'Ana', avatar: undefined },
  { id: '5', name: 'Pedro', avatar: undefined },
  { id: '6', name: 'Laura', avatar: undefined },
  { id: '7', name: 'David', avatar: undefined },
  { id: '8', name: 'Sofía', avatar: undefined },
];

// Current user (simulated logged in user)
export const currentUser: User = mockUsers[0];

// Mock Groups
export const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Los Cracks',
    description: 'El grupo de amigos del instituto',
    icon: '🏆',
    memberCount: 8,
    inviteCode: 'CRACK2024',
    createdAt: new Date('2024-01-15'),
    members: mockUsers.map((user, index) => ({
      userId: user.id,
      user,
      role: index === 0 ? 'admin' : 'member',
      joinedAt: new Date('2024-01-15'),
    })),
    awards: [
      {
        id: 'a1',
        groupId: '1',
        name: 'Mejor Amigo del Año',
        description: 'El que siempre está ahí',
        icon: '🌟',
        status: 'active',
        createdAt: new Date('2024-11-01'),
        createdBy: '1',
        nominees: [
          { userId: '2', user: mockUsers[1] },
          { userId: '3', user: mockUsers[2] },
          { userId: '4', user: mockUsers[3] },
        ],
      },
      {
        id: 'a2',
        groupId: '1',
        name: 'Más Gracioso',
        description: 'El payaso del grupo',
        icon: '😂',
        status: 'draft',
        createdAt: new Date('2024-11-05'),
        createdBy: '1',
        nominees: [
          { userId: '3', user: mockUsers[2] },
          { userId: '5', user: mockUsers[4] },
        ],
      },
      {
        id: 'a3',
        groupId: '1',
        name: 'MVP del Año',
        description: 'Most Valuable Person',
        icon: '🏅',
        status: 'active',
        createdAt: new Date('2024-11-10'),
        createdBy: '1',
        nominees: [
          { userId: '1', user: mockUsers[0] },
          { userId: '2', user: mockUsers[1] },
          { userId: '6', user: mockUsers[5] },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Familia García',
    description: 'Premios navideños familiares',
    icon: '🎄',
    memberCount: 5,
    inviteCode: 'FAMILIA24',
    createdAt: new Date('2024-06-01'),
    members: mockUsers.slice(0, 5).map((user, index) => ({
      userId: user.id,
      user,
      role: index === 0 ? 'admin' : 'member',
      joinedAt: new Date('2024-06-01'),
    })),
    awards: [],
  },
];

// Helper function to get a group by ID
export const getGroupById = (id: string): Group | undefined => {
  return mockGroups.find(group => group.id === id);
};

// Helper function to get awards for a group
export const getAwardsByGroupId = (groupId: string): Award[] => {
  const group = getGroupById(groupId);
  return group?.awards || [];
};
