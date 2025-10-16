import { DAYS_OF_WEEK_IN_ORDER } from "@/constants";
import { timeToFloat } from "@/lib/utils";
import { z } from "zod";

export const scheduleFormSchema = z.object({
    timezone: z.string().min(1, "Required"), // The timezone must be a string and cannot be empty
    availabilities: z // The 'availabilities' field is an array
    .array( // The array contains objects with specific properties
        z.object({
            dayOfWeek: z.enum(DAYS_OF_WEEK_IN_ORDER), // 'dayOfWeek' must be one of the days from the DAYS_OF_WEEK_IN_ORDER array
            startTime: z // 'startTime' must be a string that matches the HH:MM format (24-hour time)
                .string()
                .regex(
                    /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, // Regex pattern to match the time format
                    "Time must be in the format HH:MM" // Custom error message if the time doesn't match the pattern

                    // Valid Examples:
                    // 00:00

                    // 09:15

                    // 14:30

                    // 23:59

                    // Invalid Examples:
                    // 9:15 (hour must be two digits)

                    // 24:00 (24 is not valid in 24-hour format)

                    //12:60 (minutes can't be 60)
                ),
            endTime: z // 'endTime' must be a string that matches the HH:MM format (24-hour time)
                .string()
                .regex(
                    /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, // Regex pattern to match the time format
                    "Time must be in the format HH:MM" // Custom error message if the time doesn't match the pattern
                )
        })
    )

    // This ensures users can't submit overlapping or backward time ranges - like 2:00-1:00pm, or two blocks on the same day that conflicts.
    .superRefine((availabilities, ctx) => { // Custom refinement function to add additional validation
        availabilities.forEach((availability, index) => { // Loop through each availability in the array
            const overlaps = availabilities.some((a, i) => { // Check if there are any time overlaps with other availabilities
                return (
                    // Checking to see if times are overlapping on the same day. This will disregard overlapping times on different days.
                    i !== index && // Ensure it's not comparing the same item to itself
                    a.dayOfWeek === availability.dayOfWeek && // Check if it's the same day of the week
                    timeToFloat(a.startTime) < timeToFloat(availability.endTime) && // Check if the start time of one is before the end time of another
                    timeToFloat(a.endTime) > timeToFloat(availability.startTime) // Check if the end time of one is after the start time of another
                )

            })

            if (overlaps) { // If there is an overlap, add a validation issue
                ctx.addIssue({
                    code: 'custom', // Custom validation error code
                    message: 'Availability overlaps with another', // Custom error message
                    path: [index, 'startTime'], // This attaches error to startTime field
                })    
            }

            if (
                timeToFloat(availability.startTime) >= timeToFloat(availability.endTime) // Check if start time is greater than or equal to end time
            ) {
                ctx.addIssue({
                    code: 'custom', // Custom validation error code
                    message: 'End time must be after start time',
                    path: [index, 'endTime'], // This attaches error to endTime field
                })
            }

        })    
    })

})

