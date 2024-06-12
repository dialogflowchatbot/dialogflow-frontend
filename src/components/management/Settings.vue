<script setup>
import { ref, reactive, onMounted } from 'vue';
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
    textGenerateProvider: {
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
});
const formLabelWidth = '130px'
const loading = ref(false)
const smtpPassed = ref(false)
const smtpFailed = ref(false)
const smtpFailedDetail = ref('')
const showHfIncorrectGenerateModelTip = ref(false)
const showHfGenerateModelDownloadProgress = ref(false)
const textGenerateModelRepository = ref('')
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
        changeTextGenerateProvider(settings.textGenerateProvider.provider.id);
        changeSentenceEmbeddingProvider(settings.sentenceEmbeddingProvider.provider.id);
    }
    await checkHfModelFiles();
})

async function checkHfModelFiles() {
    const repostories = new Map()
    if (settings.textGenerateProvider.provider.id == 'HuggingFace') {
        for (let i = 0; i < textGenerateModelOptions.length; i++) {
            console.log(textGenerateModelOptions[i].value)
            if (textGenerateModelOptions[i].value == settings.textGenerateProvider.provider.model) {
                let l = textGenerateModelOptions[i].label;
                const p = l.lastIndexOf(' ');
                if (p > -1)
                    l = l.substring(0, p);
                textGenerateModelRepository.value = l;
                repostories.set(showHfIncorrectGenerateModelTip, l)
                break;
            }
        }
    }
    if (settings.sentenceEmbeddingProvider.provider.id == 'HuggingFace') {
        for (let i = 0; i < sentenceEmbeddingModelOptions.length; i++) {
            console.log(sentenceEmbeddingModelOptions[i].value)
            if (sentenceEmbeddingModelOptions[i].value == settings.sentenceEmbeddingProvider.provider.model) {
                let l = sentenceEmbeddingModelOptions[i].label;
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
        const r = await httpReq("POST", 'management/settings/model/check', { robotId: robotId }, null, Array.from(repostories.values()));
        console.log(r);
        if (r && r.data) {
            for (let [k, v] of repostories.entries()) {
                if (r.data[v] == false) {
                    k.value = true;
                }
            }
        }
    }
    // showHfIncorrectGenerateModelTip.value = false;
    // showHfIncorrectEmbeddingModelTip.value = false;
    // if (settings.textGenerateProvider.provider.id != 'HuggingFace' && settings.sentenceEmbeddingProvider.provider.id != 'HuggingFace') {
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

async function downloadModels() {
    httpReq("GET", 'management/settings/model/download', { robotId: robotId }, null, null).then((r) => {
        console.log(r);
        if (r.status != 200) {
            ElMessage.error('Download failed: ' + r.err.message);
            clearTimeout(timeoutID);
        }
        showHfEmbeddingModelDownloadProgress.value = false;
        showHfIncorrectEmbeddingModelTip.value = true;
    });
    showHfIncorrectEmbeddingModelTip.value = false;
    showHfEmbeddingModelDownloadProgress.value = true;
    timeoutID = setTimeout(async () => {
        await showDownloadProgress();
    }, 1000);
}

async function showDownloadProgress() {
    const r = await httpReq("GET", 'management/settings/model/download/progress', null, null, null);
    console.log(r);
    if (r != null && r.data != null && r.data.downloading) {
        downloadingUrl.value = r.data.url;
        downloadingProgress.value = (r.data.downloadedLen / r.data.totalLen * 100).toFixed(2);;
        timeoutID = setTimeout(async () => {
            await showDownloadProgress();
        }, 1000);
    } else {
        showHfIncorrectEmbeddingModelTip.value = false;
        showHfEmbeddingModelDownloadProgress.value = false;
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
const textGenerateProviders = [
    {
        id: 'HuggingFace',
        name: 'HuggingFace',
        apiUrl: 'Model will be downloaded locally at ./data/models',
        apiUrlDisabled: true,
        showApiKeyInput: false,
        models: [
            { label: 'microsoft/phi-1 (91MB)', value: 'AllMiniLML6V2', dimenssions: 384 },
            { label: 'microsoft/phi-1.5 (135MB)', value: 'ParaphraseMLMiniLML12V2' },
            { label: 'microsoft/phi-2 (1.11GB)', value: 'ParaphraseMLMpnetBaseV2' },
            { label: 'microsoft/Phi-3-mini-4k-instruct (135MB)', value: 'BgeSmallEnV1_5' },
            { label: 'microsoft/Phi-3-medium-4k-instruct (439MB)', value: 'BgeBaseEnV1_5' },
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
const textGenerateModelOptions = reactive([])
const textGenerateDynamicReqUrlMap = new Map();
const choosedTextGenerateProvider = ref('')
const changeTextGenerateProvider = (n) => {
    if (choosedTextGenerateProvider.value)
        textGenerateDynamicReqUrlMap.set(choosedTextGenerateProvider.value, settings.textGenerateProvider.apiUrl);
    for (let i = 0; i < textGenerateProviders.length; i++) {
        if (textGenerateProviders[i].id == n) {
            if (textGenerateProviders[i].apiUrlDisabled)
                settings.textGenerateProvider.apiUrl = textGenerateProviders[i].apiUrl;
            else {
                settings.textGenerateProvider.apiUrl = sentenceEmbeddingDynamicReqUrlMap.get(settings.textGenerateProvider.provider.id);
                if (!settings.textGenerateProvider.apiUrl)
                    settings.textGenerateProvider.apiUrl = textGenerateProviders[i].apiUrl;
            }
            settings.textGenerateProvider.apiUrlDisabled = textGenerateProviders[i].apiUrlDisabled;
            settings.textGenerateProvider.showApiKeyInput = textGenerateProviders[i].showApiKeyInput;
            choosedTextGenerateProvider.value = n;
            textGenerateModelOptions.splice(0, textGenerateModelOptions.length, ...textGenerateProviders[i].models)
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
    <h3>Text generation</h3>
    <el-row>
        <el-col :span="11" :offset="1">
            <el-form :model="settings.textGenerateProvider" :label-width="formLabelWidth" style="max-width: 600px">
                <el-form-item label="Provider">
                    <el-radio-group v-model="settings.textGenerateProvider.provider.id" size="large"
                        @change="changeTextGenerateProvider">
                        <el-radio-button v-for="item in textGenerateProviders" :id="item.id" :key="item.id"
                            :label="item.id" :value="item.id" />
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="Request address">
                    <el-input v-model="settings.textGenerateProvider.apiUrl"
                        :disabled="settings.textGenerateProvider.apiUrlDisabled" />
                </el-form-item>
                <el-form-item label="OpenAI API key" v-show="settings.textGenerateProvider.showApiKeyInput">
                    <el-input v-model="settings.textGenerateProvider.apiKey" />
                </el-form-item>
                <el-form-item label="Model">
                    <el-select v-model="settings.textGenerateProvider.provider.model" placeholder="Choose a model">
                        <el-option v-for="item in textGenerateModelOptions" :id="item.value" :key="item.value"
                            :label="item.label" :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="Connect timeout"
                    v-show="settings.textGenerateProvider.provider.id != 'HuggingFace'">
                    <el-input-number v-model="settings.textGenerateProvider.connectTimeoutMillis" :min="100"
                        :max="50000" />
                    millis
                </el-form-item>
                <el-form-item label="Read timeout" v-show="settings.textGenerateProvider.provider.id != 'HuggingFace'">
                    <el-input-number v-model="settings.textGenerateProvider.readTimeoutMillis" :min="1000"
                        :max="65530" />
                    millis
                </el-form-item>
                <el-form-item label="" v-show="showHfIncorrectGenerateModelTip">
                    HuggingFace model files were incorrect or missing, please <el-button type="primary" text
                        @click="downloadModels">
                        click here to download model files
                    </el-button>, or you can download manually and put them in ./data/model/{{
                        textGenerateModelRepository
                    }}
                </el-form-item>
                <el-form-item label="" v-show="showHfGenerateModelDownloadProgress">
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
    <h3>Sentence embedding provider</h3>
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
                        :max="50000" />
                    millis
                </el-form-item>
                <el-form-item label="Read timeout"
                    v-show="settings.sentenceEmbeddingProvider.provider.id != 'HuggingFace'">
                    <el-input-number v-model="settings.sentenceEmbeddingProvider.readTimeoutMillis" :min="1000"
                        :max="65530" />
                    millis
                </el-form-item>
                <el-form-item label="" v-show="showHfIncorrectEmbeddingModelTip">
                    HuggingFace model files were incorrect or missing, please <el-button type="primary" text
                        @click="downloadModels">
                        click here to download model files
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