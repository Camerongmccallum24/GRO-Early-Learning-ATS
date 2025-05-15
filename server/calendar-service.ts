import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { format } from 'date-fns';

// Configure Google OAuth2 client
const oauth2Client = new OAuth2Client(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground' // Redirect URL for dev
);

// Set refresh token for auth
oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

// Create Calendar API client
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// Interface for an interview
interface InterviewEvent {
  id?: string;
  candidateId: number;
  applicationId: number;
  candidateName: string;
  candidateEmail: string;
  interviewerName: string;
  interviewerEmail: string;
  position: string;
  startDateTime: Date;
  endDateTime: Date;
  location?: string;
  videoLink?: string;
  isVideoInterview: boolean;
  notes?: string;
}

// Get calendar list (useful for debugging)
export async function listCalendars() {
  try {
    const res = await calendar.calendarList.list();
    return res.data.items;
  } catch (error) {
    console.error('Error listing calendars:', error);
    throw error;
  }
}

// Check if a time slot is available
export async function checkAvailability(startDateTime: Date, endDateTime: Date): Promise<boolean> {
  try {
    const calendarId = 'primary';
    
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startDateTime.toISOString(),
        timeMax: endDateTime.toISOString(),
        items: [{ id: calendarId }]
      }
    });

    const busySlots = response.data.calendars?.primary?.busy || [];
    
    // If there are no busy slots, the time is available
    return busySlots.length === 0;
  } catch (error) {
    console.error('Error checking availability:', error);
    return false;
  }
}

// List available time slots for a given date (9 AM to A PM, 30-minute intervals)
export async function getAvailableTimeSlots(date: Date): Promise<{time: string, available: boolean}[]> {
  try {
    // Create a new date object with the same day but set time to start of day
    const startOfDay = new Date(date);
    startOfDay.setHours(9, 0, 0, 0); // Start at 9 AM
    
    const endOfDay = new Date(date);
    endOfDay.setHours(17, 0, 0, 0); // End at 5 PM
    
    // Get busy times from calendar
    const calendarId = 'primary';
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        items: [{ id: calendarId }]
      }
    });
    
    const busySlots = response.data.calendars?.primary?.busy || [];
    
    // Generate time slots (30-minute intervals)
    const timeSlots: {time: string, available: boolean}[] = [];
    const currentSlot = new Date(startOfDay);
    
    while (currentSlot < endOfDay) {
      const slotEnd = new Date(currentSlot);
      slotEnd.setMinutes(slotEnd.getMinutes() + 30);
      
      // Check if this slot overlaps with any busy slot
      const isAvailable = !busySlots.some(busy => {
        const busyStart = new Date(busy.start || '');
        const busyEnd = new Date(busy.end || '');
        return (
          (currentSlot >= busyStart && currentSlot < busyEnd) || 
          (slotEnd > busyStart && slotEnd <= busyEnd) ||
          (currentSlot <= busyStart && slotEnd >= busyEnd)
        );
      });
      
      // Format the time slot for display
      const timeString = format(currentSlot, 'h:mm a');
      
      timeSlots.push({
        time: timeString,
        available: isAvailable
      });
      
      // Move to the next slot
      currentSlot.setMinutes(currentSlot.getMinutes() + 30);
    }
    
    return timeSlots;
  } catch (error) {
    console.error('Error getting available time slots:', error);
    return [];
  }
}

