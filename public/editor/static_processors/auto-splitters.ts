function processor(zone: LogicZone): void {
    zone.traverse(node => {
        console.log(node);
        for (let outputIndex = 0; outputIndex < node.outputs.length; outputIndex++) {
            const output = node.outputs[outputIndex];
            // Every output can only have one wire, but in-editor they can have multiple edges 
            if(output.edges.length > 1){
                let rootSplitter = edgesToSplitters(zone, output.edges);
                node.clearEdges(outputIndex);
                node.linkTo(rootSplitter, outputIndex, 0);
            }
        }
    })
}

function edgesToSplitters(zone: LogicZone, edges: Array<Edge>): LogicNode {
    function createSplitter(leftOut: [LogicNode, number], rightOut: [LogicNode, number]): [LogicNode, number] {
        let splitter = zone.newNode("splitter");
        splitter.linkTo(leftOut[0], 0, leftOut[1]);
        splitter.linkTo(rightOut[0], 1, rightOut[1]);
        return [splitter, 0];
    }
    let stack: Array<[LogicNode, number]> = [...edges.map(e => [e.node, e.toIndex])];
    while (true) {
        stack.unshift(createSplitter(stack.shift()!, stack.shift()!));
        if(stack.length == 1) return stack[0][0];
    }
}