<script setup>
import { inject, reactive, ref, onMounted, nextTick } from 'vue';
import EpWarning from '~icons/ep/warning'
const nodeData = reactive({
    nodeName: t('lang.gotoNode.nodeName'),
    brief: '',
    exitPrompt: '',
    valid: false,
    invalidMessages: [],
    newNode: true,
});
const getNode = inject('getNode');

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
    selectGotoType(nodeData.goToType);
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
    if (nodeData.newNode)
        nodeData.nodeName += data.nodeCnt.toString();
    nodeData.newNode = false;
    validate();

    const r = await httpReq('GET', 'mainflow', null, null, null);
    // console.log(r);
    if (r.status == 200)
        mainFlows.value = r.data;
    if (data.gotoSubFlowId) {
        await selectedMainFlow(data.gotoMainFlowId);
    }
})

const models = [
    { label: 'microsoft/Phi-3-mini-4k-instruct (135MB)', value: 'Phi3Mini4kInstruct' },
    { label: 'microsoft/Phi-3-mini-128k-instruct (135MB)', value: 'Phi3Mini128kInstruct' },
    { label: 'microsoft/Phi-3-small-8k-instruct (439MB)', value: 'Phi3Small8kInstruct' },
    { label: 'microsoft/Phi-3-small-128k-instruct (439MB)', value: 'Phi3Small128kInstruct' },
    { label: 'microsoft/Phi-3-medium-4k-instruct (439MB)', value: 'Phi3Medium4kInstruct' },
    { label: 'microsoft/Phi-3-medium-128k-instruct (439MB)', value: 'Phi3Medium128kInstruct' },
    { label: 'google/gemma-2b-it (1.11GB)', value: 'Gemma2bInstruct', need_auth_header: true },
    { label: 'google/gemma-7b-it (1.11GB)', value: 'Gemma7bInstruct', need_auth_header: true },
    { label: 'meta-llama/Meta-Llama-3-8B-Instruct (1.11GB)', value: 'MetaLlama3_8bInstruct', need_auth_header: true },
    { label: 'upstage/SOLAR-10.7B-v1.0 (1.11GB)', value: 'Solar10_7bV1_0' },
    { label: 'TinyLlama/TinyLlama-1.1B-Chat-v1.0 (1.11GB)', value: 'TinyLlama1_1bChatV1_0' },
    { label: 'Qwen/Qwen2-72B-Instruct (91MB)', value: 'Qwen2_72BInstruct', dimenssions: 384 },
];


</script>
<style scoped></style>
<template>
    <div class="nodeBox">
        <div class="nodeTitle">
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
        <div>{{ nodeData.brief }}</div>
        <!-- <teleport to="body"> -->
        <el-drawer v-if="nodeSetFormVisible" v-model="nodeSetFormVisible" :title="nodeData.nodeName" direction="rtl"
            size="70%" :append-to-body="true" :destroy-on-close="true">
            <el-form :label-position="labelPosition" label-width="70px" :model="nodeData" style="max-width: 700px">
                <el-form-item :label="t('lang.common.nodeName')" :label-width="formLabelWidth">
                    <el-input v-model="nodeData.nodeName" />
                </el-form-item>
                <el-form-item label="Chat model" :label-width="formLabelWidth">
                    <el-select v-model="nodeData.chatModel">
                        <el-option v-for="item in models" :key="item.label" :label="item.label" :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="Context window" :label-width="formLabelWidth">
                    <el-input-number v-model="nodeData.contextLength" :min="0" :max="100000" :step="10" />
                </el-form-item>
                <el-form-item label="Context length" :label-width="formLabelWidth">
                    <el-input-number v-model="nodeData.contextLength" :min="0" :max="100000" :step="10" />
                </el-form-item>
                <el-form-item label="Exit prompt" :label-width="formLabelWidth">
                    <el-input v-model="nodeData.exitPrompt" />
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