'use client'

import { DAYS_OF_WEEK_IN_ORDER } from "@/constants"
import { timeToFloat } from "@/lib/utils"
import { scheduleFormSchema } from "@/schema/schedule"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "../ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { formatTimezoneOffset } from "@/lib/formatters"

// Define the Availability type
type Availability = {
    startTime: string
    endTime: string
    dayOfWeek: (typeof DAYS_OF_WEEK_IN_ORDER)[number]
    // If the [number] is not used, then referring to the entire array type, not the individual values inside it.
}

export function ScheduleForm({
    schedule,
}: {
    schedule?: {
        timezone: string
        availabilities: Availability[]
    }
}) {

    // Initialize form with validation schema and default values
    const form = useForm<z.infer<typeof scheduleFormSchema>>({
        resolver: zodResolver(scheduleFormSchema),
        defaultValues: {
            timezone:
                schedule?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
            availabilities: schedule?.availabilities.toSorted((a, b) => {
                return timeToFloat(a.startTime) - timeToFloat(b.startTime)
            }),
        },
    })

    // Manage dynamic form fields for availability using useField
    const {
        append: addAvailability, // Add a new availability entry
        remove: removeAvailability, // Remove availability entry
        fields: availabilityFields, // Current availability fields
    } = useFieldArray({ name: 'availabilities', control: form.control})

    // Group availability fields by day of the week for UI rendering
    const groupAvailabilityFields = Object.groupBy(
        availabilityFields.map((field, index) => ({ ...field, index })),
        availability => availability.dayOfWeek
    )

    return (
        <Form {...form}>
            <form 
                className='flex gap-6 flex-col'
                onSubmit={form.handleSubmit(onSubmit)}
            >
                {/* Show for-level error if any */}
                {form.formState.errors.root && (
                    <div className='text-destructive text-sm'>
                        {form.formState.errors.root.message}
                    </div>
                )}

                {/* Timezone selection */}
                <FormField
                    control={form.control}
                    name='timezone'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Timezone</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {Intl.supportedValuesOf('timeZone').map(timezone => (
                                        <SelectItem key={timezone} value={timezone}>
                                            {timezone}
                                            {` (${formatTimezoneOffset(timezone)})`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                >

                </FormField>

                {/* Availibility form grid grouped by day */}
                

                {/* Save button */}
            </form>
        </Form>
    )
}