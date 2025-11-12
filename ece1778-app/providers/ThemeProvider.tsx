import { createContext, useContext, useState, ReactNode } from "react";
import { ThemeContext } from "@contexts/ThemeContext";

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setTheme] = useState<"light" | "dark">("light");

	const toggleTheme = () => {
		setTheme((prev) => (prev === "light" ? "dark" : "light"));
	};

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}
