import { useRef, useState } from "react";
import {
	type LayoutChangeEvent,
	PanResponder,
	Pressable,
	StyleSheet,
	View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";

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
	const strokeColor = useThemeColor({}, "text");
	const strokeColorRef = useRef(strokeColor);
	const borderColor = useThemeColor(
		{ light: "#999999", dark: "#666666" },
		"text",
	);
	const buttonBgColor = useThemeColor(
		{ light: "#f0f0f0", dark: "#333333" },
		"background",
	);

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
		<View style={styles.container} onLayout={onCanvasLayout}>
			{canvasDimensions.width > 0 && (
				<View style={styles.canvasContent}>
					<View
						style={[
							styles.canvasContainer,
							{
								borderColor,
								height: canvasDimensions.height,
								width: canvasDimensions.width,
							},
						]}
						{...panResponder.panHandlers}
					>
						<Svg
							width={canvasDimensions.width}
							height={canvasDimensions.height}
							style={styles.svg}
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
					<Pressable
						style={[styles.clearButton, { backgroundColor: buttonBgColor }]}
						onPress={clearCanvas}
					>
						<ThemedText style={styles.clearButtonText}>Clear</ThemedText>
					</Pressable>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	canvasContent: {
		alignItems: "center",
	},
	canvasContainer: {
		borderWidth: 2,
		borderStyle: "dashed",
		borderRadius: 10,
		overflow: "hidden",
		backgroundColor: "transparent",
	},
	svg: {
		flex: 1,
	},
	clearButton: {
		marginTop: 20,
		paddingHorizontal: 30,
		paddingVertical: 10,
		borderRadius: 20,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 3,
	},
	clearButtonText: {
		fontSize: 16,
		fontWeight: "600",
	},
});
