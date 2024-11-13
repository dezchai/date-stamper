"use client";
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface Settings {
	fontSize: number | "auto";
	textColor: string;
	textColorPreset: "white" | "black" | "custom";
	strokeColor: string | "none";
	strokeColorPreset: "white" | "black" | "custom" | "none";
	position: "bottomLeft" | "bottomRight" | "topLeft" | "topRight";
	dateFormat: string;
	showSeconds: boolean;
	font: "Arial" | "Roboto" | "Open Sans" | "Helvetica" | "Times New Roman";
	theme: "light" | "dark" | "system";
}

interface SettingsContextType {
	settings: Settings;
	updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
	fontSize: "auto",
	textColor: "white",
	textColorPreset: "white",
	strokeColor: "black",
	strokeColorPreset: "black",
	position: "bottomLeft",
	dateFormat: "yyyy-MM-dd",
	showSeconds: true,
	font: "Arial",
	theme: "system",
};

const SettingsContext = createContext<SettingsContextType | undefined>(
	undefined,
);

export function SettingsProvider({ children }: { children: ReactNode }) {
	const [settings, setSettings] = useState<Settings>(() => {
		if (typeof window !== 'undefined') {
			const savedSettings = localStorage.getItem('dateStamperSettings');
			if (savedSettings) {
				return JSON.parse(savedSettings);
			}
		}
		return defaultSettings;
	});

	useEffect(() => {
		localStorage.setItem('dateStamperSettings', JSON.stringify(settings));
	}, [settings]);

	const updateSettings = (newSettings: Partial<Settings>) => {
		setSettings((prev) => ({ ...prev, ...newSettings }));
	};

	return (
		<SettingsContext.Provider value={{ settings, updateSettings }}>
			{children}
		</SettingsContext.Provider>
	);
}

export function useSettings() {
	const context = useContext(SettingsContext);
	if (context === undefined) {
		throw new Error("useSettings must be used within a SettingsProvider");
	}
	return context;
}
