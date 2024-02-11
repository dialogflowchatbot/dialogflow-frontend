<script setup>
import { inject, onMounted, reactive, ref } from 'vue'
import { copyProperties, httpReq } from '../../../assets/tools.js'

import { useI18n } from 'vue-i18n'
const { t, tm } = useI18n();

const nodeData = reactive({
    nodeName: 'Send email node',
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    content: '',
    asyncSend: true,
    valid: false,
    invalidMessages: [],
    branches: [],
    newNode: true,
})
const nodeName = ref();
const nodeSetFormVisible = ref(false)
const getNode = inject('getNode');
const node = getNode();
const variables = []
node.on("change:data", ({ current }) => {
    nodeSetFormVisible.value = true;
});
onMounted(async () => {
    const data = node.getData();
    // console.log(data);
    copyProperties(data, nodeData);
    // if (data) {
    //     if (data.nodeName)
    //         nodeData.nodeName = data.nodeName;
    //     nodeData.collectType = data.collectType;
    //     nodeData.collectSaveVarName = data.collectSaveVarName;
    //     if (data.newNode)
    //         nodeData.newNode = data.newNode;
    // }
    // console.log(nodeData.newNode);
    if (nodeData.newNode) {
        nodeData.nodeName += data.nodeCnt.toString();
        resetPorts()
        nodeData.newNode = false;
        // console.log(nodeData);
    }
    const t = await httpReq('GET', 'variable', null, null, null);
    // console.log(t);
    if (t && t.status == 200 && t.data) {
        variables.splice(0, variables.length);
        t.data.forEach(function (item, index, arr) {
            this.push({ label: item.varName, value: item.varName });
        }, variables);
    }
    validate();
});
const resetPorts = () => {
    node.removePorts();
    const heightOffset = nodeName.value.offsetHeight + 50;
    const x = nodeName.value.offsetWidth - 15;
    if (nodeData.asyncSend) {
        node.addPort({
            group: 'absolute',
            args: { x: x, y: heightOffset },
            attrs: {
                text: {
                    text: tm('lang.dialogNode.nextSteps')[1],
                    fontSize: 12,
                },
            },
        });
    } else {
        node.addPort({
            group: 'absolute',
            args: { x: x, y: heightOffset },
            attrs: {
                text: {
                    text: tm('lang.collectNode.branches')[0],
                    fontSize: 12,
                },
            },
        });
        node.addPort({
            group: 'absolute',
            args: { x: x, y: heightOffset + 20 },
            attrs: {
                text: {
                    text: tm('lang.collectNode.branches')[1],
                    fontSize: 12,
                },
            },
        });
        node.resize(node.size().width, 40 + heightOffset, { direction: 'bottom' })
    }
}
const validate = () => { }
const saveForm = () => {
    resetPorts()
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
    background-color: rgb(255, 101, 85);
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
                    <el-icon color="red">
                        <EpWarning />
                    </el-icon>
                </el-tooltip>
            </span>
        </div>
        <div>To: {{ nodeData.to }}</div>
        <div>Subject: {{ nodeData.subject }}</div>
        <teleport to="body">
            <el-drawer v-model="nodeSetFormVisible" :title="nodeData.nodeName" direction="rtl" size="70%">
                <el-form :label-position="labelPosition" label-width="90px" :model="nodeData" style="max-width: 500px">
                    <el-form-item :label="t('lang.common.nodeName')" :label-width="formLabelWidth">
                        <el-input v-model="nodeData.nodeName" />
                    </el-form-item>
                    <el-form-item label="To" :label-width="formLabelWidth">
                        <el-input v-model="nodeData.to" placeholder="" />
                    </el-form-item>
                    <el-form-item label="" :label-width="formLabelWidth">
                        Separate multiple recipients with semicolons
                    </el-form-item>
                    <el-form-item label="Cc" :label-width="formLabelWidth">
                        <el-input v-model="nodeData.cc" placeholder="" />
                    </el-form-item>
                    <el-form-item label="Bcc" :label-width="formLabelWidth">
                        <el-input v-model="nodeData.bcc" placeholder="" />
                    </el-form-item>
                    <el-form-item label="Subject" :label-width="formLabelWidth">
                        <el-input v-model="nodeData.subject" placeholder="" />
                    </el-form-item>
                    <el-form-item label="Content" :label-width="formLabelWidth">
                        <el-input v-model="nodeData.content" :rows="2" type="textarea" placeholder="Please input" />
                    </el-form-item>
                    <el-form-item label="" :label-width="formLabelWidth">
                        <input type="checkbox" id="_asyncSend_" v-model="nodeData.asyncSend"
                            :checked="nodeData.asyncSend" /><label for="_asyncSend_">Send asynchronously</label>
                    </el-form-item>
                </el-form>
                <div class="demo-drawer__footer">
                    <el-button type="primary" :loading="loading" @click="saveForm()">{{ t('lang.common.save') }}</el-button>
                    <el-button @click="hideForm()">{{ t('lang.common.cancel') }}</el-button>
                </div>
            </el-drawer>
        </teleport>
    </div>
</template>
