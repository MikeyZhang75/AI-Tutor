import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import {
	Alert,
	type LayoutChangeEvent,
	PanResponder,
	View,
} from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import ViewShot, { captureRef } from "react-native-view-shot";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useThemeColor } from "@/lib/useThemeColor";

type Point = {
	x: number;
	y: number;
};

type Stroke = {
	points: Point[];
	color: string;
	width: number;
};

export type DrawingCanvasRef = {
	captureCanvas: () => Promise<string>;
	hasStrokes: () => boolean;
	clear: () => void;
};

type DrawingCanvasProps = {
	onStrokesChange?: (hasStrokes: boolean) => void;
	height?: number;
};

const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
	({ onStrokesChange, height = 300 }, ref) => {
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

		// Animation for placeholder text
		const placeholderOpacity = useSharedValue(1);

		const placeholderAnimatedStyle = useAnimatedStyle(() => ({
			opacity: placeholderOpacity.value,
		}));

		// Update strokeColorRef when strokeColor changes
		useEffect(() => {
			strokeColorRef.current = strokeColor;
		}, [strokeColor]);

		// Animate placeholder when strokes change
		useEffect(() => {
			const hasStrokes = strokes.length > 0;
			// Animate placeholder opacity
			placeholderOpacity.value = withTiming(hasStrokes ? 0 : 1, {
				duration: 150,
			});
			// Notify parent component
			onStrokesChange?.(hasStrokes);
		}, [strokes.length, placeholderOpacity, onStrokesChange]);

		const onCanvasLayout = (event: LayoutChangeEvent) => {
			const { width, height: layoutHeight } = event.nativeEvent.layout;
			// Calculate canvas height, leaving space for buttons
			const buttonHeight = 60; // Approximate height for button row
			const canvasHeight =
				layoutHeight > buttonHeight ? layoutHeight - buttonHeight : height;
			setCanvasDimensions({ width, height: canvasHeight });
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
			currentStrokeRef.current = [];
			setStrokes([]);
			setCurrentStroke([]);
		};

		const undoLastStroke = () => {
			if (strokes.length > 0) {
				setStrokes((prev) => prev.slice(0, -1));
			}
		};

		const saveToGallery = async () => {
			try {
				// Request permissions
				const { status } = await MediaLibrary.requestPermissionsAsync();
				if (status !== "granted") {
					Alert.alert(
						"Permission Denied",
						"Please enable photo library access to save drawings.",
					);
					return;
				}

				// Capture the canvas as file URI
				if (viewShotRef.current) {
					const uri = await captureRef(viewShotRef, {
						format: "png",
						quality: 1,
						result: "tmpfile",
					});
					// Save to photo library
					const asset = await MediaLibrary.createAssetAsync(uri);
					await MediaLibrary.createAlbumAsync(
						"AI Tutor Drawings",
						asset,
						false,
					);
					Alert.alert("Success", "Drawing saved to your photo library!");
				}
			} catch (error) {
				console.error("Error saving to gallery:", error);
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

		// Expose methods through ref
		useImperativeHandle(ref, () => ({
			captureCanvas: async () => {
				if (viewShotRef.current?.capture) {
					// Capture as base64
					const base64 = await viewShotRef.current.capture();
					// Add data URL prefix for PNG image
					const dataUrl = `data:image/png;base64,${base64}`;
					return dataUrl;
				}
				throw new Error("Unable to capture canvas");
			},
			hasStrokes: () => strokes.length > 0,
			clear: clearCanvas,
		}));

		return (
			<View className="flex-1 w-full" onLayout={onCanvasLayout}>
				{canvasDimensions.width > 0 && (
					<View className="flex-1 flex flex-col">
						{/* Canvas Area */}
						<ViewShot
							ref={viewShotRef}
							options={{
								format: "png",
								quality: 1,
								result: "base64",
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
								{/* Placeholder - shows only when canvas is empty, not captured in image */}
								<Animated.View
									className="absolute inset-0 items-center justify-center pointer-events-none"
									style={placeholderAnimatedStyle}
								>
									<View className="flex-row items-center gap-2">
										<Ionicons
											name="pencil-outline"
											size={18}
											color={borderColor}
										/>
										<Text className="text-gray-500 dark:text-gray-400 text-md">
											Write your solution here
										</Text>
									</View>
								</Animated.View>
							</View>
						</ViewShot>

						{/* Button Row */}
						<View className="flex-row py-3 gap-3 justify-center">
							<Button
								variant="destructive"
								onPress={clearCanvas}
								disabled={strokes.length === 0}
								size="sm"
							>
								<Text className="text-sm font-semibold">Clear</Text>
							</Button>
							<Button
								variant="secondary"
								onPress={undoLastStroke}
								disabled={strokes.length === 0}
								size="sm"
							>
								<Text className="text-sm font-semibold">Undo</Text>
							</Button>
							<Button
								variant="default"
								onPress={saveToGallery}
								disabled={strokes.length === 0}
								size="sm"
							>
								<Text className="text-sm font-semibold">Save</Text>
							</Button>
						</View>
					</View>
				)}
			</View>
		);
	},
);

DrawingCanvas.displayName = "DrawingCanvas";

export default DrawingCanvas;
