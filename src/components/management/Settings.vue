<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { copyProperties, httpReq, getRobotType } from '../../assets/tools.js'
// import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n'
const { t, tm } = useI18n();
const route = useRoute()
const router = useRouter();
const robotId = route.params.robotId
// const robotType = getRobotType(robotId)
const maxSessionIdleMin = ref(30)

const goBack = () => {
    router.push({ name: 'robotDetail', params: { robotId: robotId } });
}

const defaultEmailVerificationRegex = '[-\\w\\.\\+]{1,100}@[A-Za-z0-9]{1,30}[A-Za-z\\.]{2,30}';
const settings = reactive({
    maxSessionIdleSec: 1800,
    smtpHost: '',
    smtpUsername: '',
    smtpPassword: '',
    smtpTimeoutSec: 60,
    emailVerificationRegex: '',
    sentenceEmbeddingProvider: {
        provider: {
            id: '',
            model: '',
        },
        apiUrl: '',
        apiUrlDisabled: false,
        showApiKeyInput: true,
        apiKey: '',
        connectTimeoutMillis: 1500,
        readTimeoutMillis: 3000,
    },
    textGenerationProvider: {
        provider: {
            id: '',
            model: '',
        },
        apiUrl: '',
        apiUrlDisabled: false,
        showApiKeyInput: true,
        apiKey: '',
        max_token_len: 5000,
        connectTimeoutMillis: 1500,
        readTimeoutMillis: 3000,
    },
});
const formLabelWidth = '130px'
const loading = ref(false)
const smtpPassed = ref(false)
const smtpFailed = ref(false)
const smtpFailedDetail = ref('')
const showHfIncorrectGenerationModelTip = ref(false)
const showHfGenerationModelDownloadProgress = ref(false)
const textGenerationModelRepository = ref('')
const showHfIncorrectEmbeddingModelTip = ref(false)
const showHfEmbeddingModelDownloadProgress = ref(false)
const sentenceEmbeddingModelRepository = ref('')
const downloadingUrl = ref('')
const downloadingProgress = ref('')

onMounted(async () => {
    const t = await httpReq("GET", 'management/settings', { robotId: robotId }, null, null)
    console.log(t);
    if (t.status == 200) {
        copyProperties(t.data, settings);
        maxSessionIdleMin.value = settings.maxSessionIdleSec / 60;
        // const d = t.data;
        // settings.port = d.port;
        // settings.maxSessionDurationMin = d.maxSessionDurationMin;
        changeTextGenerationProvider(settings.textGenerationProvider.provider.id);
        changeSentenceEmbeddingProvider(settings.sentenceEmbeddingProvider.provider.id);
    }
    await checkHfModelFiles();
})
onUnmounted(
    () => {
        if (timeoutID != null)
            clearTimeout(timeoutID);
    }
);

