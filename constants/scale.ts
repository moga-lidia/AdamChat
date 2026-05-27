import { Dimensions } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const SCALE = SCREEN_HEIGHT / 851;
export const IS_SMALL = SCREEN_HEIGHT < 700;
export const s = (value: number): number => Math.round(value * SCALE);
