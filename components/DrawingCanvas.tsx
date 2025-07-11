import * as MediaLibrary from "expo-media-library";
import { useRef, useState } from "react";
import {
	Alert,
	type LayoutChangeEvent,
	PanResponder,
	View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import ViewShot from "react-native-view-shot";
import { Text } from "@/components/ui/text";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Button } from "./ui/button";

type Point = {
	x: number;
	y: number;
};

type Stroke = {
	points: Point[];
	color: string;
	width: number;
};

export default function DrawingCanvas() {
	const [strokes, setStrokes] = useState<Stroke[]>([]);
	const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
	const [canvasDimensions, setCanvasDimensions] = useState({
		width: 0,
		height: 0,
	});
	const currentStrokeRef = useRef<Point[]>([]);
	const viewShotRef = useRef<ViewShot>(null);
	const strokeColor = useThemeColor({}, "text");
	const strokeColorRef = useRef(strokeColor);
	const borderColor = useThemeColor(
		{ light: "#999999", dark: "#666666" },
		"text",
	);
	const bgColor = useThemeColor({}, "background");

	// Update strokeColorRef when strokeColor changes
	strokeColorRef.current = strokeColor;

	const onCanvasLayout = (event: LayoutChangeEvent) => {
		const { width, height } = event.nativeEvent.layout;
		// Make canvas square based on the smaller dimension
		const size = Math.min(width, height - 80); // Leave space for clear button
		setCanvasDimensions({ width: size, height: size });
	};

	const panResponder = useRef(
		PanResponder.create({
			onMoveShouldSetPanResponder: () => true,
			onPanResponderGrant: (evt) => {
				const { locationX, locationY } = evt.nativeEvent;
				const newStroke = [{ x: locationX, y: locationY }];
				currentStrokeRef.current = newStroke;
				setCurrentStroke(newStroke);
			},
			onPanResponderMove: (evt) => {
				const { locationX, locationY } = evt.nativeEvent;
				const updatedStroke = [
					...currentStrokeRef.current,
					{ x: locationX, y: locationY },
				];
				currentStrokeRef.current = updatedStroke;
				setCurrentStroke(updatedStroke);
			},
			onPanResponderRelease: () => {
				if (currentStrokeRef.current.length > 0) {
					const newStroke = {
						points: [...currentStrokeRef.current],
						color: strokeColorRef.current,
						width: 2,
					};
					setStrokes((prev) => {
						const newStrokes = [...prev, newStroke];
						return newStrokes;
					});
					currentStrokeRef.current = [];
					setCurrentStroke([]);
				}
			},
		}),
	).current;

	const clearCanvas = () => {
		setStrokes([]);
		setCurrentStroke([]);
		currentStrokeRef.current = [];
	};

	const saveToLocal = async () => {
		try {
			// Request permission to save to photo library
			const { status } = await MediaLibrary.requestPermissionsAsync();
			if (status !== "granted") {
				Alert.alert(
					"Permission Required",
					"Please grant permission to save images to your photo library.",
				);
				return;
			}

			// Capture the canvas as an image
			if (viewShotRef.current?.capture) {
				const uri = await viewShotRef.current.capture();

				// Save to photo library
				const asset = await MediaLibrary.createAssetAsync(uri);
				await MediaLibrary.createAlbumAsync("AI Tutor", asset, false);

				Alert.alert("Success", "Drawing saved to your photo library!");
			}
		} catch (error) {
			console.error("Error saving image:", error);
			Alert.alert("Error", "Failed to save drawing. Please try again.");
		}
	};

	const pointsToPath = (points: Point[]) => {
		if (points.length < 2) return "";

		let path = `M${points[0].x},${points[0].y}`;
		for (let i = 1; i < points.length; i++) {
			const prev = points[i - 1];
			const curr = points[i];
			const cpx = (prev.x + curr.x) / 2;
			const cpy = (prev.y + curr.y) / 2;
			path += ` Q${prev.x},${prev.y} ${cpx},${cpy}`;
		}
		return path;
	};

	return (
		<View
			className="flex-1 items-center justify-center"
			onLayout={onCanvasLayout}
		>
			{canvasDimensions.width > 0 && (
				<View className="items-center">
					<ViewShot
						ref={viewShotRef}
						options={{
							format: "png",
							quality: 1,
							width: canvasDimensions.width,
							height: canvasDimensions.height,
						}}
					>
						<View
							className="border-2 border-dashed rounded-[10px] overflow-hidden"
							style={{
								borderColor,
								height: canvasDimensions.height,
								width: canvasDimensions.width,
								backgroundColor: bgColor,
							}}
							{...panResponder.panHandlers}
						>
							<Svg
								width={canvasDimensions.width}
								height={canvasDimensions.height}
								className="flex-1"
							>
								{strokes.map((stroke, index) => (
									<Path
										key={`stroke-${index}-${stroke.points.length}`}
										d={pointsToPath(stroke.points)}
										stroke={stroke.color || "#000000"}
										strokeWidth={stroke.width || 2}
										fill="none"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								))}
								{currentStroke.length > 0 && (
									<Path
										d={pointsToPath(currentStroke)}
										stroke={strokeColor}
										strokeWidth={2}
										fill="none"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								)}
							</Svg>
						</View>
					</ViewShot>
					<View className="flex-row mt-5 gap-[15px]">
						<Button variant="destructive" onPress={clearCanvas}>
							<Text className="text-base font-semibold">Clear</Text>
						</Button>
						<Button variant="default" onPress={saveToLocal}>
							<Text className="text-base font-semibold">Save</Text>
						</Button>
					</View>
				</View>
			)}
		</View>
	);
}
