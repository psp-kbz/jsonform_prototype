import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FormStore {
  schema: object;
  uischema: object | undefined;
  data: object;
  setSchema: (schema: object) => void;
  setUischema: (uischema: object | undefined) => void;
  setData: (data: object) => void;
  clearData: () => void;
}

export const useFormStore = create<FormStore>()(
  persist(
    (set) => ({
      schema: {},
      uischema: undefined,
      data: {},
      setSchema: (schema) => set({ schema }),
      setUischema: (uischema) => set({ uischema }),
      setData: (data) => set({ data }),
      clearData: () => set({ data: {} }),
    }),
    {
      name: "jsonforms-storage",
    }
  )
);
