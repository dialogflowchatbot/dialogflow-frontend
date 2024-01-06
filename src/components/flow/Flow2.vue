<script>
import { defineComponent } from "vue";
import DialogNode from './DialogNode.vue'
import { Graph } from '@antv/x6';
import { register, getTeleport } from "@antv/x6-vue-shape";
import bootstrap from 'bootstrap/dist/js/bootstrap.js';
export default {
    data() {
        return {
            nodes: [
                {
                    id: 1,
                    name: '开始节点',
                    type: 'START_NODE'
                },
                {
                    id: 2,
                    name: '对话节点',
                    type: 'DIALOG_NONE'
                },
                {
                    id: 3,
                    name: '条件节点',
                    type: 'CONDITION_NODE'
                },
                {
                    id: 4,
                    name: '跳转节点',
                    type: 'GOTO_NODE'
                }
            ],
            graph: null,
            selectedNode: null,
        }
    },
    mounted() {
        this.initGraph();
    },
    methods: {
        initGraph() {
            const canvas = document.getElementById('canvas');
            this.graph = new Graph({
                container: canvas,
                width: canvas.offsetWidth,
                height: canvas.offsetHeight,
                background: {
                    color: "#F2F7FA",
                },
                autoResize: true,
                connecting: {
                    allowBlank: false,
                    allowLoop: false,
                    allowNode: true,
                    allowMulti: false,
                },
            });
            this.graph.on('node:dblclick', ({ e, x, y, node, view }) => {
                this.selectedNode = node;
                document.getElementById('staticBackdropLabel').innerHTML = node.label;
                const m = new bootstrap.Modal('#staticBackdrop', {
                    keyboard: false
                });
                m.show();
            });
            register({
                shape: "dialog-node",
                width: 100,
                height: 100,
                component: DialogNode,
            });
            Graph.registerNode(
                'custom-rect',
                {
                    // inherit: 'rect',
                    inherit: 'vue-shape',
                    width: 60,
                    height: 40,
                    component: DialogNode,
                    // attrs: {
                    //     body: {
                    //         strokeWidth: 1,
                    //         stroke: '#5F95FF',
                    //         fill: '#EFF4FF',
                    //     },
                    //     text: {
                    //         fontSize: 12,
                    //         fill: '#262626',
                    //     },
                    // },
                    ports: {
                        groups: {
                            top: {
                                position: 'top',
                                attrs: {
                                    circle: {
                                        r: 2,
                                        magnet: true,
                                        stroke: 'black',
                                        strokeWidth: 1,
                                        fill: '#fff',
                                        style: {
                                            visibility: 'hidden',
                                        },
                                    },
                                },
                            },
                            right: {
                                position: 'right',
                                attrs: {
                                    circle: {
                                        r: 2,
                                        magnet: true,
                                        stroke: 'black',
                                        strokeWidth: 1,
                                        fill: '#fff',
                                        style: {
                                            visibility: 'show',
                                        },
                                    },
                                },
                            },
                            bottom: {
                                position: 'bottom',
                                attrs: {
                                    circle: {
                                        r: 2,
                                        magnet: true,
                                        stroke: 'black',
                                        strokeWidth: 1,
                                        fill: '#fff',
                                        style: {
                                            visibility: 'hidden',
                                        },
                                    },
                                },
                            },
                            left: {
                                position: 'left',
                                attrs: {
                                    circle: {
                                        r: 2,
                                        magnet: true,
                                        stroke: 'black',
                                        strokeWidth: 1,
                                        fill: '#fff',
                                        style: {
                                            visibility: 'hidden',
                                        },
                                    },
                                },
                            },
                            line: {
                                position: {
                                    name: 'line',
                                    args: {
                                        start: { x: 100, y: 20 },
                                        end: { x: 100, y: 200 },
                                    },
                                },
                                attrs: {
                                    circle: {
                                        r: 2,
                                        magnet: true,
                                        stroke: 'black',
                                        strokeWidth: 1,
                                        fill: '#fff',
                                        style: {
                                            visibility: 'show',
                                        },
                                    },
                                },
                                label: {
                                    position: 'left',
                                }
                            },
                            absolute: {
                                position: {
                                    name: 'absolute',
                                },
                                attrs: {
                                    circle: {
                                        r: 2,
                                        magnet: true,
                                        stroke: 'black',
                                        strokeWidth: 1,
                                        fill: '#fff',
                                        style: {
                                            visibility: 'show',
                                        },
                                    },
                                },
                                label: {
                                    position: 'left',
                                }
                            },
                        },
                        // items: [
                        //     {
                        //         group: 'top',
                        //     },
                        //     {
                        //         group: 'right',
                        //     },
                        //     {
                        //         group: 'bottom',
                        //     },
                        //     {
                        //         group: 'left',
                        //     },
                        // ],
                    },
                },
                true
            );
            // Graph.registerVueComponent(
            //     'DialogNode',
            //     {
            //         template: '<item @edge="edge"></item>',
            //         components: {
            //             DialogNode
            //         }
            //     },
            //     true
            // );
        },
        addHandleNode(x, y, id, name, type) {
            this.graph.addNode({
                shape: "dialog-node",
                // shape: 'vue-shape',
                x: x,
                y: y,
                width: 100,
                height: 40,
                data: {
                    name: 'x6',
                },
                // label: name,
                // attrs: {
                //     body: {
                //         fill: "#2ECC71",
                //         stroke: "#000",
                //     },
                // label: {
                //     text: name,
                //     fill: "#333",
                //     fontSize: 13,
                //     textAnchor: 'middle',
                //     textVerticalAnchor: 'top',
                //     refY: '20',
                // }
                // },
                // tools: ["button-remove"],
            });
            // type === 'initial'
            //     ?
            //     this.graph.addNode(Tools.initInitialNode(x, y, id, name, type))
            //     :
            //     this.graph.addNode(Tools.initLogicNode(x, y, id, name, type))
        },
        handleDragEnd(e, item) {
            this.addHandleNode(e.pageX, e.pageY - document.getElementById('menu').offsetHeight, new Date().getTime(), item.name, item.type)
        },
        dragoverDiv(ev) {
            ev.preventDefault();
        },
        addPort() {
            if (this.selectedNode) {
                if (this.selectedNode.getPorts().length > 3)
                    this.selectedNode.resize(100, this.selectedNode.size().height + 40);
                this.selectedNode.addPort({
                    group: 'absolute',
                    args: { x: 90, y: this.selectedNode.getPorts().length * 20 + 20 },
                    attrs: {
                        text: {
                            text: "xx123",
                            fontSize: 10,
                        },
                    },
                    // label: {
                    //     position: 'left',
                    // }
                });
            }
        }
    }
}
</script>
<style>
.box {
    width: 100%;
    height: 500px
}

.node-btn {
    cursor: pointer;
}

#menu {
    border-bottom: 1px #000 solid;
}
</style>
<template>
    <div class="box">
        <div id="menu" class="row">
            <div class="col node-btn" v-for="item in nodes" :key="item.id" draggable="true"
                @dragend="handleDragEnd($event, item)">
                <p>{{ item.name }}</p>
            </div>
        </div>
        <div id="canvas" class="row" @dragover="dragoverDiv"></div>
        <TeleportContainer />
        <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
            aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="staticBackdropLabel">Modal title</h1>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ...
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" v-on:click="addPort()">Save</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>