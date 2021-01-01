import {
	findIndexesByVal,
	pipe,
	between
} from "./index";

/** Tuple containing two lists */
type ListPair = [any[], any[]];

const sortLimitCoalescence = ([stages, queries]: ListPair): ListPair => {
	const sortIndexes = findIndexesByVal(stages, '$sort');
	const limitIndexes = findIndexesByVal(stages, '$limit');
	const groupIndexes = findIndexesByVal(stages, '$group');
	const unwindIndexes = findIndexesByVal(stages, '$unwind');

	if (sortIndexes.length && limitIndexes.length) { //we will apply sort limit coalescence
		while ((sortIndexes.length + limitIndexes.length) != 0) {
			const sortval = sortIndexes.pop();
			const limitval = limitIndexes.pop();
			const groupval = groupIndexes.pop();
			const unwindval = unwindIndexes.pop();
			if (sortval >= 0 && limitval >= 0
				&& sortval <= stages.length && limitval <= stages.length
				&& sortval < limitval
				&& !between(groupval, sortval, limitval)
				&& !between(unwindval, sortval, limitval)) { //we'll perform coalesce
				queries[sortval]['limit'] = queries[limitval]
				stages.splice(limitval, 1);
				queries.splice(limitval, 1);
			}
		}
	}

	return [stages, queries];
}

const limitLimitCoalescence = ([stages, queries]: ListPair): ListPair => {
	const limitIndexes = findIndexesByVal(stages, '$limit');
	if (limitIndexes.length) {
		for (let i = 0; i < limitIndexes.length - 1; i++) {
			const currentval = limitIndexes[i];
			const nextval = limitIndexes[i + 1];
			if (currentval >= 0 && nextval >= 0 && nextval - currentval == 1) { //if 2 limit's are consecutive then we will coalesce
				queries[currentval] = queries[currentval] < queries[nextval] ? queries[currentval] : queries[nextval] //smaller of the 2 values is taken
				queries.splice(nextval, 1);
				queries.splice(nextval, 1);
			}
		}
	}

	return [queries, stages];
}

const skipSkipCoalescence = ([stages, queries]: ListPair): ListPair => {
	const skipIndexes = findIndexesByVal(stages, '$skip');
	if (skipIndexes.length) {
		for (let i = 0; i < skipIndexes.length - 1; i++) {
			const currentval = skipIndexes[i];
			const nextval = skipIndexes[i + 1];
			if (currentval >= 0 && nextval >= 0 && nextval - currentval == 1) { //if 2 skips's are consecutive then we will coalesce
				queries[currentval] = queries[currentval] + queries[nextval] //add the 2 skip values
				stages.splice(nextval, 1);
				queries.splice(nextval, 1);
			}
		}
	}

	return [stages, queries];
}

const matchMatchCoalescence = ([stages, queries]: ListPair): ListPair => {
	const matchIndexes = findIndexesByVal(stages, '$match');
	if (matchIndexes) {
		for (let i = 0; i < matchIndexes.length - 1; i++) {
			const currentval = matchIndexes[i];
			const nextval = matchIndexes[i + 1];
			if (currentval >= 0 && nextval >= 0 && nextval - currentval == 1) { //if 2 match stages are consecutive then we will coalesce
				let newMatchObj: any = new Object();
				newMatchObj['$and'] = [queries[currentval], queries[nextval]];
				queries[currentval] = newMatchObj //combine the match stages
				stages.splice(nextval, 1);
				queries.splice(nextval, 1);
			}
		}
	}
	return [stages, queries];
}

const lookupUnwindCoalescence = ([stages, queries]: ListPair): ListPair => {
	const lookupIndexes = findIndexesByVal(stages, '$lookup');
	const unwindIndexes = findIndexesByVal(stages, '$unwind');
	if (lookupIndexes.length && unwindIndexes.length) { //we will apply sort limit coalescence
		while ((lookupIndexes.length + unwindIndexes.length) != 0) {
			const lookupval = lookupIndexes.pop();
			const unwindval = unwindIndexes.pop();
			if (lookupval >= 0 && unwindval >= 0
				&& lookupval <= stages.length && unwindval <= stages.length
				&& unwindval - lookupval == 0) { //we'll perform coalesce
				queries[lookupval]['unwinding'] = { preserveNullAndEmptyArrays: false }
				stages.splice(unwindval, 1);
				queries.splice(unwindval, 1);
			}
		}
	}

	return [stages, queries];
}

export const coalescenceConverter = (pipeline: any[]) => {
	const stages = pipeline.map(x => Object.keys(x)[0]);
	const queries = pipeline.map(x => Object.values(x)[1]);

	// get coalesced stages
	const [coalescedStages, coalescedQueries] = pipe(
		sortLimitCoalescence,
		limitLimitCoalescence,
		skipSkipCoalescence,
		matchMatchCoalescence,
		lookupUnwindCoalescence
	)([stages, queries]);

	const finalPipeline: any[] = [];

	// recreate final pipeline
	if (coalescedStages.length == coalescedQueries.length) {
		for (let i = 0; i < coalescedStages.length; i++) {
			const query: any = new Object();
			query[coalescedStages[i]] = coalescedQueries[i];
			finalPipeline.push(query);
		}
	}
	return finalPipeline;
}

const INDEX_BREAKING_STAGES = ["$unwind"];

