import type { ExecutionTimeRange } from "../types/types";

type RgbColor = readonly [number, number, number];

const FAST_COLOR: RgbColor = [5, 150, 105];
const MIDDLE_COLOR: RgbColor = [234, 179, 8];
const SLOW_COLOR: RgbColor = [220, 38, 38];
const MIDDLE_RATIO = 0.5;

function clampRatio(value: number) {
  return Math.max(0, Math.min(1, value));
}

function getExecutionTimeRatio(executionTime: number, range: NonNullable<ExecutionTimeRange>) {
  const span = range.scaleMax - range.scaleMin;
  const scaledTime = Math.log1p(executionTime);

  if (span === 0) return 0;

  return clampRatio((scaledTime - range.scaleMin) / span);
}

function interpolateColor(from: RgbColor, to: RgbColor, ratio: number): RgbColor {
  return from.map((channel, index) =>
    Math.round(channel + (to[index] - channel) * ratio)
  ) as unknown as RgbColor;
}

function getPaletteColor(ratio: number) {
  if (ratio <= MIDDLE_RATIO) {
    const greenToYellowRatio = ratio / MIDDLE_RATIO;
    return interpolateColor(FAST_COLOR, MIDDLE_COLOR, greenToYellowRatio);
  }

  const yellowToRedRatio = (ratio - MIDDLE_RATIO) / (1 - MIDDLE_RATIO);
  return interpolateColor(MIDDLE_COLOR, SLOW_COLOR, yellowToRedRatio);
}

function formatRgbColor([red, green, blue]: RgbColor) {
  return `rgb(${red}, ${green}, ${blue})`;
}

export function getExecutionTimeStripeColor(executionTime: number, range: ExecutionTimeRange) {
  if (!range) return undefined;

  const ratio = getExecutionTimeRatio(executionTime, range);
  return formatRgbColor(getPaletteColor(ratio));
}
