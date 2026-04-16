export interface Player {
  id: string
  name: string
  email: string
  avatar?: string
  score: number
  gamesPlayed: number
  gamesWon: number
  createdAt: number
}

export interface PlayerStats {
  totalGames: number
  wins: number
  losses: number
  draws: number
  winRate: number
  averageScore: number
}
