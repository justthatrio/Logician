/// <reference path="./pre-processors.d.ts"/>
/**
 * @param {LogicZone} zone 
 */
function processor(zone){
    zone.traverse(node=>{
        console.log(node);
        for (let outputIndex = 0; outputIndex < node.outputs.length; outputIndex++) {
            const output = node.outputs[outputIndex];
            // Every output can only have one wire, but in-editor they can have multiple edges 
            if(output.edges.length>1){
                let rootSplitter = edgesToSplitters(zone, output.edges);
                node.clearEdges(outputIndex);
                node.linkTo(rootSplitter, outputIndex, 0);
            }
        }
    })
}

/**
 * 
 * @param {LogicZone} zone 
 * @param {Array<Edge>} edges 
 */
function edgesToSplitters(zone, edges){
    function createSplitter(leftOut, rightOut){
        let splitter = zone.newNode("splitter");
        splitter.linkTo(leftOut[0], 0, leftOut[1]);
        splitter.linkTo(rightOut[0], 1, rightOut[1]);
        return [splitter, 0];
    }
    let stack = [...edges.map(e=>[e.node, e.toIndex])];
    while (true) {
        stack.unshift(createSplitter(stack.shift(), stack.shift()));
        if(stack.length == 1) return stack[0][0];
    }
}