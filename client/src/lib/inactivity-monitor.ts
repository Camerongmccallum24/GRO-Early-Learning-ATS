import { AUTH_INACTIVITY_TIMEOUT } from "../../../server/utils/timeout-settings";

// Inactivity tracking for user session
export class InactivityMonitor {
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private callback: () => void;

  constructor(onInactive: () => void) {
    this.callback = onInactive;
  }

  // Reset the inactivity timer whenever user activity is detected
  public resetTimer() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    this.timeoutId = setTimeout(() => {
      this.callback();
    }, AUTH_INACTIVITY_TIMEOUT);
  }

  // Start monitoring for inactivity
  public start() {
    // Set up event listeners for user activity
    const activityEvents = ['mousedown', 'keypress', 'scroll', 'mousemove', 'click', 'touchstart'];
    
    const resetTimerBound = this.resetTimer.bind(this);
    
    // Add event listeners
    activityEvents.forEach(eventType => {
      document.addEventListener(eventType, resetTimerBound);
    });
    
    // Initialize the timer
    this.resetTimer();
    
    // Return function to stop monitoring
    return () => {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
      
      activityEvents.forEach(eventType => {
        document.removeEventListener(eventType, resetTimerBound);
      });
    };
  }
  
  // Stop monitoring
  public stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
