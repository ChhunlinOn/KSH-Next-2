"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import dotenv from "dotenv";
dotenv.config();
import { getSession } from "../action/clientauth";
const session = getSession();

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TOKEN = session?.jwt;

// 1. Define the Program interface
export interface Program {
  id: string;
  program_type_name: string;
  img_url: string;
}

// Optional: for single program type detail (more attributes?)
export interface ProgramTypeDetails {
  program_type_name: string;
  img_url: string;
  // add other fields here if needed
}

// 2. Define the context type
interface ProgramContextType {
  programs: Program[];
  programType: ProgramTypeDetails | null;
  fetchProgramTypeById: (id: string) => Promise<void>;
}

// 3. Create the context
const ProgramContext = createContext<ProgramContextType | undefined>(undefined);

// 4. Custom hook
export const useProgram = (): ProgramContextType => {
  const context = useContext(ProgramContext);
  if (!context) {
    throw new Error("useProgram must be used within a ProgramProvider");
  }
  return context;
};

// 5. Props
interface ProgramProviderProps {
  children: ReactNode;
}

// 6. Provider
export const ProgramProvider: React.FC<ProgramProviderProps> = ({ children }) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programType, setProgramType] = useState<ProgramTypeDetails | null>(null);

  const fetchPrograms = async () => {
    try {
      const response = await fetch(`${API_URL}/program-types?populate=*`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      });

      const result = await response.json();
      const formattedPrograms: Program[] = result.data.map((program: any) => ({
        id: program.id.toString(),
        program_type_name: program.attributes.program_type_name,
        img_url:
          program.attributes.img_url?.data?.[0]?.attributes?.url ?? program.attributes.program_type_name,
      }));

      setPrograms(formattedPrograms);
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  const fetchProgramTypeById = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/program-types/${id}?populate=*`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      });

      const data = await response.json();
      const attrs = data.data.attributes;
      setProgramType({
        program_type_name: attrs.program_type_name,
        img_url: attrs.img_url?.data?.[0]?.attributes?.url ?? "",
        // add more fields if needed
      });
    } catch (error) {
      console.error("Error fetching program type by ID:", error);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  return (
    <ProgramContext.Provider
      value={{ programs, programType, fetchProgramTypeById }}
    >
      {children}
    </ProgramContext.Provider>
  );
};
