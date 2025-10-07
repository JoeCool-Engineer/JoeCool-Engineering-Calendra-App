import { z } from "zod"

// Define a validation schema for the event form using Zod
export const eventFormSchema = z.object({
    // 'name' must be a string and is required (at least 2 characters)
    // Replace message with "Required" if message does not show up in the form, remove the curly braces 
    name: z.string().min(2, { message: "Event name must be at least 2 characters." }),

    // 'description' is an optional string field
    description: z.string().optional(),
    
    // 'isActive' is an optional boolean field with a default value of true
    isActive: z.boolean().default(true),
    
        // 'durationInMinutes' will be coerced (converted) to a number
        // It must be an interger, greater than 0, and less than or equal to 720 (12 hours)
        durationInMinutes: z.coerce
            .number()
            .int()
            .positive('Duration must be greater than 0.')
            .max(60 * 12, `Duration must be less than 12 hours (${60 * 12} minutes).`),
})