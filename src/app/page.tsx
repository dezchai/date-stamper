"use client";
import { useState, useEffect, useCallback } from "react";
import { InputFile } from "@/components/FileUpload";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import EXIF from "exif-js";
import { useSettings } from "@/contexts/SettingsContext";
import { Settings } from "@/components/Settings";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { format, parse } from "date-fns";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { Progress } from "@/components/ui/progress";

interface ImageData {
	url: string;
	dateTime: string | null;
	processedUrl: string;
	originalName: string;
	fileType: string;
}

export default function Home() {
	const { settings } = useSettings();
	const [files, setFiles] = useState<FileList | null>(null);
	const [imageData, setImageData] = useState<ImageData[]>([]);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [showSettings, setShowSettings] = useState(false);
	const { toast } = useToast();
	const [showCustomText, setShowCustomText] = useState(false);
	const [customText, setCustomText] = useState<string | null>(null);
	const [processingProgress, setProcessingProgress] = useState(0);

	const downloadAllImages = () => {
		for (const image of imageData) {
			const link = document.createElement("a");
			link.href = image.processedUrl;
			link.download = `${image.originalName}-stamped.${image.fileType}`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	};

	const getImageDateTime = async (
		file: File,
	): Promise<{ dateTime: string | null; hasExif: boolean }> => {
		return new Promise((resolve) => {
			//@ts-ignore
			EXIF.getData(file as File, function (this) {
				const exifData = EXIF.getAllTags(this);
				const dateTime = exifData?.DateTime || null;

				if (dateTime) {
					const parsedDate = parse(dateTime, "yyyy:MM:dd HH:mm:ss", new Date());
					const formattedDate = format(parsedDate, settings.dateFormat);
					const formattedTime = format(
						parsedDate,
						`HH:mm${settings.showSeconds ? ":ss" : ""}`,
					);
					resolve({
						dateTime: `${formattedDate} ${formattedTime}`,
						hasExif: true,
					});
				} else {
					let creationDate = file.lastModified;
					if ("getCreationDate" in file) {
						const fileWithDate = file as unknown as {
							getCreationDate(): number;
						};
						creationDate = fileWithDate.getCreationDate();
					}
					const modifiedDate = new Date(creationDate);
					const formattedDate = format(modifiedDate, settings.dateFormat);
					const formattedTime = format(
						modifiedDate,
						`HH:mm${settings.showSeconds ? ":ss" : ""}`,
					);
					resolve({
						dateTime: `${formattedDate} ${formattedTime}`,
						hasExif: false,
					});
				}
			});
		});
	};

	const embedTextInImage = (
		imageUrl: string,
		text: string,
		customTextOverride?: string | null,
	): Promise<string> => {
		return new Promise((resolve) => {
			const img = new Image();
			img.src = imageUrl;
			img.onload = () => {
				const canvas = document.createElement("canvas");
				const ctx = canvas.getContext("2d");
				if (!ctx) return;

				canvas.width = img.width;
				canvas.height = img.height;
				ctx.drawImage(img, 0, 0);

				const fontSize =
					settings.fontSize === "auto"
						? Math.max(12, Math.min(img.width, img.height) * 0.05)
						: settings.fontSize;

				ctx.font = `bold ${fontSize}px ${settings.font}`;
				ctx.fillStyle = settings.textColor;

				if (settings.strokeColor !== "none") {
					ctx.strokeStyle = settings.strokeColor;
					ctx.lineWidth = fontSize / 8;
				}

				ctx.textAlign = settings.position.includes("Right") ? "right" : "left";

				const padding = fontSize;
				const text_x = settings.position.includes("Right")
					? img.width - padding
					: padding;
				const text_y = settings.position.includes("bottom")
					? img.height - padding
					: padding + fontSize;

				const displayText = customTextOverride ?? text;

				if (settings.strokeColor !== "none") {
					ctx.strokeText(displayText, text_x, text_y);
				}
				ctx.fillText(displayText, text_x, text_y);

				resolve(canvas.toDataURL("image/jpeg", 1));
			};
		});
	};

	const processImages = async (files: FileList, showToastWarnings = true) => {
		const fileArray = Array.from(files);
		let hasAnyMissingExif = false;
		let completedImages = 0;
		setProcessingProgress(0);

		const imageDataPromises = fileArray.map(async (file) => {
			const url = await new Promise<string>((resolve) => {
				const reader = new FileReader();
				reader.onload = () => resolve(reader.result as string);
				reader.readAsDataURL(file);
			});

			const { dateTime, hasExif } = await getImageDateTime(file);
			if (!hasExif) {
				hasAnyMissingExif = true;
			}

			const processedUrl = dateTime
				? await embedTextInImage(url, dateTime, customText)
				: url;

			completedImages++;
			setProcessingProgress((completedImages / fileArray.length) * 100);

			const originalName = file.name.replace(/\.[^/.]+$/, "");
			const fileType = file.name.split(".").pop() || "jpg";

			return {
				url,
				dateTime,
				processedUrl,
				originalName,
				fileType,
			};
		});

		const results = await Promise.all(imageDataPromises);
		setProcessingProgress(0);

		if (hasAnyMissingExif && showToastWarnings) {
			toast({
				title: "Missing EXIF Data",
				description:
					"One or more images did not contain EXIF data. Using creation date or last modified date instead.",
				variant: "destructive",
			});
		}

		return results;
	};

	const handleFileChange = async (selectedFiles: FileList | null) => {
		setFiles(selectedFiles);
		setCurrentImageIndex(0);

		if (selectedFiles) {
			setImageData([]);
			const newImageData = await processImages(selectedFiles);
			setImageData(newImageData);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: idk
	useEffect(() => {
		const reprocessImages = async () => {
			if (files) {
				const newImageData = await processImages(files, false);
				setImageData(newImageData);
			}
		};
		reprocessImages();
	}, [files, settings]);

	const handleTextChange = async (newText: string) => {
		setCustomText(newText);
		if (!imageData[currentImageIndex]) return;

		const newProcessedUrl = await embedTextInImage(
			imageData[currentImageIndex].url,
			imageData[currentImageIndex].dateTime || "",
			newText,
		);

		const newImageData = [...imageData];
		newImageData[currentImageIndex] = {
			...newImageData[currentImageIndex],
			processedUrl: newProcessedUrl,
		};
		setImageData(newImageData);
	};

	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-4 row-start-2 items-center w-full max-w-md mx-auto">
				<h1 className="text-center text-xl font-bold">Date Stamper</h1>
				<InputFile onFileChange={handleFileChange} />
				<div className="w-full">
					<button
						type="button"
						onClick={() => setShowSettings(!showSettings)}
						className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
					>
						{showSettings ? "Hide Settings" : "Settings"}
					</button>
					{showSettings && <Settings />}
					{processingProgress > 0 && <Progress value={processingProgress} />}
				</div>

				{imageData.length > 0 && (
					<div className="flex flex-col items-center gap-4 w-full">
						<Carousel className="w-full relative">
							<CarouselContent>
								{imageData.map((image, index) => (
									<CarouselItem key={`${index}-${image.originalName}`}>
										<div className="relative w-full flex items-center justify-center">
											<img
												src={image.processedUrl}
												alt={`${image.originalName} with date stamp`}
												className="max-w-full max-h-full object-contain"
											/>
											{imageData.length > 1 && (
												<div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
													{index + 1} / {imageData.length}
												</div>
											)}
										</div>
									</CarouselItem>
								))}
							</CarouselContent>
							{imageData.length > 1 && (
								<>
									<CarouselPrevious className="absolute left-0 -ml-4 sm:-ml-12" />
									<CarouselNext className="absolute right-0 -mr-4 sm:-mr-12" />
								</>
							)}
						</Carousel>

						<div className="flex flex-col gap-4 w-full">
							<div className="space-y-2">
								<button
									type="button"
									onClick={() => setShowCustomText(!showCustomText)}
									className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
								>
									{showCustomText ? "Hide Modify Date" : "Modify Date"}
								</button>
								{showCustomText && (
									<Input
										value={
											customText ?? imageData[currentImageIndex].dateTime ?? ""
										}
										onChange={(e) => handleTextChange(e.target.value)}
										placeholder="Enter custom text"
										className="w-full"
									/>
								)}
							</div>
						</div>
						<button
							onClick={downloadAllImages}
							type="button"
							className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
						>
							<Download className="w-4 h-4" />
							Download {imageData.length === 1 ? "Image" : "Images"}
						</button>
					</div>
				)}
			</main>
		</div>
	);
}
