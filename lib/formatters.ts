// Formats a duration in minutes into a readable string like "1 hr 30 mins"
export function formatEventDescription(durationInMinutes: number) : string {
    const hours = Math.floor(durationInMinutes / 60) // Calculate whole hours
    const minutes = durationInMinutes % 60 // Calculate remaining minutes

    // Format minutes string (e.g., "1 min" or  "30 mins")
    const minutesStr = minutes > 0 ? `${minutes} min${minutes !== 1 ? 's' : ''}` : ''
    // Format hours string (e.g., "1 hr" or "2 hrs")
    const hoursStr = hours > 0 ? `${hours} hr${hours !== 1 ? 's' : ''}` : ''

    // Return only minutes if there are no hours
    if (hours === 0) return minutesStr
    // Return only hours if there are no minutes
    if (minutes === 0) return hoursStr
    // Return combined hours and minutes if both are present
    return `${hoursStr} ${minutesStr}`
}

// Gets the short offset string for a given timezone, like "+2:00"
export function formatTimezoneOffset(timezone: string) {
    return new Intl.DateTimeFormat(undefined, {
        timeZone: timezone,
        timeZoneName: 'shortOffset', // Request the short offset string
    })
    .formatToParts(new Date()) //Format the current date into parts
    .find(part => part.type == 'timeZoneName')?.value // Extract the timezone offset part
}