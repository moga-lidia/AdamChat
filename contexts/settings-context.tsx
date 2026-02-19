import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";

interface SettingsContextValue {
  fontSize: number;
  setFontSize: (v: number) => void;
  contrast: number;
  setContrast: (v: number) => void;
  brightness: number;
  setBrightness: (v: number) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  fontSize: 14,
  setFontSize: () => {},
  contrast: 100,
  setContrast: () => {},
  brightness: 100,
  setBrightness: () => {},
});

export function SettingsProvider({ children }: PropsWithChildren) {
  const [fontSize, setFontSize] = useState(14);
  const [contrast, setContrast] = useState(100);
  const [brightness, setBrightness] = useState(100);

  return (
    <SettingsContext.Provider
      value={{ fontSize, setFontSize, contrast, setContrast, brightness, setBrightness }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
