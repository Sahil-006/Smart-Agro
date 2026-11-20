import { useContext } from "react";
import { ThemeContext } from "../context/themeContextDef";

export function useTheme() {
  return useContext(ThemeContext);
}

export default useTheme;
