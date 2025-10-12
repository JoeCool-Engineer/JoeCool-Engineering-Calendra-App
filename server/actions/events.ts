'use server'  // Marks this file as a Server Action - required for Next.js App Router
import { db } from "@/drizzle/db";
import { EventTable } from "@/drizzle/schema";
import { eventFormSchema } from "@/schema/events"
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// This fuction creates a new event in the database after validating the input data
export async function createEvent(
    unsafeData: z.input<typeof eventFormSchema> // Accept raw event data (input) validated/coerced by the zod schema
): Promise<{ error: boolean } | undefined> {

        // Authenticate the user using Clerk's auth function
        const { userId } = await auth()
        // Validate the input data against the event form schema
        const { success, data } = eventFormSchema.safeParse(unsafeData)
        if (!success || !userId) {
            // throw new Error('Invalid event data or user not authenticated.')
            return { error: true }
        }

        // Insert the validated event data into the database, linking it to the authenticated user
        await db.insert(EventTable).values({ ...data, clerkUserId: userId })

        // Revalidate the '/events' path to ensure the page fetches fresh data  after the database operation
        revalidatePath('/events')

}


// This function updates an existing event in the database after validating the input and checking ownership
export async function updateEvent(
    id: string, // The ID of the event to update
    unsafeData: z.input<typeof eventFormSchema> // The new event data to update (input) validated/coerced by the zod schema
): Promise<void> {
    try {

        // Authenticate the user using Clerk's auth function
        const { userId } = await auth()
        // Validate the input data against the event form schema
        const { success, data } = eventFormSchema.safeParse(unsafeData)
        // If validation fails or user is not authenticated, throw an error
        if (!success || !userId) {
            throw new Error('Invalid event data or user not authenticated.')
        }

        // Attempt to update the event in the database
        const { rowCount } = await db 
            .update(EventTable)
            .set({...data}) // Update with validated data
            .where(and(eq(EventTable.id, id), // Ensure we are updating the correct event by ID
                eq(EventTable.clerkUserId, userId))) // Ensure the event belongs to the authenticated user

        // If no event was updated, ether not found or not owned by the user, throw an error
        if (rowCount === 0) {
            throw new Error('Event not found or you do not have permission to update it.')
        }

    } catch (error: any) {
        // If any error occurs, throw a new error with a readable message
        throw new Error(`Failed to update event: ${error.message || error}`)
    } finally {
        // Revalidate the '/events' path to ensure the page fetches fresh data after the database operation
        revalidatePath('/events')
    }
}

// This function deletes an existing event from the database after checking ownership
export async function deleteEvent(
    id: string // ID of the event to delete
): Promise<void> {
    try {
        // Authenticate the user using Clerk's auth function
        const { userId } = await auth()

        // If user is not authenticated, throw an error
        if (!userId) {
            throw new Error('User not authenticated.')
        }  
        
        // Attempt to delete the event from the database only if it belongs to the authenticated user
        const { rowCount } = await db
            .delete(EventTable)
            .where(and(eq(EventTable.id, id), eq(EventTable.clerkUserId, userId))) // Ensure the event belongs to the authenticated user

        // If no event was deleted, either not found or not owned by the user, throw an error
        if (rowCount === 0) {
            throw new Error('Event not found or you do not have permission to delete it.')
        }
    } catch (error: any) {
        // If any error occurs, throw a new error with a readable message
        throw new Error(`Failed to delete event: ${error.message || error}`)
    } finally {
        // Revalidate the '/events' path to ensure the page fetches fresh data after the database operation
        revalidatePath('/events')
    }
}

// Infer the type of a row from the EventTable schema
type EventRow = typeof EventTable.$inferSelect

// Async function to fetch all events (active and inactive) for specific user
export async function getEvents(clerkUserId: string): Promise<EventRow[]> {
    // Query the database for events belonging to the specified user
    const events = await db.query.EventTable.findMany({
        // where: this defines a filter (a WHERE clause) for your query.

        // ({ clerkUserId: userIdCol }, { eq }) => ... - This is a destructured function:

        // clerkUserId is a variable (likely passed in earlier to the query).

        // userIdCol is a reference to a column in your database (you're just renaming clerkUserId to userIdCol for clarity).
        where: ({ clerkUserId: userIdCol }, { eq }) => eq(userIdCol, clerkUserId),

        // Events are ordered alphatbetically (case-insensitive) by their title
        orderBy: ({ name }, { asc, sql }) => asc(sql`lower(${name})`),
    })
    // Return the full list of events
    return events
}

// Fetch a specific event for a given user
export async function getEvent(userId: string, eventId: string):
Promise<EventRow | undefined> {
    try {
        const event = await db.query.EventTable.findFirst({
            where: ({ id, clerkUserId }, { and, eq }) => 
                and(eq(clerkUserId, userId), eq(id, eventId)), // Make sure the event belongs to the user
        })

        return event ?? undefined
    } catch (error: any) {
        // Re-throw with context so runtime logs show the failing query parameters
        throw new Error(`Failed to run getEvent for userId=${userId}, eventId=${eventId}: ${error.message || error}`)
    }
}