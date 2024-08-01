<script setup>
import { inject, reactive, ref, onMounted, nextTick } from 'vue';
import { copyProperties, httpReq, getDefaultBranch } from '../../../assets/tools.js'
import { useI18n } from 'vue-i18n'
import EpWarning from '~icons/ep/warning'
const { t, tm, rt } = useI18n();
const nodeData = reactive({
    nodeName: 'Llm chat node',
    brief: '',
    nodeExitType: 'exitByIntent',
    contextLength: 5,
    exitIntent: '',
    exitSpecificInputs: '',
    maxChatTimes: 1,
    valid: false,
    invalidMessages: [],
    newNode: true,
});
const getNode = inject('getNode');
const { robotId } = inject('robotId');
// const { ollamaModels } = inject('ollamaModels');
const nodeSetFormVisible = ref(false)
const intents = reactive([])
const modelId = ref('')
const modelName = ref('')
const nodeName = ref();

getNode().on("change:data", ({ current }) => {
    // console.log('toggled');
    // const { name, text, nodeSetFormVisible } = current;
    nodeSetFormVisible.value = true;
});

onMounted(async () => {
    // console.log('gotoNode')
    const node = getNode();
    const data = node.getData();
    copyProperties(data, nodeData);
    // if (data) {
    //     if (data.nodeName)
    //         nodeData.nodeName = data.nodeName;
    //     nodeData.goToType = data.goToType;
    //     selectGotoType(nodeData.goToType);
    //     nodeData.goToSubFlowId = data.goToSubFlowId;
    //     nodeData.goToSubFlowName = data.goToSubFlowName;
    //     nodeData.brief = data.brief;
    //     nodeData.externalLink = data.externalLink;
    //     if (data.newNode)
    //         nodeData.newNode = data.newNode;
    // }
    node.addPort({
        group: 'absolute',
        args: { x: nodeName.value.offsetWidth - 15, y: 104 },
        markup: [
            { tagName: "circle", selector: "bopdy" },
            { tagName: "rect", selector: "bg" }
        ],
        attrs: {
            text: {
                text: 'Next',
                fontSize: 12,
            },
            // https://codesandbox.io/s/port-label-viwnos?file=/src/App.tsx
            bg: {
                ref: "text",
                refWidth: "100%",
                refHeight: "110%",
                refX: "-100%",
                refX2: -15,
                refY: -5,
                fill: "rgb(235,238,245)"
            }
        },
    });

    if (nodeData.newNode)
        nodeData.nodeName += data.nodeCnt.toString();
    nodeData.newNode = false;
    validate();
    httpReq("GET", 'management/settings', { robotId: robotId }, null, null).then((res) => {
        // const r = res.json();
        if (res.data) {
            updateBrief(res.data);
        }
    })
    const r = await httpReq('GET', 'intent', { robotId: robotId }, null, null);
    // console.log(r);
    if (r.status == 200)
        intents.splice(0, intents.length, ...r.data);
})

const updateBrief = (settings) => {
    modelId.value = settings.chatProvider.provider.id;
    modelName.value = settings.chatProvider.provider.model;
    let h = 'Chat model: ' + settings.chatProvider.provider.model + ' from ' + settings.chatProvider.provider.id;
    h += '<br/>History context length: ' + nodeData.contextLength;
    h += '<br/>Exit this node by: ' + nodeData.nodeExitType;
    nodeData.brief = h;
}

const validate = () => { }

const saveForm = () => {
    hideForm();
}

const hideForm = () => {
    nodeSetFormVisible.value = false;
}

</script>
<style scoped>
.nodeBox {
    border: 2px #0000000e solid;
    height: 100%;
    width: 100%;
    background-color: white;
    font-size: 12px;
}

.nodeTitle {
    background-color: #6a2c70;
    color: white;
    font-weight: 500;
    font-size: 14px;
    padding: 5px;
}

.optionWidth {
    width: 110px;
}
</style>
<template>
    <div class="nodeBox">
        <div ref="nodeName" class="nodeTitle">
            {{ nodeData.nodeName }}
            <span v-show="nodeData.invalidMessages.length > 0">
                <el-tooltip class="box-item" effect="dark" :content="nodeData.invalidMessages.join('<br/>')"
                    placement="bottom" raw-content>
                    <el-icon color="red" size="16">
                        <EpWarning />
                    </el-icon>
                </el-tooltip>
            </span>
        </div>
        <div v-html="nodeData.brief"></div>
        <!-- <teleport to="body"> -->
        <el-drawer v-if="nodeSetFormVisible" v-model="nodeSetFormVisible" :title="nodeData.nodeName" direction="rtl"
            size="70%" :append-to-body="true" :destroy-on-close="true">
            <el-form :label-position="labelPosition" label-width="106px" :model="nodeData" style="max-width: 700px">
                <el-form-item :label="t('lang.common.nodeName')" :label-width="formLabelWidth">
                    <el-input v-model="nodeData.nodeName" />
                </el-form-item>
                <el-form-item label="Chat model" :label-width="formLabelWidth">
                    {{ modelId }} - {{ modelName }}
                    (<router-link :to="{ name: 'settings', params: { robotId: robotId } }">change</router-link>)
                </el-form-item>
                <el-form-item label="History length" :label-width="formLabelWidth">
                    <el-input-number v-model="nodeData.contextLength" :min="0" :max="50" :step="5" />
                    How many chat history records will be added in prompt.
                </el-form-item>
                <el-form-item label="Exit condition" :label-width="formLabelWidth">
                    <el-radio-group v-model="nodeData.nodeExitType">
                        <el-radio value="exitByIntent">Intent</el-radio>
                        <el-radio value="exitBySpecificInputs">Specific inputs</el-radio>
                        <el-radio value="exitByMaxChatTimes">Max chat times</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="" :label-width="formLabelWidth">
                    <el-select v-model="nodeData.exitIntent" v-show="nodeData.nodeExitType == 'exitByIntent'">
                        <el-option v-for="item in intents" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                    <el-input v-model="nodeData.exitSpecificInputs" v-show="nodeData.nodeExitType == 'exitBySpecificInputs'" />
                    <el-input-number v-model="nodeData.maxChatTimes" :min="1" :max="99999" :step="1"
                        v-show="nodeData.nodeExitType == 'exitByMaxChatTimes'" />
                </el-form-item>
            </el-form>
            <div>
                <el-button type="primary" @click="saveForm()">{{ t('lang.common.save') }}</el-button>
                <el-button @click="hideForm()">{{ t('lang.common.cancel') }}</el-button>
            </div>
        </el-drawer>
        <!-- </teleport> -->
    </div>
</template>