export interface MasonicUser {
  id: string
  email: string
  displayName: string
  profileImage?: string
  logia?: string
  role: 'member' | 'admin'
  createdAt: number
}