// Create a calendar event for an interview
export async function createInterviewEvent(interview: InterviewEvent): Promise<{eventId: string, videoLink?: string}> {
  try {
    // Default end time is 45 minutes after start
    if (!interview.endDateTime) {
      interview.endDateTime = new Date(interview.startDateTime);
      interview.endDateTime.setMinutes(interview.endDateTime.getMinutes() + 45);
    }
    
    let conferenceData: calendar_v3.Schema$ConferenceData | undefined;
    let attendees = [
      { email: interview.candidateEmail, displayName: interview.candidateName },
      { email: interview.interviewerEmail, displayName: interview.interviewerName }
    ];
    
    // If it's a video interview, create a Google Meet link
    if (interview.isVideoInterview) {
      conferenceData = {
        createRequest: {
          requestId: `interview-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      };
    }
    
    // Create event details
    const eventDetails: calendar_v3.Schema$Event = {
      summary: `Interview: ${interview.candidateName} - ${interview.position}`,
      description: `Interview for the ${interview.position} position.\n\n${interview.notes || ''}`,
      start: {
        dateTime: interview.startDateTime.toISOString(),
        timeZone: 'Australia/Brisbane',
      },
      end: {
        dateTime: interview.endDateTime.toISOString(),
        timeZone: 'Australia/Brisbane',
      },
      attendees,
      conferenceData,
      location: interview.isVideoInterview ? 'Google Meet (details in description)' : interview.location,
      colorId: '2', // Color code for interviews (blue)
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 30 }, // 30 minutes before
        ],
      },
    };
    
    // Insert event to calendar
    const { data: event } = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: eventDetails,
      conferenceDataVersion: interview.isVideoInterview ? 1 : 0,
      sendUpdates: 'all', // Send email notifications to attendees
    });
    
    const eventId = event.id || '';
    const videoLink = event?.conferenceData?.entryPoints?.[0]?.uri || undefined;
    
    return { eventId, videoLink };
  } catch (error) {
    console.error('Error creating interview event:', error);
    throw error;
  }
}

// Update an existing calendar event
export async function updateInterviewEvent(
  eventId: string, 
  updates: Partial<InterviewEvent>
): Promise<{eventId: string, videoLink?: string}> {
  try {
    // Get the existing event first
    const { data: existingEvent } = await calendar.events.get({
      calendarId: 'primary',
      eventId,
    });
    
    // Prepare update fields
    const updateFields: calendar_v3.Schema$Event = {};
    
    if (updates.startDateTime) {
      updateFields.start = {
        dateTime: updates.startDateTime.toISOString(),
        timeZone: 'Australia/Brisbane',
      };
    }
    
    if (updates.endDateTime) {
      updateFields.end = {
        dateTime: updates.endDateTime.toISOString(),
        timeZone: 'Australia/Brisbane',
      };
    }
    
    if (updates.notes) {
      updateFields.description = `Interview for the ${updates.position || existingEvent.summary?.split(' - ')[1]} position.\n\n${updates.notes}`;
    }
    
    if (updates.isVideoInterview !== undefined) {
      if (updates.isVideoInterview && !existingEvent.conferenceData) {
        // Add conference data if switching to video interview
        updateFields.conferenceData = {
          createRequest: {
            requestId: `interview-update-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        };
      } else if (!updates.isVideoInterview) {
        // Remove conference data if switching to in-person
        updateFields.conferenceData = undefined;
      }
      
      updateFields.location = updates.isVideoInterview 
        ? 'Google Meet (details in description)' 
        : (updates.location || existingEvent.location);
    }
    
    // Update the event
    const { data: updatedEvent } = await calendar.events.patch({
      calendarId: 'primary',
      eventId,
      requestBody: updateFields,
      conferenceDataVersion: updates.isVideoInterview ? 1 : 0,
      sendUpdates: 'all', // Notify attendees of the change
    });
    
    const videoLink = updatedEvent?.conferenceData?.entryPoints?.[0]?.uri || undefined;
    
    return { 
      eventId: updatedEvent.id || eventId,
      videoLink
    };
  } catch (error) {
    console.error('Error updating interview event:', error);
    throw error;
  }
}

// Cancel/delete an interview
export async function cancelInterview(eventId: string): Promise<boolean> {
  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
      sendUpdates: 'all', // Notify attendees
    });
    
    return true;
  } catch (error) {
    console.error('Error canceling interview:', error);
    return false;
  }
}

// Get a specific event
export async function getInterviewEvent(eventId: string): Promise<calendar_v3.Schema$Event | null> {
  try {
    const { data } = await calendar.events.get({
      calendarId: 'primary',
      eventId,
    });
    
    return data;
  } catch (error) {
    console.error('Error getting interview event:', error);
    return null;
  }
}