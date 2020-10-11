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

export const Aggregation = () => ({
    //either convert this to a class or create a constructor of sorts that stores pipelineStage & pipelineQuery
    _pipeline : {},
    sortLimitCoalescence: function() {
        let sortIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$sort');
        let limitIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$limit');
        let groupIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$group');
        let unwindIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$unwind');

        if(sortIndexes.length && limitIndexes.length) { //we will apply sort limit coalescence
            while((sortIndexes.length + limitIndexes.length) != 0) {
                let sortval = sortIndexes.pop();
                let limitval = limitIndexes.pop();
                let groupval = groupIndexes.pop();
                let unwindval = unwindIndexes.pop();
                if(sortval >=0 && limitval >=0 
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
    },
    limitLimitCoalescence: function () {
        let limitIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$limit');
        if(limitIndexes.length) {
            for(let i=0; i<limitIndexes.length-1; i++) {
                let currentval = limitIndexes[i];
                let nextval = limitIndexes[i+1];
                if (currentval >= 0 && nextval >= 0 && nextval-currentval == 1) { //if 2 limit's are consecutive then we will coalesce
                    this.pipeline['pipelineQuery'][currentval] = this.pipeline['pipelineQuery'][currentval] < this.pipeline['pipelineQuery'][nextval] ? this.pipeline['pipelineQuery'][currentval] : this.pipeline['pipelineQuery'][nextval] //smaller of the 2 values is taken
                    this.pipeline['pipelineStage'].splice(nextval, 1);
                    this.pipeline['pipelineQuery'].splice(nextval, 1);
                }
            }
        }
    },
    skipSkipCoalescence: function () {
        let skipIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$skip');
        if(skipIndexes.length) {
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
    },
    matchMatchCoalescence: function () {
        let matchIndexes = getMatchIndexes(this.pipeline['pipelineStage'], '$match');
        if(matchIndexes) {
            for (let i = 0; i < matchIndexes.length - 1; i++) {
                let currentval = matchIndexes[i];
                let nextval = matchIndexes[i + 1];
                if (currentval >= 0 && nextval >= 0 && nextval - currentval == 1) { //if 2 match stages are consecutive then we will coalesce
                    let newMatchObj : any = new Object();
                    newMatchObj['$and'] = [this.pipeline['pipelineQuery'][currentval], this.pipeline['pipelineQuery'][nextval]]; 
                    this.pipeline['pipelineQuery'][currentval] = newMatchObj //combine the match stages
                    this.pipeline['pipelineStage'].splice(nextval, 1);
                    this.pipeline['pipelineQuery'].splice(nextval, 1);
                }
            }
        }
    },
    lookupUnwindCoalescence: function () {
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
    },
    coalescenceConverter: function (pipeline: any[]) {
        let finalquery : any[] = [];
        var pipelineStage : any[] = pipeline.map(x => Object.keys(x)[0]);
        var pipelineQuery : any[] = pipeline.map(x => Object.values(x)[1]);
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
                let query : any = new Object();
                query[this.pipeline['pipelineStage'][i]] = this.pipeline['pipelineQuery'][i];
                finalquery.push(query);
            }
        }
        return finalquery;
    }
})

export type Aggregation = ReturnType<typeof Aggregation>;