async function checkHfModelFiles() {
    const repostories = new Map()
    if (settings.textGenerationProvider.provider.id == 'HuggingFace') {
        for (let i = 0; i < textGenerationModelOptions.length; i++) {
            console.log(textGenerationModelOptions[i].value)
            if (textGenerationModelOptions[i].value == settings.textGenerationProvider.provider.model) {
                let l = textGenerationModelOptions[i].value;
                const p = l.lastIndexOf(' ');
                if (p > -1)
                    l = l.substring(0, p);
                textGenerationModelRepository.value = l;
                repostories.set(showHfIncorrectGenerationModelTip, l)
                break;
            }
        }
    }
    if (settings.sentenceEmbeddingProvider.provider.id == 'HuggingFace') {
        for (let i = 0; i < sentenceEmbeddingModelOptions.length; i++) {
            console.log(sentenceEmbeddingModelOptions[i].value)
            if (sentenceEmbeddingModelOptions[i].value == settings.sentenceEmbeddingProvider.provider.model) {
                let l = sentenceEmbeddingModelOptions[i].value;
                const p = l.lastIndexOf(' ');
                if (p > -1)
                    l = l.substring(0, p);
                sentenceEmbeddingModelRepository.value = l;
                repostories.set(showHfIncorrectEmbeddingModelTip, l)
                break;
            }
        }
    }
    if (repostories.size > 0) {
        const r = await httpReq("POST", 'management/settings/model/check', null, null, Array.from(repostories.values()));
        console.log(r);
        if (r && r.data) {
            for (let [k, v] of repostories.entries()) {
                if (r.data[v] == false) {
                    k.value = true;
                } else
                    k.value = false;
            }
        }
    }
    // showHfIncorrectGenerationModelTip.value = false;
    // showHfIncorrectEmbeddingModelTip.value = false;
    // if (settings.textGenerationProvider.provider.id != 'HuggingFace' && settings.sentenceEmbeddingProvider.provider.id != 'HuggingFace') {
    //     return;
    // }
    // const r = await httpReq("POST", 'management/settings/model/check', { robotId: robotId }, null, repostories.keys());
    // console.log(r);
    // if (r && r.status != 200) {
    //     for (let i = 0; i < sentenceEmbeddingModelOptions.length; i++) {
    //         console.log(sentenceEmbeddingModelOptions[i].value)
    //         if (sentenceEmbeddingModelOptions[i].value == settings.sentenceEmbeddingProvider.provider.model) {
    //             let l = sentenceEmbeddingModelOptions[i].label;
    //             const p = l.lastIndexOf(' ');
    //             if (p > -1)
    //                 l = l.substring(0, p);
    //             sentenceEmbeddingModelRepository.value = l;
    //             break;
    //         }
    //     }
    //     showHfIncorrectEmbeddingModelTip.value = true;
    //     // ElMessage.error(r.err.message);
    // } else
    //     showHfIncorrectEmbeddingModelTip.value = false;
}

async function save() {
    if (!settings.emailVerificationRegex)
        settings.emailVerificationRegex = defaultEmailVerificationRegex;
    settings.maxSessionIdleSec = (maxSessionIdleMin.value * 60)
    let r = await httpReq("POST", 'management/settings', { robotId: robotId }, null, settings)
    console.log(r);
    if (r.status == 200) {
        ElMessage({ type: 'success', message: t('lang.common.saved'), });
        await checkHfModelFiles();
    } else {
        const m = t(r.err.message);
        ElMessage.error(m ? m : r.err.message);
    }
}

let timeoutID = null;

async function downloadModels(m) {
    const r = await httpReq("GET", 'management/settings/model/download/progress', null, null, null);
    console.log(r);
    if (r != null && r.data != null && r.data.downloading) {
        const m = 'Downloading: ' + r.url + ' (' + (r.data.downloadedLen / r.data.totalLen * 100).toFixed(2) + '), please wait until it finish.';
        ElMessage.error(m);
        return;
    }
    httpReq("POST", 'management/settings/model/download', { robotId: robotId, m: m }, null, m).then((r) => {
        console.log(r);
        if (r == null || r.status != 200) {
            ElMessage.error('Download failed: ' + r.err.message);
            return;
        }
        // showHfEmbeddingModelDownloadProgress.value = false;
        // showHfIncorrectEmbeddingModelTip.value = true;
        if (m == 'sentenceEmbedding') {
            showHfIncorrectEmbeddingModelTip.value = false;
            showHfEmbeddingModelDownloadProgress.value = true;
        } else {
            showHfIncorrectGenerationModelTip.value = false;
            showHfGenerationModelDownloadProgress.value = true;
        }
        timeoutID = setTimeout(async () => {
            await showDownloadProgress();
        }, 1000);
    });
}

function downloadComplete() {
    clearTimeout(timeoutID);
    showHfIncorrectGenerationModelTip.value = false;
    showHfGenerationModelDownloadProgress.value = false;
    showHfIncorrectEmbeddingModelTip.value = false;
    showHfEmbeddingModelDownloadProgress.value = false;
}

