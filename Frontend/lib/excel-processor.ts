// Utility to parse Excel files and extract participant data
// In a real app, you would use a library like xlsx or exceljs

export interface Participant {
  name: string
  email: string
  availability: {
    day: string
    timeSlots: string[]
  }[]
}

// Mock implementation - In production, use xlsx library
export const parseExcelFile = async (file: File): Promise<Participant[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const lines = content.split("\n")
        const participants: Participant[] = []

        // Skip header row and parse data
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue

          // Expected format: Name, Email, Availability (JSON string)
          const [name, email, availabilityStr] = line.split(",").map((s) => s.trim())

          if (name && email) {
            participants.push({
              name,
              email,
              availability: availabilityStr
                ? JSON.parse(availabilityStr)
                : [{ day: "Monday-Friday", timeSlots: ["18:00-20:00"] }],
            })
          }
        }

        resolve(participants)
      } catch (error) {
        reject(new Error("Error processing Excel file"))
      }
    }

    reader.onerror = () => {
      reject(new Error("Error reading file"))
    }

    reader.readAsText(file)
  })
}

export interface Group {
  name: string
  players: string[]
}

// Algorithm to create balanced groups
export const generateGroups = (participants: Participant[], numberOfGroups: number): Group[] => {
  const groups: Group[] = []
  const playersPerGroup = Math.ceil(participants.length / numberOfGroups)

  // Initialize groups
  for (let i = 0; i < numberOfGroups; i++) {
    groups.push({
      name: String.fromCharCode(65 + i), // A, B, C, etc.
      players: [],
    })
  }

  // Distribute players round-robin style for balance
  participants.forEach((participant, index) => {
    const groupIndex = index % numberOfGroups
    groups[groupIndex].players.push(participant.name)
  })

  return groups
}

export interface Match {
  id: string
  group: string
  player1: string
  player2: string
  date: string
  time: string
  court: string
  status: "Pendiente"
}

// Generate matches for round-robin format
export const generateRoundRobinSchedule = (
  groups: Group[],
  startDate: Date,
  availability: Map<string, string[]>,
): Match[] => {
  const matches: Match[] = []
  let matchId = 1
  const currentDate = new Date(startDate)
  const courts = ["Cancha 1", "Cancha 2", "Cancha 3"]
  const timeSlots = ["10:00", "12:00", "14:00", "16:00", "18:00"]

  groups.forEach((group) => {
    const players = group.players
    let timeSlotIndex = 0
    let courtIndex = 0

    // Generate all combinations of matches for the group
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const player1 = players[i]
        const player2 = players[j]

        // Check availability
        const commonTime = findCommonAvailability(
          availability.get(player1) || [],
          availability.get(player2) || [],
          currentDate,
        )

        matches.push({
          id: `m${matchId}`,
          group: `Grupo ${group.name}`,
          player1,
          player2,
          date: formatDate(currentDate),
          time: commonTime || timeSlots[timeSlotIndex % timeSlots.length],
          court: courts[courtIndex % courts.length],
          status: "Pendiente",
        })

        matchId++
        timeSlotIndex++
        courtIndex++

        // Move to next day every 4 matches
        if (matchId % 4 === 0) {
          currentDate.setDate(currentDate.getDate() + 1)
        }
      }
    }
  })

  return matches
}

// Helper to find common availability between two players
const findCommonAvailability = (avail1: string[], avail2: string[], date: Date): string => {
  const common = avail1.filter((time) => avail2.includes(time))
  return common.length > 0 ? common[0] : "18:00"
}

// Helper to format date
const formatDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
  return date.toLocaleDateString("es-ES", options)
}
