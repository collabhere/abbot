function getMatchIndexes(arr : any[], checkValue : string) { 
    return arr.reduce((acc, val, index) => {
        if (val == checkValue) {
            acc.push(index);
        }
        return acc;
    }, []);   
}

function between(x: number, min: number, max: number) {
    return x >= min && x <= max;
}


//We can create a main Aggregation class that extends these optimzation classes and call them from there
/*
class Aggregation extends CoalescenceOptimization, PipelineSequenceOptimization {
    constructor(pipeline) {

    }
    
    convertPipline() {
        call these optimzation functions here
    }
}
*/

class CoalescenceOptimization {
    pipeline: any;
    sortLimitCoalescence() {
        let sortIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$sort');
        let limitIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$limit');
        let groupIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$group');
        let unwindIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$unwind');

        if (sortIndexes.length && limitIndexes.length) { //we will apply sort limit coalescence
            while ((sortIndexes.length + limitIndexes.length) != 0) {
                let sortval = sortIndexes.pop();
                let limitval = limitIndexes.pop();
                let groupval = groupIndexes.pop();
                let unwindval = unwindIndexes.pop();
                if (sortval >= 0 && limitval >= 0
                    && sortval <= this.pipeline['pipelineStage'].length && limitval <= this.pipeline['pipelineStage'].length
                    && sortval < limitval
                    && !between(groupval, sortval, limitval)
                    && !between(unwindval, sortval, limitval)) { //we'll perform coalesce
                    this.pipeline['pipelineQuery'][sortval]['limit'] = this.pipeline['pipelineQuery'][limitval]
                    this.pipeline['pipelineStage'].splice(limitval, 1);
                    this.pipeline['pipelineQuery'].splice(limitval, 1);
                }
            }
        }
    }

    limitLimitCoalescence() {
        let limitIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$limit');
        if (limitIndexes.length) {
            for (let i = 0; i < limitIndexes.length - 1; i++) {
                let currentval = limitIndexes[i];
                let nextval = limitIndexes[i + 1];
                if (currentval >= 0 && nextval >= 0 && nextval - currentval == 1) { //if 2 limit's are consecutive then we will coalesce
                    this.pipeline['pipelineQuery'][currentval] = this.pipeline['pipelineQuery'][currentval] < this.pipeline['pipelineQuery'][nextval] ? this.pipeline['pipelineQuery'][currentval] : this.pipeline['pipelineQuery'][nextval] //smaller of the 2 values is taken
                    this.pipeline['pipelineStage'].splice(nextval, 1);
                    this.pipeline['pipelineQuery'].splice(nextval, 1);
                }
            }
        }
    }

    skipSkipCoalescence() {
        let skipIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$skip');
        if (skipIndexes.length) {
            for (let i = 0; i < skipIndexes.length - 1; i++) {
                let currentval = skipIndexes[i];
                let nextval = skipIndexes[i + 1];
                if (currentval >= 0 && nextval >= 0 && nextval - currentval == 1) { //if 2 skips's are consecutive then we will coalesce
                    this.pipeline['pipelineQuery'][currentval] = this.pipeline['pipelineQuery'][currentval] + this.pipeline['pipelineQuery'][nextval] //add the 2 skip values
                    this.pipeline['pipelineStage'].splice(nextval, 1);
                    this.pipeline['pipelineQuery'].splice(nextval, 1);
                }
            }
        }
    }

    matchMatchCoalescence() {
        let matchIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$match');
        if (matchIndexes) {
            for (let i = 0; i < matchIndexes.length - 1; i++) {
                let currentval = matchIndexes[i];
                let nextval = matchIndexes[i + 1];
                if (currentval >= 0 && nextval >= 0 && nextval - currentval == 1) { //if 2 match stages are consecutive then we will coalesce
                    let newMatchObj: any = new Object();
                    newMatchObj['$and'] = [this.pipeline['pipelineQuery'][currentval], this.pipeline['pipelineQuery'][nextval]];
                    this.pipeline['pipelineQuery'][currentval] = newMatchObj //combine the match stages
                    this.pipeline['pipelineStage'].splice(nextval, 1);
                    this.pipeline['pipelineQuery'].splice(nextval, 1);
                }
            }
        }
    }

    lookupUnwindCoalescence() {
        let lookupIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$lookup');
        let unwindIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$unwind');
        if (lookupIndexes.length && unwindIndexes.length) { //we will apply sort limit coalescence
            while ((lookupIndexes.length + unwindIndexes.length) != 0) {
                let lookupval = lookupIndexes.pop();
                let unwindval = unwindIndexes.pop();
                if (lookupval >= 0 && unwindval >= 0
                    && lookupval <= this.pipeline['pipelineStage'].length && unwindval <= this.pipeline['pipelineStage'].length
                    && unwindval - lookupval == 0) { //we'll perform coalesce
                    this.pipeline['pipelineQuery'][lookupval]['unwinding'] = { preserveNullAndEmptyArrays: false }
                    this.pipeline['pipelineStage'].splice(unwindval, 1);
                    this.pipeline['pipelineQuery'].splice(unwindval, 1);
                }
            }
        }
    }