async function showDownloadProgress() {
    const r = await httpReq("GET", 'management/settings/model/download/progress', null, null, null);
    console.log(r);
    if (r != null && r.data != null) {
        if (r.data.err) {
            ElMessage.error(r.data.err);
            clearTimeout(timeoutID);
            showHfGenerationModelDownloadProgress.value = false;
            showHfEmbeddingModelDownloadProgress.value = false;
            return
        } else if (r.data.downloading) {
            downloadingUrl.value = r.data.url;
            downloadingProgress.value = (r.data.downloadedLen / r.data.totalLen * 100).toFixed(2);
            timeoutID = setTimeout(async () => {
                await showDownloadProgress();
            }, 1000);
        } else
            downloadComplete()
    } else {
        downloadComplete();
    }
}

const smtpTest = async () => {
    loading.value = true
    const r = await httpReq("POST", 'management/settings/smtp/test', null, null, settings)
    console.log(r);
    if (r.status == 200) {
        smtpPassed.value = true
        smtpFailed.value = false
    } else {
        smtpFailedDetail.value = t(r.err.message);
        smtpPassed.value = false
        smtpFailed.value = true
    }
    loading.value = false
}

// https://docs.spring.io/spring-ai/reference/api/embeddings.html
const textGenerationProviders = [
    {
        id: 'HuggingFace',
        name: 'HuggingFace',
        apiUrl: 'Model will be downloaded locally at ./data/models',
        apiUrlDisabled: true,
        showApiKeyInput: false,
        models: [
            { label: 'microsoft/Phi-3-mini-4k-instruct (135MB)', value: 'Phi3Mini4kInstruct' },
            { label: 'microsoft/Phi-3-mini-128k-instruct (135MB)', value: 'Phi3Mini128kInstruct' },
            { label: 'microsoft/Phi-3-small-8k-instruct (439MB)', value: 'Phi3Small8kInstruct' },
            { label: 'microsoft/Phi-3-small-128k-instruct (439MB)', value: 'Phi3Small128kInstruct' },
            { label: 'microsoft/Phi-3-medium-4k-instruct (439MB)', value: 'Phi3Medium4kInstruct' },
            { label: 'microsoft/Phi-3-medium-128k-instruct (439MB)', value: 'Phi3Medium128kInstruct' },
            { label: 'google/gemma-2b-it (1.11GB)', value: 'Gemma2bInstruct', need_auth_header:true },
            { label: 'google/gemma-7b-it (1.11GB)', value: 'Gemma7bInstruct', need_auth_header:true },
            { label: 'meta-llama/Meta-Llama-3-8B-Instruct (1.11GB)', value: 'MetaLlama3_8bInstruct', need_auth_header:true },
            { label: 'upstage/SOLAR-10.7B-v1.0 (1.11GB)', value: 'Solar10_7bV1_0' },
            { label: 'TinyLlama/TinyLlama-1.1B-Chat-v1.0 (1.11GB)', value: 'TinyLlama1_1bChatV1_0' },
            { label: 'Qwen/Qwen2-72B-Instruct (91MB)', value: 'Qwen2_72BInstruct', dimenssions: 384 },
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
        models: [
            { label: 'Meta Llama 3', value: 'llama3' },
            { label: 'Phi-3', value: 'phi3' },
            { label: 'WizardLM-2', value: 'wizardlm2' },
            { label: 'Mistral', value: 'mistral' },
            { label: 'Gemma', value: 'gemma' },
            { label: 'Mixtral', value: 'mixtral' },
            { label: 'Llama 2', value: 'llama2' },
            { label: 'Qwen', value: 'qwen' },
            { label: 'TinyLlama', value: 'tinyllama' },
            { label: 'Yi 1.5', value: 'yi' },
            { label: 'All Mini LM', value: 'all-minilm' },
            { label: 'Llama 2 Chinese', value: 'llama2-chinese' }
        ],
    },
]

// https://docs.spring.io/spring-ai/reference/api/embeddings.html
const sentenceEmbeddingProviders = [
    {
        id: 'HuggingFace',
        name: 'HuggingFace',
        apiUrl: 'Model will be downloaded locally at ./data/models',
        apiUrlDisabled: true,
        showApiKeyInput: false,
        models: [
            { label: 'sentence-transformers/all-MiniLM-L6-v2 (91MB)', value: 'AllMiniLML6V2', dimenssions: 384 },
            { label: 'sentence-transformers/paraphrase-MiniLM-L12-v2 (135MB)', value: 'ParaphraseMLMiniLML12V2' },
            { label: 'sentence-transformers/paraphrase-multilingual-mpnet-base-v2 (1.11GB)', value: 'ParaphraseMLMpnetBaseV2' },
            { label: 'BAAI/bge-small-en-v1.5 (135MB)', value: 'BgeSmallEnV1_5' },
            { label: 'BAAI/bge-base-en-v1.5 (439MB)', value: 'BgeBaseEnV1_5' },
            { label: 'BAAI/bge-large-en-v1.5 (1.35GB)', value: 'BgeLargeEnV1_5' },
            { label: 'BAAI/bge-m3 (2.27GB)', value: 'BgeM3' },
            { label: 'nomic-ai/nomic-embed-text-v1.5 (550MB)', value: 'NomicEmbedTextV1_5' },
            { label: 'intfloat/multilingual-e5-small (472MB)', value: 'MultilingualE5Small' },
            { label: 'intfloat/multilingual-e5-base (1.11GB)', value: 'MultilingualE5Base' },
            { label: 'intfloat/multilingual-e5-large (2.24GB)', value: 'MultilingualE5Large' },
            { label: 'mixedbread-ai/mxbai-embed-large-v1 (1.34GB)', value: 'MxbaiEmbedLargeV1' },
        ]
    },
    {
        id: 'OpenAI',
        name: 'OpenAI',
        apiUrl: 'https://api.openai.com/v1/embeddings',
        apiUrlDisabled: true,
        showApiKeyInput: true,
        models: [
            { label: 'text-embedding-3-small', value: 'text-embedding-3-small' },
            { label: 'text-embedding-3-large', value: 'text-embedding-3-large' },
            { label: 'text-embedding-ada-002', value: 'text-embedding-ada-002' }]
    },
    {
        id: 'Ollama',
        name: 'Ollama',
        apiUrl: 'http://localhost:11434/api/embeddings',
        apiUrlDisabled: false,
        showApiKeyInput: false,
        models: [
            { label: 'Meta Llama 3', value: 'llama3' },
            { label: 'Phi-3', value: 'phi3' },
            { label: 'WizardLM-2', value: 'wizardlm2' },
            { label: 'Mistral', value: 'mistral' },
            { label: 'Gemma', value: 'gemma' },
            { label: 'Mixtral', value: 'mixtral' },
            { label: 'Llama 2', value: 'llama2' },
            { label: 'Qwen', value: 'qwen' },
            { label: 'TinyLlama', value: 'tinyllama' },
            { label: 'Yi 1.5', value: 'yi' },
            { label: 'All Mini LM', value: 'all-minilm' },
            { label: 'Llama 2 Chinese', value: 'llama2-chinese' }
        ],
    },
]
const textGenerationModelOptions = reactive([])
const textGenerationDynamicReqUrlMap = new Map();
const choosedTextGenerationProvider = ref('')
const changeTextGenerationProvider = (n) => {
    if (choosedTextGenerationProvider.value)
        textGenerationDynamicReqUrlMap.set(choosedTextGenerationProvider.value, settings.textGenerationProvider.apiUrl);
    for (let i = 0; i < textGenerationProviders.length; i++) {
        if (textGenerationProviders[i].id == n) {
            if (textGenerationProviders[i].apiUrlDisabled)
                settings.textGenerationProvider.apiUrl = textGenerationProviders[i].apiUrl;
            else {
                settings.textGenerationProvider.apiUrl = sentenceEmbeddingDynamicReqUrlMap.get(settings.TextGenerationProvider.provider.id);
                if (!settings.textGenerationProvider.apiUrl)
                    settings.textGenerationProvider.apiUrl = textGenerationProviders[i].apiUrl;
            }
            settings.textGenerationProvider.apiUrlDisabled = textGenerationProviders[i].apiUrlDisabled;
            settings.textGenerationProvider.showApiKeyInput = textGenerationProviders[i].showApiKeyInput;
            choosedTextGenerationProvider.value = n;
            textGenerationModelOptions.splice(0, textGenerationModelOptions.length, ...textGenerationProviders[i].models)
            // console.log(modelOptions.length)
            break;
        }
    }
}
const sentenceEmbeddingModelOptions = reactive([])
const sentenceEmbeddingDynamicReqUrlMap = new Map();
const choosedSentenceEmbeddingProvider = ref('')
const changeSentenceEmbeddingProvider = (n) => {
    if (choosedSentenceEmbeddingProvider.value)
        sentenceEmbeddingDynamicReqUrlMap.set(choosedSentenceEmbeddingProvider.value, settings.sentenceEmbeddingProvider.apiUrl);
    for (let i = 0; i < sentenceEmbeddingProviders.length; i++) {
        if (sentenceEmbeddingProviders[i].id == n) {
            if (sentenceEmbeddingProviders[i].apiUrlDisabled)
                settings.sentenceEmbeddingProvider.apiUrl = sentenceEmbeddingProviders[i].apiUrl;
            else {
                settings.sentenceEmbeddingProvider.apiUrl = sentenceEmbeddingDynamicReqUrlMap.get(settings.sentenceEmbeddingProvider.provider.id);
                if (!settings.sentenceEmbeddingProvider.apiUrl)
                    settings.sentenceEmbeddingProvider.apiUrl = sentenceEmbeddingProviders[i].apiUrl;
            }
            settings.sentenceEmbeddingProvider.apiUrlDisabled = sentenceEmbeddingProviders[i].apiUrlDisabled;
            settings.sentenceEmbeddingProvider.showApiKeyInput = sentenceEmbeddingProviders[i].showApiKeyInput;
            choosedSentenceEmbeddingProvider.value = n;
            sentenceEmbeddingModelOptions.splice(0, sentenceEmbeddingModelOptions.length, ...sentenceEmbeddingProviders[i].models)
            // console.log(modelOptions.length)
            break;
        }
    }
}
</script>
<template>
    <el-page-header :title="$t('lang.common.back')" @back="goBack">
        <template #content>
            <span class="text-large font-600 mr-3">{{ $t('lang.settings.title') }}</span>
        </template>
    </el-page-header>
    <h3>Common settings</h3>
    <el-row>
        <el-col :span="12" :offset="1">
            <el-form :model="settings">
                <el-form-item :label="$t('lang.settings.prompt3')" :label-width="formLabelWidth">
                    <el-input-number v-model="maxSessionIdleMin" :min="2" :max="1440" @change="handleChange" />
                    {{ $t('lang.settings.prompt4') }}
                </el-form-item>
                <el-form-item label="" :label-width="formLabelWidth">
                    <el-button type="primary" @click="save">
                        {{ $t('lang.common.save') }}
                    </el-button>
                    <el-button @click="goBack()">{{ $t('lang.common.cancel') }}</el-button>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
    <h3>
        Text generation
        <el-tooltip effect="light" placement="right">
            <template #content>
                You don’t need to download the large model file unless you want to use the functionalities
                described below.
                <br />
                Currently, its function is merely to provide automatic response capabilities and suggested
                reply templates for dialogue nodes.
            </template>
            <el-button circle>i</el-button>
        </el-tooltip>
    </h3>
    <el-row>
        <el-col :span="11" :offset="1">
            <el-form :model="settings.textGenerationProvider" :label-width="formLabelWidth" style="max-width: 600px">
                <el-form-item label="Provider">
                    <el-radio-group v-model="settings.textGenerationProvider.provider.id" size="large"
                        @change="changeTextGenerationProvider">
                        <el-radio-button v-for="item in textGenerationProviders" :id="item.id" :key="item.id"
                            :label="item.id" :value="item.id" />
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="Request address">
                    <el-input v-model="settings.textGenerationProvider.apiUrl"
                        :disabled="settings.textGenerationProvider.apiUrlDisabled" />
                </el-form-item>
                <el-form-item label="OpenAI API key" v-show="settings.textGenerationProvider.showApiKeyInput">
                    <el-input v-model="settings.textGenerationProvider.apiKey" />
                </el-form-item>
                <el-form-item label="Model">
                    <el-select v-model="settings.textGenerationProvider.provider.model" placeholder="Choose a model">
                        <el-option v-for="item in textGenerationModelOptions" :id="item.value" :key="item.value"
                            :label="item.label" :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="Connect timeout"
                    v-show="settings.textGenerationProvider.provider.id != 'HuggingFace'">
                    <el-input-number v-model="settings.textGenerationProvider.connectTimeoutMillis" :min="100"
                        :max="50000" :step="100" />
                    millis
                </el-form-item>
                <el-form-item label="Read timeout"
                    v-show="settings.textGenerationProvider.provider.id != 'HuggingFace'">
                    <el-input-number v-model="settings.textGenerationProvider.readTimeoutMillis" :min="1000"
                        :max="65530" :step="100" />
                    millis
                </el-form-item>
                <el-form-item label="" v-show="showHfIncorrectGenerationModelTip">
                    HuggingFace model files were incorrect or missing, please <el-button type="primary" text
                        @click="downloadModels(settings.textGenerationProvider.provider.model)">
                        click here to download model files from Huggingface.co
                    </el-button>, or you can download manually and put them in ./data/model/{{
                        textGenerationModelRepository
                    }}
                </el-form-item>
                <el-form-item label="" v-show="showHfGenerationModelDownloadProgress">
                    Downloading: {{ downloadingUrl }}, {{ downloadingProgress }}%
                </el-form-item>
                <el-form-item label="" :label-width="formLabelWidth">
                    <el-button type="primary" @click="save">
                        {{ $t('lang.common.save') }}
                    </el-button>
                    <el-button @click="goBack()">{{ $t('lang.common.cancel') }}</el-button>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
    <h3>
        Sentence embedding provider
        <el-tooltip effect="light" placement="right">
            <template #content>
                Downloading model files is not necessary.<br />
                Its function is merely to enhance the accuracy of intent recognition for user inputs, and it will
                not
                affect the response functionality of the process.<br />
                User intent can also be recognized through the configuration of keywords and regular expressions
                without
                downloading the model.
            </template>
            <el-button circle>i</el-button>
        </el-tooltip>
    </h3>
    <el-row>
        <el-col :span="11" :offset="1">
            <el-form :model="settings.sentenceEmbeddingProvider" :label-width="formLabelWidth" style="max-width: 600px">
                <el-form-item label="Provider">
                    <el-radio-group v-model="settings.sentenceEmbeddingProvider.provider.id" size="large"
                        @change="changeSentenceEmbeddingProvider">
                        <el-radio-button v-for="item in sentenceEmbeddingProviders" :id="item.id" :key="item.id"
                            :label="item.id" :value="item.id" />
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="Request address">
                    <el-input v-model="settings.sentenceEmbeddingProvider.apiUrl"
                        :disabled="settings.sentenceEmbeddingProvider.apiUrlDisabled" />
                </el-form-item>
                <el-form-item label="OpenAI API key" v-show="settings.sentenceEmbeddingProvider.showApiKeyInput">
                    <el-input v-model="settings.sentenceEmbeddingProvider.apiKey" />
                </el-form-item>
                <el-form-item label="Model">
                    <el-select v-model="settings.sentenceEmbeddingProvider.provider.model" placeholder="Choose a model">
                        <el-option v-for="item in sentenceEmbeddingModelOptions" :id="item.value" :key="item.value"
                            :label="item.label" :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="Connect timeout"
                    v-show="settings.sentenceEmbeddingProvider.provider.id != 'HuggingFace'">
                    <el-input-number v-model="settings.sentenceEmbeddingProvider.connectTimeoutMillis" :min="100"
                        :max="50000" :step="100" />
                    millis
                </el-form-item>
                <el-form-item label="Read timeout"
                    v-show="settings.sentenceEmbeddingProvider.provider.id != 'HuggingFace'">
                    <el-input-number v-model="settings.sentenceEmbeddingProvider.readTimeoutMillis" :min="1000"
                        :max="65530" :step="100" />
                    millis
                </el-form-item>
                <el-form-item label="" v-show="showHfIncorrectEmbeddingModelTip">
                    HuggingFace model files were incorrect or missing, please <el-button type="primary" text
                        @click="downloadModels(settings.sentenceEmbeddingProvider.provider.model)">
                        click here to download model files from Huggingface.co
                    </el-button>, or you can download manually and put them in ./data/model/{{
                        sentenceEmbeddingModelRepository }}
                </el-form-item>
                <el-form-item label="" v-show="showHfEmbeddingModelDownloadProgress">
                    Downloading: {{ downloadingUrl }}, {{ downloadingProgress }}%
                </el-form-item>
                <el-form-item label="" :label-width="formLabelWidth">
                    <el-button type="primary" @click="save">
                        {{ $t('lang.common.save') }}
                    </el-button>
                    <el-button @click="goBack()">{{ $t('lang.common.cancel') }}</el-button>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
    <h3>Email settings</h3>
    <el-row>
        <el-col :span="11" :offset="1">
            <el-form :model="settings">
                <el-form-item label="Email SMTP" :label-width="formLabelWidth">
                </el-form-item>
                <el-form-item label="Host" :label-width="formLabelWidth">
                    <el-input v-model="settings.smtpHost" placeholder="" />
                </el-form-item>
                <el-form-item label="Username" :label-width="formLabelWidth">
                    <el-input v-model="settings.smtpUsername" placeholder="" />
                </el-form-item>
                <el-form-item label="Password" :label-width="formLabelWidth">
                    <el-input v-model="settings.smtpPassword" placeholder="" type="password" />
                </el-form-item>
                <el-form-item label="Timeout" :label-width="formLabelWidth">
                    <el-input-number v-model="settings.smtpTimeoutSec" :min="1" :max="600" @change="handleChange" />
                    Seconds
                </el-form-item>
                <el-form-item label="Email verification regex" label-width="200px">
                    <el-input v-model="settings.emailVerificationRegex" :placeholder="defaultEmailVerificationRegex" />
                </el-form-item>
                <el-form-item label="" label-width="200px">
                    You can customize the email verification regular expression, or leave it blank and the system will
                    automatically use the general verification rules.
                </el-form-item>
                <el-form-item label="" :label-width="formLabelWidth">
                    <el-button :loading="loading" type="info" @click="smtpTest">
                        Test SMTP settings
                    </el-button>
                    <el-alert v-if="smtpPassed" title="SMTP test passed" type="success" />
                    <el-alert v-if="smtpFailed" :title="smtpFailedDetail" type="error" />
                </el-form-item>
                <el-form-item label="" :label-width="formLabelWidth">
                    <el-button type="primary" @click="save">
                        {{ $t('lang.common.save') }}
                    </el-button>
                    <el-button @click="goBack()">{{ $t('lang.common.cancel') }}</el-button>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
</template>