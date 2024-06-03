/// <reference path="./pre-processors.d.ts"/>

function sternBrocot(floatNum, resolution) {
    let lowerNumerator = 0;
    let lowerDenominator = 1;
    let upperNumerator = 1;
    let upperDenominator = 0;

    while (lowerDenominator + upperDenominator <= resolution) {
        let middleNumerator = lowerNumerator + upperNumerator;
        let middleDenominator = lowerDenominator + upperDenominator;

        if (floatNum < middleNumerator / middleDenominator) {
            upperNumerator = middleNumerator;
            upperDenominator = middleDenominator;
        } else {
            lowerNumerator = middleNumerator;
            lowerDenominator = middleDenominator;
        }
    }

    if (Math.abs(floatNum - lowerNumerator / lowerDenominator) < Math.abs(floatNum - upperNumerator / upperDenominator)) {
        return [lowerNumerator, lowerDenominator];
    } else {
        return [upperNumerator, upperDenominator];
    }
}
function invertedSternBrocot(floatNum, resolution) {
    let lowerNumerator = 0;
    let lowerDenominator = 1;
    let upperNumerator = 1;
    let upperDenominator = 0;

    while (lowerDenominator + upperDenominator <= resolution) {
        let middleNumerator = lowerNumerator + upperNumerator;
        let middleDenominator = lowerDenominator + upperDenominator;

        if (floatNum < middleNumerator / middleDenominator) {
            upperNumerator = middleNumerator;
            upperDenominator = middleDenominator;
        } else {
            lowerNumerator = middleNumerator;
            lowerDenominator = middleDenominator;
        }
    }

    // Invert the fraction
    if (Math.abs(floatNum - Math.round(lowerNumerator / lowerDenominator)) < Math.abs(floatNum - Math.round(upperNumerator / upperDenominator))) {
        return [lowerDenominator, lowerNumerator]; // Inverted fraction
    } else {
        return [upperDenominator, upperNumerator]; // Inverted fraction
    }
}

const u = "UNCONSTRAINED"

var resolution = 100;

// PrecisionZones.getFactorAt();

function processor(zone){
    zone.traverse(node=>{
        if(node.type == "bit_module"){
            if(node.memory.storedSign == "*" || node.memory.storedSign == "/"){
                
                
                // A mod wqith no edges is interpreted as one with no outputs when passed to a processor
                if(node.outputs[0]){
                    // only fractions at this resolution need to be converted                    
                    if(node.memory.storedBitConstant && node.memory.storedBitConstant/resolution != Math.round(node.memory.storedBitConstant/resolution)){
                        // Optimization for constants: If no inputs are coming in on the right side of a bit_module, then the node can be substituted with a constant fraction 
                        if(!(node.inputs && node.inputs[1] && node.inputs[1].incommingNodes.length)){
                            let fraction = (node.memory.storedSign == "*"? sternBrocot : invertedSternBrocot)(node.memory.storedBitConstant, resolution);
                            
                            if(fraction[0] !== 1){
                                let divisor = zone.newNode("bit_module", {
                                    storedSign: "/",
                                    storedBitConstant:fraction[1]
                                });
                                node.storedSign = "*";
                                node.memory.storedBitConstant = fraction[0];
                                // intercept the wires coming from the bitmodule's(node) first output, with the divisor  
                                node.outputs[0].transferEdges(divisor, 0);
                                node.linkTo(divisor, 0, 0);
                            }else{
                                node.memory.storedSign = "/";
                                node.memory.storedBitConstant = fraction[1];
                            }
                        }
                    }
                }
            }else{
                // Dont update the bits memory if the circuit is actively contributing to its value (if the value is coming from outside the zone it wont be scaled but thats intended behaviour)
                if(!node.inputs || !node.inputs[1].incommingNodes.length){
                    node.memory.storedBitConstant = node.memory.storedBitConstant*resolution;
                }
            }
        }
        if(node.type == "bit_node"){
            node.memory.storedBitConstant = node.memory.storedBitConstant*resolution;            
        }
    });
}
