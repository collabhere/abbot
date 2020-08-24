import { checkStreak } from "./streak";
import { positionAnalysis } from "./position";
import { coverageForIndex } from "./coverage";
import { Reporter } from "../reporter";

export const createAlgos = (reporter: Reporter) => ({
	streak: checkStreak(reporter),
	position: positionAnalysis(reporter),
	coverage: coverageForIndex(reporter)
});

export type Algorithms = ReturnType<typeof createAlgos>