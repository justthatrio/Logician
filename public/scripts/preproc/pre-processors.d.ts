interface Edge{
    node: LogicNode
    fromIndex: number
    toIndex: number
}

interface Output{
    /**
     * Transfers the edges coming from this output to another modules specified output
     * @param module A LogicNode reference to transfer the edges to
     * @param toIndex The index of the output on 'module' to transfer the edges to
     */
    transferEdges(module: LogicNode, toIndex: number): void
    /**
     * This outputs outgoing edges
     */
    edges: Array<Edge>
}

interface LogicNode{
    /**
     * The type of the module this node represents, synonamous with 'identifier' on the top level API
     */
    identifier: string 
    /**
     * A unique uuidv4 identifying the node in its workspace
     */
    id: string
    /**
     * X component of the nodes position
     */
    x: number
    /**
     * Y component of the nodes position
     */
    y: number
    memory: Object
    /**
     * This nodes outgoing edges for all outputs
     */
    edges: Array<Edge>
    /**
     * Handles for a LogicNdoes outputs
     */
    outputs:Array<Output>
    /**
     * Removes a single edge from the specified output
     * @param outputIndex Index of the output
     * @param edgeIndex Index of the outputs edge
     */
    removeEdge(outputIndex: number, edgeIndex: number): void
    /**
     * Clears the edges from a specified output
     * @param outputIndex Index of the output
     */
    clearEdges(index: number): void
    /**
     * The LogicNodes connecting to this node
     */
    incomingnodes: Array<LogicNode>
}

/**
 * Hmm
 * @param node LogicNode
 */
declare function NodeHandler(node: LogicNode) : void

/**
 * Represents either an entire LogicWorkspace, or an area of a LogicWorkspace
 */
interface LogicZone{
    /**
     * Traverses the nodes of a LogicZone in order of the trees initial state. (Changes made by the handler are represented on the passedNode references but not in the order of traversal)
     * @param handler A function thats sequentially passed nodes
     */
    traverse(handler: typeof NodeHandler) : void
    nodes: Array<LogicNode>
    /**
     * Creates and adds a LogicNode to the workspace, returning a reference to it. For creating nodes with no incomming connections
     * @param identifier Module type
     * @param memory Optional memory for the module
     */
    addNode(identifier: string, memory=undefined|Object): LogicNode
    /**
     * Creates a LogicNode without adding it to the workspace, returning a reference to it. For creating nodes with incomming connections
     * @param identifier Module type
     * @param memory Optional memory for the module
     */
    newNode(identifier: string, memory=undefined|Object): LogicNode
}

interface WorkspaceEvent{
    node: LogicNode
    trigger: "user"|"preproccesor"
} 