export const splitPipeline = function (pipeline: any[]): [any[], any[]] {
	const indexSafeStages = [];
	let breakpoint = -1;
	const indexUnsafeStages = [];
	for (let i = 0; i < pipeline.length; ++i) {
		for (let breaker of INDEX_BREAKING_STAGES) {
			if (pipeline[i][breaker]) {
				breakpoint = i;
				break;
			}
			indexSafeStages.push(pipeline[i]);
		}
		/* not sure if break above will break out of both loops */
		if (breakpoint >= 0) break;
	}
	if (breakpoint >= 0) {
		indexUnsafeStages.push(...pipeline.slice(breakpoint));
	}
	return [indexSafeStages, indexUnsafeStages];
}


//class PipelineSequenceOptimization {
//	pipeline: any;

//	projectMatchOptimization() {
//		//($project or $unset or $addFields or $set) + $match Sequence Optimization

//		//Kinda confusing, wasn't able to come up with a optimized way to do that

//	}

//	sortMatchOptimization() {
//		let sortIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$sort');
//		let matchIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$match');

//		if (sortIndexes.length && matchIndexes.length) {
//			while (sortIndexes.length + matchIndexes.length != 0) {
//				let sortval = sortIndexes.pop();
//				let matchval = matchIndexes.pop();
//				if ((sortval >= 0 && matchval >= 0) && (matchval - sortval == 1)) {
//					let sortQuery = this.pipeline['pipelineQuery'][sortval];
//					this.pipeline['pipelineQuery'][sortval] = this.pipeline['pipelineQuery'][matchval];
//					this.pipeline['pipelineStage'][matchval] = sortQuery;

//					let sortStage = this.pipeline['pipelineStage'][sortval];
//					this.pipeline['pipelineStage'][sortval] = this.pipeline['pipelineStage'][matchval];
//					this.pipeline['pipelineStage'][matchval] = sortStage;
//				}
//			}
//		}
//	}

//	redactMatchOptimzation() {
//		let redactIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$redact');
//		let matchIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$match');

//		if (redactIndexes.length && matchIndexes.length) {
//			while (redactIndexes.length + matchIndexes.length != 0) {
//				let redactval = redactIndexes.pop();
//				let matchval = matchIndexes.pop();
//				if ((redactval >= 0 && matchval >= 0) && (matchval - redactval == 1)) {
//					this.pipeline['pipelineQuery'].splice(redactval, 0, this.pipeline['pipelineQuery'][matchval]);

//					this.pipeline['pipelineStage'].splice(redactval, 0, this.pipeline['pipelineStage'][matchval]);
//				}
//			}
//		}
//	}

//	projectSkipOptimization() {
//		let projectIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$project');
//		let unsetIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$unset');
//		let skipIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$skip');

//		if ((projectIndexes.length || unsetIndexes.length) && skipIndexes.length) {
//			while (projectIndexes.length + unsetIndexes.length + skipIndexes.length != 0) {
//				let projectval = projectIndexes.pop();
//				let unsetval = unsetIndexes.pop();
//				let skipval = skipIndexes.pop();
//				if ((projectval >= 0 && skipval >= 0) && (skipval - projectval == 1)) {
//					let skipQuery = this.pipeline['pipelineQuery'][skipval];
//					this.pipeline['pipelineQuery'][skipval] = this.pipeline['pipelineQuery'][projectval];
//					this.pipeline['pipelineStage'][projectval] = skipQuery;

//					let skipStage = this.pipeline['pipelineStage'][skipval];
//					this.pipeline['pipelineStage'][skipval] = this.pipeline['pipelineStage'][projectval];
//					this.pipeline['pipelineStage'][projectval] = skipStage;
//				}
//				else if ((unsetval >= 0 && skipval >= 0) && (skipval - unsetval == 1)) {
//					let skipQuery = this.pipeline['pipelineQuery'][skipval];
//					this.pipeline['pipelineQuery'][skipval] = this.pipeline['pipelineQuery'][unsetval];
//					this.pipeline['pipelineStage'][unsetval] = skipQuery;

//					let skipStage = this.pipeline['pipelineStage'][skipval];
//					this.pipeline['pipelineStage'][skipval] = this.pipeline['pipelineStage'][unsetval];
//					this.pipeline['pipelineStage'][unsetval] = skipStage;
//				}
//			}
//		}
//	}

//	sequenceOptimizer(pipeline: any[]) {
//		let finalquery: any[] = [];
//		var pipelineStage: any[] = pipeline.map(x => Object.keys(x)[0]);
//		var pipelineQuery: any[] = pipeline.map(x => Object.values(x)[1]);
//		this.pipeline['pipelineStage'] = pipelineStage;
//		this.pipeline['pipelineQuery'] = pipelineQuery;
//		//--------------------------
//		//call all sequence optimization methods and update pipelineStage & pipelineQuery
//		this.projectMatchOptimization()
//		this.sortMatchOptimization()
//		this.redactMatchOptimzation()
//		this.projectSkipOptimization()

//		//add everything in finalquery and return it
//		if (this.pipeline['pipelineStage'].length == this.pipeline['pipelineQuery'].length) {
//			for (let i = 0; i < this.pipeline['pipelineStage'].length; i++) {
//				let query: any = new Object();
//				query[this.pipeline['pipelineStage'][i]] = this.pipeline['pipelineQuery'][i];
//				finalquery.push(query);
//			}
//		}
//		return finalquery;
//	}
//}