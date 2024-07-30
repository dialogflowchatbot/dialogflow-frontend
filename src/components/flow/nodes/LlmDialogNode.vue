<script setup>
import { inject, reactive, ref, onMounted, nextTick } from 'vue';
import { copyProperties, httpReq, getDefaultBranch } from '../../../assets/tools.js'
import EpWarning from '~icons/ep/warning'
const nodeData = reactive({
    nodeName: 'Llm dialog node',
    brief: 'Chat model:',
    exitIntent: '',
    exitFixedText: '',
    valid: false,
    invalidMessages: [],
    newNode: true,
});
const getNode = inject('getNode');
const { ollamaModels } = inject('ollamaModels');
const intents = reactive([])

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
    if (nodeData.newNode)
        nodeData.nodeName += data.nodeCnt.toString();
    nodeData.newNode = false;
    validate();
    const r = await httpReq('GET', 'intent', null, null, null);
    // console.log(r);
    if (r.status == 200)
        intents.splice(0, intents.length, ...r.data);
})

const validate = () => {}

const chatProviders = [
    {
        id: 'HuggingFace',
        name: 'HuggingFace',
        apiUrl: 'Model will be downloaded locally at ./data/models',
        apiUrlDisabled: true,
        showApiKeyInput: false,
        models: [
            { label: 'microsoft/Phi-3-mini-4k-instruct (7.7GB)', value: 'Phi3Mini4kInstruct' },
            { label: 'microsoft/Phi-3-mini-128k-instruct (7.7GB)', value: 'Phi3Mini128kInstruct' },
            { label: 'microsoft/Phi-3-small-8k-instruct (15GB)', value: 'Phi3Small8kInstruct' },
            { label: 'microsoft/Phi-3-small-128k-instruct (15GB)', value: 'Phi3Small128kInstruct' },
            { label: 'microsoft/Phi-3-medium-4k-instruct (30GB)', value: 'Phi3Medium4kInstruct' },
            { label: 'microsoft/Phi-3-medium-128k-instruct (30GB)', value: 'Phi3Medium128kInstruct' },
            { label: 'google/gemma-2b-it (4.9GB)', value: 'Gemma2bInstruct', need_auth_header: true },
            { label: 'google/gemma-7b-it (12.1GB)', value: 'Gemma7bInstruct', need_auth_header: true },
            { label: 'meta-llama/Meta-Llama-3-8B-Instruct (??GB)', value: 'MetaLlama3_8bInstruct', need_auth_header: true },
            { label: 'upstage/SOLAR-10.7B-v1.0 (21.5GB)', value: 'Solar10_7bV1_0' },
            { label: 'Qwen/Qwen2-7B-Instruct (15.4GB)', value: 'Qwen2_72BInstruct', dimenssions: 384 },
            { label: 'Qwen/Qwen2-72B-Instruct (144GB)', value: 'Qwen2_72BInstruct', dimenssions: 384 },
            { label: 'TinyLlama/TinyLlama-1.1B-Chat-v1.0 (2.2GB)', value: 'TinyLlama1_1bChatV1_0' },
        ]
    },
    {
        id: 'OpenAI',
        name: 'OpenAI',
        apiUrl: 'https://api.openai.com/v1/chat/completions',
        apiUrlDisabled: true,
        showApiKeyInput: true,
        models: [
            { label: 'gpt-4', value: 'gpt-4' },
            { label: 'gpt-4-turbo-preview', value: 'gpt-4-turbo-preview' },
            { label: 'gpt-4-vision-preview', value: 'gpt-4-vision-preview' },
            { label: 'gpt-4-32k', value: 'gpt-4-32k' },
            { label: 'gpt-3.5-turbo', value: 'gpt-3.5-turbo' },
            { label: 'gpt-3.5-turbo-16k', value: 'gpt-3.5-turbo-16k' },
            { label: 'gpt-3.5-turbo', value: 'gpt-3.5-turbo' },
        ]
    },
    {
        id: 'Ollama',
        name: 'Ollama',
        apiUrl: 'http://localhost:11434/api/generate',
        apiUrlDisabled: false,
        showApiKeyInput: false,
        models: ollamaModels,
    },
]

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
    background-color: rgb(90, 213, 235);
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
                    This is defined on settings page.
                </el-form-item>
                <el-form-item label="History length" :label-width="formLabelWidth">
                    <el-input-number v-model="nodeData.contextLength" :min="0" :max="500" :step="5" />
                    How many chat history records will be added in prompt.
                </el-form-item>
                <el-form-item label="Exit prompt" :label-width="formLabelWidth">
                    <input type="radio" id="exitByIntent" name="group1" value="Option1" />
                    <label for="exitByIntent">Intention: </label>
                    <el-select v-model="nodeData.exitIntent">
                        <el-option v-for="item in intents" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                    <input type="radio" id="exitByFixedText" name="group1" value="Option1" />
                    <label for="exitByFixedText">Fixed text: </label><el-input v-model="nodeData.exitFixedText" />
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