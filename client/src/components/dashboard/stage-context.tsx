import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the stages for the hiring funnel
export const RECRUITMENT_STAGES = {
  POSTED: 'Posted',
  APPLIED: 'Applied',
  SCREENING: 'Screening', // Maps to 'in_review' in database
  INTERVIEW: 'Interview', // Maps to 'interview' in database
  OFFER: 'Offer',      // Maps to 'offered' in database
  HIRED: 'Hired',      // Maps to 'hired' in database
  REJECTED: 'Rejected', // Maps to 'rejected' in database
};

// Map from database status values to our stage names
export const DB_STATUS_TO_STAGE = {
  'applied': RECRUITMENT_STAGES.APPLIED,
  'in_review': RECRUITMENT_STAGES.SCREENING,
  'interview': RECRUITMENT_STAGES.INTERVIEW,
  'interviewed': RECRUITMENT_STAGES.INTERVIEW, // Consider both as Interview
  'offered': RECRUITMENT_STAGES.OFFER,
  'hired': RECRUITMENT_STAGES.HIRED,
  'rejected': RECRUITMENT_STAGES.REJECTED,
};

// Map from our stage names to database status values
export const STAGE_TO_DB_STATUS = {
  [RECRUITMENT_STAGES.APPLIED]: 'applied',
  [RECRUITMENT_STAGES.SCREENING]: 'in_review',
  [RECRUITMENT_STAGES.INTERVIEW]: 'interview',
  [RECRUITMENT_STAGES.OFFER]: 'offered',
  [RECRUITMENT_STAGES.HIRED]: 'hired',
  [RECRUITMENT_STAGES.REJECTED]: 'rejected',
};

// Define the context type
interface StageContextType {
  selectedStage: string | null;
  setSelectedStage: (stage: string | null) => void;
  resetStage: () => void;
}

// Create the context with default values
const StageContext = createContext<StageContextType>({
  selectedStage: null,
  setSelectedStage: () => {},
  resetStage: () => {},
});

// Create a provider component
interface StageProviderProps {
  children: ReactNode;
}

export function StageProvider({ children }: StageProviderProps) {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const resetStage = () => {
    setSelectedStage(null);
  };

  return (
    <StageContext.Provider
      value={{
        selectedStage,
        setSelectedStage,
        resetStage,
      }}
    >
      {children}
    </StageContext.Provider>
  );
}

// Custom hook for consuming the context
export function useStageContext() {
  const context = useContext(StageContext);
  if (context === undefined) {
    throw new Error('useStageContext must be used within a StageProvider');
  }
  return context;
}