    coalescenceConverter(pipeline: any[]) {
        let finalquery: any[] = [];
        var pipelineStage: any[] = pipeline.map(x => Object.keys(x)[0]);
        var pipelineQuery: any[] = pipeline.map(x => Object.values(x)[1]);
        this.pipeline['pipelineStage'] = pipelineStage;
        this.pipeline['pipelineQuery'] = pipelineQuery;
        //--------------------------
        //call all coalescence functions and update pipelineStage & pipelineQuery
        this.sortLimitCoalescence()
        this.limitLimitCoalescence()
        this.skipSkipCoalescence()
        this.matchMatchCoalescence()
        this.lookupUnwindCoalescence()

        //add everything in finalquery and return it
        if (this.pipeline['pipelineStage'].length == this.pipeline['pipelineQuery'].length) {
            for (let i = 0; i < this.pipeline['pipelineStage'].length; i++) {
                let query: any = new Object();
                query[this.pipeline['pipelineStage'][i]] = this.pipeline['pipelineQuery'][i];
                finalquery.push(query);
            }
        }
        return finalquery;
    }
}

class PipelineSequenceOptimization {
    pipeline: any;

    projectMatchOptimization() {
        //($project or $unset or $addFields or $set) + $match Sequence Optimization

        //Kinda confusing, wasn't able to come up with a optimized way to do that

    }
    
    sortMatchOptimization() {
        let sortIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$sort');
        let matchIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$match');

        if (sortIndexes.length && matchIndexes.length) {
            while (sortIndexes.length + matchIndexes.length != 0) {
                let sortval = sortIndexes.pop();
                let matchval = matchIndexes.pop();
                if ((sortval >= 0 && matchval >= 0) && (matchval - sortval == 1)) {
                    let sortQuery = this.pipeline['pipelineQuery'][sortval];
                    this.pipeline['pipelineQuery'][sortval] = this.pipeline['pipelineQuery'][matchval];
                    this.pipeline['pipelineStage'][matchval] = sortQuery;

                    let sortStage = this.pipeline['pipelineStage'][sortval];
                    this.pipeline['pipelineStage'][sortval] = this.pipeline['pipelineStage'][matchval];
                    this.pipeline['pipelineStage'][matchval] = sortStage;
                }
            }
        }
    }

    redactMatchOptimzation() {
        let redactIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$redact');
        let matchIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$match');

        if (redactIndexes.length && matchIndexes.length) {
            while (redactIndexes.length + matchIndexes.length != 0) {
                let redactval = redactIndexes.pop();
                let matchval = matchIndexes.pop();
                if ((redactval >= 0 && matchval >= 0) && (matchval - redactval == 1)) {
                    this.pipeline['pipelineQuery'].splice(redactval, 0 , this.pipeline['pipelineQuery'][matchval]);
            
                    this.pipeline['pipelineStage'].splice(redactval, 0, this.pipeline['pipelineStage'][matchval]);
                }
            }
        }
    }

    projectSkipOptimization() {
        let projectIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$project');
        let unsetIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$unset');
        let skipIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$skip');

        if((projectIndexes.length || unsetIndexes.length) && skipIndexes.length) {
            while (projectIndexes.length + unsetIndexes.length + skipIndexes.length != 0) {
                let projectval = projectIndexes.pop();
                let unsetval = unsetIndexes.pop();
                let skipval = skipIndexes.pop();
                if((projectval>=0 && skipval>=0) && (skipval - projectval == 1)) {
                    let skipQuery = this.pipeline['pipelineQuery'][skipval];
                    this.pipeline['pipelineQuery'][skipval] = this.pipeline['pipelineQuery'][projectval];
                    this.pipeline['pipelineStage'][projectval] = skipQuery;

                    let skipStage = this.pipeline['pipelineStage'][skipval];
                    this.pipeline['pipelineStage'][skipval] = this.pipeline['pipelineStage'][projectval];
                    this.pipeline['pipelineStage'][projectval] = skipStage;
                }
                else if ((unsetval >= 0 && skipval >= 0) && (skipval - unsetval == 1)) {
                    let skipQuery = this.pipeline['pipelineQuery'][skipval];
                    this.pipeline['pipelineQuery'][skipval] = this.pipeline['pipelineQuery'][unsetval];
                    this.pipeline['pipelineStage'][unsetval] = skipQuery;

                    let skipStage = this.pipeline['pipelineStage'][skipval];
                    this.pipeline['pipelineStage'][skipval] = this.pipeline['pipelineStage'][unsetval];
                    this.pipeline['pipelineStage'][unsetval] = skipStage;
                }
            }
        }
    }

    sequenceOptimizer(pipeline: any[]) {
        let finalquery: any[] = [];
        var pipelineStage: any[] = pipeline.map(x => Object.keys(x)[0]);
        var pipelineQuery: any[] = pipeline.map(x => Object.values(x)[1]);
        this.pipeline['pipelineStage'] = pipelineStage;
        this.pipeline['pipelineQuery'] = pipelineQuery;
        //--------------------------
        //call all sequence optimization methods and update pipelineStage & pipelineQuery
        this.projectMatchOptimization()
        this.sortMatchOptimization()
        this.redactMatchOptimzation()
        this.projectSkipOptimization()

        //add everything in finalquery and return it
        if (this.pipeline['pipelineStage'].length == this.pipeline['pipelineQuery'].length) {
            for (let i = 0; i < this.pipeline['pipelineStage'].length; i++) {
                let query: any = new Object();
                query[this.pipeline['pipelineStage'][i]] = this.pipeline['pipelineQuery'][i];
                finalquery.push(query);
            }
        }
        return finalquery;
    }
}