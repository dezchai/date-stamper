import { useSettings } from "@/contexts/SettingsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

const DATE_FORMAT_OPTIONS = [
	{ label: "YYYY-MM-DD", value: "yyyy-MM-dd" },
	{ label: "DD/MM/YYYY", value: "dd/MM/yyyy" },
	{ label: "MM/DD/YYYY", value: "MM/dd/yyyy" },
	{ label: "DD.MM.YYYY", value: "dd.MM.yyyy" },
];

const FONT_OPTIONS = [
	{ label: "Arial", value: "Arial" },
	{ label: "Roboto", value: "Roboto" },
	{ label: "Open Sans", value: "Open Sans" },
	{ label: "Helvetica", value: "Helvetica" },
	{ label: "Times New Roman", value: "Times New Roman" },
];

export function Settings() {
	const { settings, updateSettings } = useSettings();
	const { theme, setTheme } = useTheme();

	const handleTextColorChange = (preset: "white" | "black" | "custom") => {
		updateSettings({
			textColorPreset: preset,
			textColor: preset === "custom" ? settings.textColor : preset,
		});
	};

	const handleStrokeColorChange = (
		preset: "white" | "black" | "custom" | "none",
	) => {
		updateSettings({
			strokeColorPreset: preset,
			strokeColor: preset === "custom" ? settings.strokeColor : preset,
		});
	};

	const formatExample = `${format(new Date(), settings.dateFormat)} ${format(new Date(), `HH:mm${settings.showSeconds ? ":ss" : ""}`)}`;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Settings</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="fontSize">Font Size</Label>
						<div className="space-y-2">
							<Select
								value={settings.fontSize === "auto" ? "auto" : "custom"}
								onValueChange={(value: "auto" | "custom") =>
									updateSettings({
										fontSize:
											value === "auto"
												? "auto"
												: settings.fontSize === "auto"
													? 20
													: settings.fontSize,
									})
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="auto">Auto</SelectItem>
									<SelectItem value="custom">Custom</SelectItem>
								</SelectContent>
							</Select>
							{settings.fontSize !== "auto" && (
								<Input
									id="fontSize"
									type="number"
									value={settings.fontSize}
									onChange={(e) =>
										updateSettings({ fontSize: Number(e.target.value) })
									}
								/>
							)}
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="textColor">Text Color</Label>
						<div className="space-y-2">
							<Select
								value={settings.textColorPreset}
								onValueChange={(value: "white" | "black" | "custom") =>
									handleTextColorChange(value)
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="white">White</SelectItem>
									<SelectItem value="black">Black</SelectItem>
									<SelectItem value="custom">Custom</SelectItem>
								</SelectContent>
							</Select>
							{settings.textColorPreset === "custom" && (
								<Input
									id="textColor"
									type="color"
									value={settings.textColor}
									onChange={(e) =>
										updateSettings({ textColor: e.target.value })
									}
								/>
							)}
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="strokeColor">Stroke Color</Label>
						<div className="space-y-2">
							<Select
								value={settings.strokeColorPreset}
								onValueChange={(value: "white" | "black" | "custom" | "none") =>
									handleStrokeColorChange(value)
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="black">Black</SelectItem>
									<SelectItem value="white">White</SelectItem>
									<SelectItem value="none">None</SelectItem>
									<SelectItem value="custom">Custom</SelectItem>
								</SelectContent>
							</Select>
							{settings.strokeColorPreset === "custom" && (
								<Input
									id="strokeColor"
									type="color"
									value={settings.strokeColor}
									onChange={(e) =>
										updateSettings({ strokeColor: e.target.value })
									}
								/>
							)}
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="position">Position</Label>
						<Select
							value={settings.position}
							onValueChange={(value) =>
								updateSettings({
									position: value as typeof settings.position,
								})
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="bottomLeft">Bottom Left</SelectItem>
								<SelectItem value="bottomRight">Bottom Right</SelectItem>
								<SelectItem value="topLeft">Top Left</SelectItem>
								<SelectItem value="topRight">Top Right</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="font">Font</Label>
						<Select
							value={settings.font}
							onValueChange={(value: typeof settings.font) =>
								updateSettings({ font: value })
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{FONT_OPTIONS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="theme">Theme</Label>
						<Select
							value={theme}
							onValueChange={(value) => {
								setTheme(value);
								updateSettings({ theme: value as typeof settings.theme });
							}}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="light">Light</SelectItem>
								<SelectItem value="dark">Dark</SelectItem>
								<SelectItem value="system">System</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2 col-span-2">
						<Label htmlFor="dateFormat">Date Format</Label>
						<div className="space-y-2">
							<div className="flex gap-2">
								<Select
									value={settings.dateFormat}
									onValueChange={(value) =>
										updateSettings({ dateFormat: value })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{DATE_FORMAT_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<div className="flex items-center gap-2">
									<input
										type="checkbox"
										id="showSeconds"
										checked={settings.showSeconds}
										onChange={(e) =>
											updateSettings({ showSeconds: e.target.checked })
										}
										className="h-4 w-4"
									/>
									<Label htmlFor="showSeconds">Show seconds</Label>
								</div>
							</div>
							<div className="text-sm text-muted-foreground">
								Example: {formatExample}
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
