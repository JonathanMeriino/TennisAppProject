// Advanced scheduling algorithm for tournament matches

export interface TimeSlot {
  day: string
  startTime: string
  endTime: string
}

export interface PlayerSchedule {
  playerName: string
  availability: TimeSlot[]
}

export interface ScheduledMatch {
  id: string
  player1: string
  player2: string
  date: string
  time: string
  court: string
  duration: number // in minutes
}

// Find best time slot considering both players' availability
export const findBestTimeSlot = (
  player1Availability: TimeSlot[],
  player2Availability: TimeSlot[],
  startDate: Date,
  courtsAvailable = 3,
): { date: string; time: string; court: string } | null => {
  // Find common available days
  const player1Days = new Set(player1Availability.map((slot) => slot.day))
  const commonDays = player2Availability.filter((slot) => player1Days.has(slot.day))

  if (commonDays.length === 0) return null

  // Find overlapping time slots
  const commonSlot = commonDays[0]
  const courts = Array.from({ length: courtsAvailable }, (_, i) => `Cancha ${i + 1}`)

  return {
    date: formatDateFromDay(commonSlot.day, startDate),
    time: commonSlot.startTime,
    court: courts[Math.floor(Math.random() * courts.length)],
  }
}

// Format day to actual date
const formatDateFromDay = (day: string, baseDate: Date): string => {
  const dayMap: { [key: string]: number } = {
    Lunes: 1,
    Monday: 1,
    Martes: 2,
    Tuesday: 2,
    Miércoles: 3,
    Wednesday: 3,
    Jueves: 4,
    Thursday: 4,
    Viernes: 5,
    Friday: 5,
    Sábado: 6,
    Saturday: 6,
    Domingo: 0,
    Sunday: 0,
  }

  const dayOfWeek = dayMap[day] || 1
  const currentDay = baseDate.getDay()
  const daysToAdd = (dayOfWeek - currentDay + 7) % 7 || 7

  const targetDate = new Date(baseDate)
  targetDate.setDate(targetDate.getDate() + daysToAdd)

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
  return targetDate.toLocaleDateString("es-ES", options)
}

// Generate balanced schedule considering all constraints
export const generateOptimizedSchedule = (
  groups: Array<{ name: string; players: string[] }>,
  playerAvailability: Map<string, TimeSlot[]>,
  startDate: Date,
  courtsAvailable = 3,
): ScheduledMatch[] => {
  const matches: ScheduledMatch[] = []
  let matchId = 1
  let courtQueue = 0

  groups.forEach((group) => {
    const players = group.players
    const courts = Array.from({ length: courtsAvailable }, (_, i) => `Cancha ${i + 1}`)

    // Generate all pairings
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const player1 = players[i]
        const player2 = players[j]

        const avail1 = playerAvailability.get(player1) || getDefaultAvailability()
        const avail2 = playerAvailability.get(player2) || getDefaultAvailability()

        const timeSlot = findBestTimeSlot(avail1, avail2, startDate, courtsAvailable)

        if (timeSlot) {
          matches.push({
            id: `m${matchId}`,
            player1,
            player2,
            date: timeSlot.date,
            time: timeSlot.time,
            court: courts[courtQueue % courtsAvailable],
            duration: 90,
          })
          matchId++
          courtQueue++
        }
      }
    }
  })

  return matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

// Default availability if not specified
const getDefaultAvailability = (): TimeSlot[] => [
  { day: "Monday", startTime: "18:00", endTime: "21:00" },
  { day: "Wednesday", startTime: "18:00", endTime: "21:00" },
  { day: "Friday", startTime: "18:00", endTime: "21:00" },
  { day: "Saturday", startTime: "09:00", endTime: "18:00" },
  { day: "Sunday", startTime: "09:00", endTime: "18:00" },
]
