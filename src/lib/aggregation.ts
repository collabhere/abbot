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
    sortLimitCoalescence: function(pipelineStage : any[], pipelineQuery: any[]) {
        let sortIndexes = getMatchIndexes(pipelineStage, '$sort');
        let limitIndexes = getMatchIndexes(pipelineStage, '$limit');
        let groupIndexes = getMatchIndexes(pipelineStage, '$group');
        let unwindIndexes = getMatchIndexes(pipelineStage, '$unwind');

        if(sortIndexes.length && limitIndexes.length) { //we will apply sort limit coalescence
            while((sortIndexes.length + limitIndexes.length) != 0) {
                let sortval = sortIndexes.pop();
                let limitval = limitIndexes.pop();
                let groupval = groupIndexes.pop();
                let unwindval = unwindIndexes.pop();
                if(sortval >=0 && limitval >=0 
                    && sortval <= pipelineStage.length && limitval <= pipelineStage.length
                    && sortval < limitval
                    && !between(groupval, sortval, limitval)
                    && !between(unwindval, sortval, limitval)) { //we'll perform coalesce
                        pipelineQuery[sortval]['limit'] = pipelineQuery[limitval]
                        pipelineStage.splice(sortval, 1);
                        pipelineQuery.splice(limitval, 1); 
                    }
            }
        }
    },
    limitLimitCoalescence: function (pipelineStage: any[], pipelineQuery: any[]) {
        let limitIndexes = getMatchIndexes(pipelineStage, '$limit');
        if(limitIndexes.length) {
            for(let i=0; i<limitIndexes.length-1; i++) {
                let currentval = limitIndexes[i];
                let nextval = limitIndexes[i+1];
                if (currentval >= 0 && nextval >= 0 && nextval-currentval == 1) { //if 2 limit's are consecutive then we will coalesce
                    pipelineQuery[currentval] = pipelineQuery[currentval]<pipelineQuery[nextval] ? pipelineQuery[currentval] : pipelineQuery[nextval] //smaller of the 2 values is taken
                    pipelineStage.splice(nextval, 1);
                    pipelineQuery.splice(nextval, 1);
                }
            }
        }
    },
    skipSkipCoalescence: function (pipelineStage: any[], pipelineQuery: any[]) {
        let skipIndexes = getMatchIndexes(pipelineStage, '$skip');
        if(skipIndexes.length) {
            for (let i = 0; i < skipIndexes.length - 1; i++) {
                let currentval = skipIndexes[i];
                let nextval = skipIndexes[i + 1];
                if (currentval >= 0 && nextval >= 0 && nextval - currentval == 1) { //if 2 skips's are consecutive then we will coalesce
                    pipelineQuery[currentval] = pipelineQuery[currentval] + pipelineQuery[nextval] //add the 2 skip values
                    pipelineStage.splice(nextval, 1);
                    pipelineQuery.splice(nextval, 1);
                }
            }
        }
    },
    matchMatchCoalescence: function (pipelineStage: any[], pipelineQuery: any[]) {
        let matchIndexes = getMatchIndexes(pipelineStage, '$match');
        if(matchIndexes) {
            for (let i = 0; i < matchIndexes.length - 1; i++) {
                let currentval = matchIndexes[i];
                let nextval = matchIndexes[i + 1];
                if (currentval >= 0 && nextval >= 0 && nextval - currentval == 1) { //if 2 match stages are consecutive then we will coalesce
                    let newMatchObj : any = new Object();
                    newMatchObj['$and'] = [pipelineQuery[currentval], pipelineQuery[nextval]]; 
                    pipelineQuery[currentval] = newMatchObj //combine the match stages
                    pipelineStage.splice(nextval, 1);
                    pipelineQuery.splice(nextval, 1);
                }
            }
        }
    },
    lookupUnwindCoalescence: function (pipelineStage: any[], pipelineQuery: any[]) {
        let lookupIndexes = getMatchIndexes(pipelineStage, '$lookup');
        let unwindIndexes = getMatchIndexes(pipelineStage, '$unwind');
        if (lookupIndexes.length && unwindIndexes.length) { //we will apply sort limit coalescence
            while ((lookupIndexes.length + unwindIndexes.length) != 0) {
                let lookupval = lookupIndexes.pop();
                let unwindval = unwindIndexes.pop();
                if (lookupval >= 0 && unwindval >= 0
                    && lookupval <= pipelineStage.length && unwindval <= pipelineStage.length
                    && unwindval - lookupval == 0) { //we'll perform coalesce
                    pipelineQuery[lookupval]['unwinding'] = { preserveNullAndEmptyArrays: false }
                    pipelineStage.splice(unwindval, 1);
                    pipelineQuery.splice(unwindval, 1);
                }
            }
        }
    },
    coalescenceCheck: function (pipeline: any[]) {
        let finalquery : any[] = [];
        var pipelineStage : any[] = pipeline.map(x => Object.keys(x)[0]);
        var pipelineQuery : any[] = pipeline.map(x => Object.values(x)[1]);
        //--------------------------
        //call all coalescence functions and update pipelineStage & pipelineQuery
        this.sortLimitCoalescence(pipelineStage, pipelineQuery)
        this.limitLimitCoalescence(pipelineStage, pipelineQuery)
        this.skipSkipCoalescence(pipelineStage, pipelineQuery)
        this.matchMatchCoalescence(pipelineStage, pipelineQuery)
        this.lookupUnwindCoalescence(pipelineStage, pipelineQuery)
        
        //add everything in finalquery and return it
        if(pipelineStage.length == pipelineQuery.length) {
            for(let i=0; i<pipelineStage.length; i++) {
                let query : any = new Object();
                query[pipelineStage[i]] = pipelineQuery[i];
                finalquery.push(query);
            }
        }
        return finalquery;
    }
})

export type Aggregation = ReturnType<typeof Aggregation>;