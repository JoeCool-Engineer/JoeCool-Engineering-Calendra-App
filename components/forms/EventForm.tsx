'use client' // Marks this file to be processed on the client side in Next.js

import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { eventFormSchema } from "@/schema/events"
import { zodResolver } from "@hookform/resolvers/zod"
import { Textarea } from "../ui/textarea"
import { Switch } from "../ui/switch"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog"
import { useTransition } from "react"
import { Button } from "../ui/button"
import Link from "next/link"
import { createEvent, deleteEvent, updateEvent } from "@/server/actions/events"


// Component to handle creating/editing/deleting an event
export default function EventForm({
    event, // Optional event prop for editing an existing event
}: {
    event?: { // Optional `event` object (might be undefined if creating a new event)
        id: string // Unique identifier for the event
        name: string // Name of the event
        description?: string // Optional description of the event
        durationInMinutes: number // Duration of the event in minutes
        isActive: boolean // Indicates if the event is active
    }
}) {

    /* 
    useTransition is a React hook that helps manage the state of transitions in async operations.
        It returns two values:
        1. `isDeletePending`: A boolean that tells us if the deletion is still in progress
        2. `startDeleteTransition`: This is a function we can use to start the aysync operation like deleting an event.
    */
    const [isDeletePending, startDeleteTransition] = useTransition()

    const form = useForm<z.input<typeof eventFormSchema>>({
        resolver: zodResolver(eventFormSchema), // Use Zod schema for form validation
        defaultValues: event 
        ? { 
            ...event, 
        } 
        : { 
            isActive: true,
            durationInMinutes: 30,
            description: '',
            name: '',
        },
    })

    // Function to handle form submission
    async function onSubmit(values: z.infer<typeof eventFormSchema>) {
        const action = event == null ? createEvent : updateEvent.bind(null, event.id)

        const data = await action(values) // Call the appropriate action (create or update)
        if (data?.error) {
            form.setError("root", { message: "There was an error saving your event. Please try again." })
        }    
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-6 flex-col">
                
                {/* Show root error if any */}
                {form.formState.errors.root && (
                    <div className="text-destructive text-sm">
                        {form.formState.errors.root.message}
                    </div>
                )}

                {/* Event Name Field */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Event Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormDescription>
                                The name users will see when booking
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                    {/* Duration Field */}
                <FormField
                    control={form.control}
                    name="durationInMinutes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Duration (in minutes)</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormDescription>
                                How long in minutes 
                                </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            
                {/* Description Field */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea className="resize-none" h-32 {...field} />
                            </FormControl>
                            <FormDescription>
                                Optional description to the event
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Toggle for Active Status */}
                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center gap-2">
                                <FormControl>
                                    <Switch
                                        checked={field.value} // Bind switch state to form field value
                                        onCheckedChange={field.onChange} // Update form field value on change
                                        />
                                </FormControl>
                                <FormLabel>Active</FormLabel>
                            </div>
                            <FormDescription>
                                Inactive events will not be visible for users to book
                            </FormDescription>
                        </FormItem>
                    )}
                />

                {/* Buttons section: Delete, Cancel, Save */}
                <div className="flex gap-2 justify-end">
                {/* Delete Button - only shows if editing existing event */}
                {event && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button 
                             className="cursor-pointer hover:scale-105 hover:bg-red-600"
                             variant='destructive'
                             disabled={isDeletePending || form.formState.isSubmitting}
                                >
                             Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to delete this event?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this event.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-red-500 hover:bg-red-700 cursor-pointer"
                                disabled={isDeletePending || form.formState.isSubmitting}
                                onClick={() => {
                                    // Start a React transition to keep the Ui responsive during the this async operation
                                    startDeleteTransition(async () => {
                                        try {
                                            // Attempt to delete the event by its ID
                                            await deleteEvent(event.id)
                                        } catch (error: any) {
                                            // If an error occurs, set it as a root error in the form state
                                            form.setError("root", {
                                                message: `There was an error deleting your event: ${error.message}`,
                                            })
                                        }
                                    })
                                    }}

                            >
                                Delete

                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}

                {/* Cancel Button - Resets the form to its initial state */}
                <Button
                    disabled={isDeletePending || form.formState.isSubmitting}
                    type="button"
                    asChild
                    variant='outline'
                >

                    <Link href="/events">Cancel</Link>
                </Button>

                {/* Save Button - Submits the form */}
                <Button
                    className="cursor-pointer hover:scale-105 bg-blue-400 hover:bg-blue-600"
                    disabled={isDeletePending || form.formState.isSubmitting}
                    type="submit"
                >
                    Save
                </Button>
                </div>
            </form>
        </Form>
    )
 
}