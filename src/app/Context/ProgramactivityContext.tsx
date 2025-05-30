"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getSession } from "../action/clientauth";
const session = getSession();

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TOKEN = session?.jwt;

export interface ProgramActivity {
  id: string;
  activity_name: string;
  activity_img: string;
}

interface ProgramActivityContextType {
  programsActivity: ProgramActivity[];
}

const ProgramActivityContext = createContext<ProgramActivityContextType | undefined>(undefined);

export const useProgramActivity = (): ProgramActivityContextType => {
  const context = useContext(ProgramActivityContext);
  if (!context) {
    throw new Error("useProgramActivity must be used within a ProgramActivityProvider");
  }
  return context;
};

interface ProgramActivityProviderProps {
  children: ReactNode;
  programId: string;
}

export const ProgramActivityProvider: React.FC<ProgramActivityProviderProps> = ({ children, programId }) => {
  const [programs, setPrograms] = useState<ProgramActivity[]>([]);

  const fetchPrograms = async () => {
    if (!programId) return;

    try {
      const response = await fetch(
        `${API_URL}/program-activities?filters[program_type][id][$eq]=${programId}&populate=*`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );
      const data = await response.json();
      console.log("Program Activity", data.data);

      const formattedPrograms: ProgramActivity[] = data.data.map((program: any) => ({
        id: program.id.toString(),
        activity_name: program.attributes.program_activity_name,
        activity_img:
          program.attributes.img_url?.data?.[0]?.attributes?.url ?? program.attributes.program_type_name,
      }));

      setPrograms(formattedPrograms);
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, [programId]);

  return (
    <ProgramActivityContext.Provider value={{ programsActivity: programs }}>
      {children}
    </ProgramActivityContext.Provider>
  );
};
