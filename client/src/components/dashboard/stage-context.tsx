import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the stages for the hiring funnel
export const RECRUITMENT_STAGES = {
  POSTED: 'Posted',
  APPLIED: 'Applied',
  SCREENING: 'Screening',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
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