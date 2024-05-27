<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { copyProperties, httpReq } from '../../assets/tools.js'
// import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n'
const { t, tm } = useI18n();
const router = useRouter();

const goBack = () => {
    router.push('/guide')
}

const defaultEmailVerificationRegex = '[-\\w\\.\\+]{1,100}@[A-Za-z0-9]{1,30}[A-Za-z\\.]{2,30}';
const settings = reactive({
    ip: '127.0.0.1',
    port: '12715',
    selectRandomPortWhenConflict: false,
    maxSessionDurationMin: '30',
    smtpHost: '',
    smtpUsername: '',
    smtpPassword: '',
    smtpTimeoutSec: 60,
    emailVerificationRegex: '',
    embeddingProvider: {
        provider: {
            id: '',
            model: '',
        },
        apiUrl: '',
        apiUrlDisabled: false,
        showApiKeyInput: true,
        apiKey: '',
    },
});
const formLabelWidth = '130px'
const loading = ref(false)
const smtpPassed = ref(false)
const smtpFailed = ref(false)
const smtpFailedDetail = ref('')
const showHfIncorrectModelTip = ref(false)
const showHfModelDownloadProgress = ref(false)
const modelRepository = ref('')
const downloadingUrl = ref('')
const downloadingProgress = ref('')

onMounted(async () => {
    const t = await httpReq("GET", 'management/settings', null, null, null)
    console.log(t);
    if (t.status == 200) {
        copyProperties(t.data, settings);
        // const d = t.data;
        // settings.port = d.port;
        // settings.maxSessionDurationMin = d.maxSessionDurationMin;
        changeEmbeddingProvider(settings.embeddingProvider.provider.id);
    }
    await checkHfModelFiles();
})

async function checkHfModelFiles() {
    if (settings.embeddingProvider.provider.id != 'HuggingFace') {
        showHfIncorrectModelTip.value = false;
        return;
    }
    const r = await httpReq("GET", 'management/settings/model/check', null, null, null);
    console.log(r);
    if (r && r.status != 200) {
        for (let i = 0; i < modelOptions.length; i++) {
            console.log(modelOptions[i].value)
            if (modelOptions[i].value == settings.embeddingProvider.provider.model) {
                let l = modelOptions[i].label;
                const p = l.lastIndexOf(' ');
                if (p > -1)
                    l = l.substring(0, p);
                modelRepository.value = l;
                break;
            }
        }
        showHfIncorrectModelTip.value = true;
        // ElMessage.error(r.err.message);
    } else
        showHfIncorrectModelTip.value = false;
}

async function save() {
    if (!settings.emailVerificationRegex)
        settings.emailVerificationRegex = defaultEmailVerificationRegex;
    let r = await httpReq("POST", 'management/settings', null, null, settings)
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
    httpReq("GET", 'management/settings/model/download', null, null, null).then((r) => {
        console.log(r);
        if (r.status != 200) {
            ElMessage.error('Download failed: ' + r.err.message);
            clearTimeout(timeoutID);
        }
        showHfModelDownloadProgress.value = false;
        showHfIncorrectModelTip.value = true;
    });
    showHfIncorrectModelTip.value = false;
    showHfModelDownloadProgress.value = true;
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
        showHfIncorrectModelTip.value = false;
        showHfModelDownloadProgress.value = false;
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
const embeddingProviders = [
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
const modelOptions = reactive([])
const dynamicReqUrlMap = new Map();
const choosedEmbeddingProvider = ref('')
const changeEmbeddingProvider = (n) => {
    if (choosedEmbeddingProvider.value)
        dynamicReqUrlMap.set(choosedEmbeddingProvider.value, settings.embeddingProvider.apiUrl);
    for (let i = 0; i < embeddingProviders.length; i++) {
        if (embeddingProviders[i].id == n) {
            if (embeddingProviders[i].apiUrlDisabled)
                settings.embeddingProvider.apiUrl = embeddingProviders[i].apiUrl;
            else {
                settings.embeddingProvider.apiUrl = dynamicReqUrlMap.get(settings.embeddingProvider.provider.id);
                if (!settings.embeddingProvider.apiUrl)
                    settings.embeddingProvider.apiUrl = embeddingProviders[i].apiUrl;
            }
            settings.embeddingProvider.apiUrlDisabled = embeddingProviders[i].apiUrlDisabled;
            settings.embeddingProvider.showApiKeyInput = embeddingProviders[i].showApiKeyInput;
            choosedEmbeddingProvider.value = n;
            modelOptions.splice(0, modelOptions.length, ...embeddingProviders[i].models)
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
                <el-form-item label="IP addr (v4 or v6)" :label-width="formLabelWidth">
                    <el-input v-model="settings.ip" placeholder="" />
                </el-form-item>
                <el-form-item label="" :label-width="formLabelWidth">
                    {{ $t('lang.settings.ipNote') }}
                </el-form-item>
                <el-form-item :label="$t('lang.settings.prompt2')" :label-width="formLabelWidth">
                    <el-input-number v-model="settings.port" :min="1024" :max="65530" @change="handleChange" />
                </el-form-item>
                <el-form-item label="" :label-width="formLabelWidth">
                    <input type="checkbox" id="_randomPortWhenConflict_" v-model="settings.selectRandomPortWhenConflict"
                        :checked="settings.selectRandomPortWhenConflict" />
                    <label for="_randomPortWhenConflict_">{{ $t('lang.settings.prompt2_2') }}</label>
                </el-form-item>
                <el-form-item :label="$t('lang.settings.prompt3')" :label-width="formLabelWidth">
                    <el-input-number v-model="settings.maxSessionDurationMin" :min="1" :max="1440"
                        @change="handleChange" />
                    {{ $t('lang.settings.prompt4') }}
                </el-form-item>
                <el-form-item :label-width="formLabelWidth">
                    {{ $t('lang.settings.note') }}
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
    <h3>Embedding provider</h3>
    <el-row>
        <el-col :span="11" :offset="1">
            <el-form :model="settings.embeddingProvider" :label-width="formLabelWidth" style="max-width: 600px">
                <el-form-item label="Provider">
                    <el-radio-group v-model="settings.embeddingProvider.provider.id" size="large"
                        @change="changeEmbeddingProvider">
                        <el-radio-button v-for="item in embeddingProviders" :id="item.id" :key="item.id"
                            :label="item.id" :value="item.id" />
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="Request address">
                    <el-input v-model="settings.embeddingProvider.apiUrl"
                        :disabled="settings.embeddingProvider.apiUrlDisabled" />
                </el-form-item>
                <el-form-item label="OpenAI API key" v-show="settings.embeddingProvider.showApiKeyInput">
                    <el-input v-model="settings.embeddingProvider.apiKey" />
                </el-form-item>
                <el-form-item label="Model">
                    <el-select v-model="settings.embeddingProvider.provider.model" placeholder="Choose a model">
                        <el-option v-for="item in modelOptions" :id="item.value" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="" v-show="showHfIncorrectModelTip">
                    HuggingFace model files were incorrect or missing, please <el-button type="primary" text
                        @click="downloadModels">
                        click here to download model files
                    </el-button>, or you can download manually and put them in ./data/model/{{ modelRepository }}
                </el-form-item>
                <el-form-item label="" v-show="showHfModelDownloadProgress">
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