<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { copyProperties, httpReq } from '../../assets/tools.js'
// import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n'
const { t, tm } = useI18n();
const router = useRouter();
const defaultEmailVerificationRegex = '[-\\w\\.\\+]{1,100}@[A-Za-z0-9]{1,30}[A-Za-z\\.]{2,30}';
const nodeData = reactive({
    ip: '127.0.0.1',
    port: '12715',
    selectRandomPortWhenConflict: false,
    maxSessionDurationMin: '30',
    smtpHost: '',
    smtpUsername: '',
    smtpPassword: '',
    smtpTimeoutSec: 60,
    emailVerificationRegex: '',
});
const formLabelWidth = '130px'
const loading = ref(false)
const smtpPassed = ref(false)
const smtpFailed = ref(false)
const smtpFailedDetail = ref('')

onMounted(async () => {
    const t = await httpReq("GET", 'management/settings', null, null, null)
    console.log(t);
    if (t.status == 200) {
        copyProperties(t.data, nodeData);
        // const d = t.data;
        // nodeData.port = d.port;
        // nodeData.maxSessionDurationMin = d.maxSessionDurationMin;
    }
})

async function save() {
    if (!nodeData.emailVerificationRegex)
        nodeData.emailVerificationRegex = defaultEmailVerificationRegex;
    const r = await httpReq("POST", 'management/settings', null, null, nodeData)
    console.log(r);
    if (r.status == 200) {
        ElMessage({ type: 'success', message: t('lang.common.saved'), })
    } else {
        const m = t(r.err.message);
        ElMessage.error(m ? m : r.err.message);
    }
}

const smtpTest = async () => {
    loading.value = true
    const r = await httpReq("POST", 'management/settings/smtp/test', null, null, nodeData)
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

const goBack = () => {
    router.push('/guide')
}

// https://docs.spring.io/spring-ai/reference/api/embeddings.html
const embeddingProviders = [
    {
        id: 'HuggingFace',
        name: 'HuggingFace',
        embeddingURL: 'Model will be downloaded locally at ./data/models',
        eUrlEditable: false,
        showApiKeyInput: false,
        models: ['BAAI/bge-base-en-v1.5', 'BAAI/bge-small-en-v1.5', 'BAAI/bge-large-en-v1.5', 'BAAI/bge-m3', 'BAAI/bge-small-zh-v1.5', 'sentence-transformers/all-MiniLM-L6-v2', 'sentence-transformers/paraphrase-MiniLM-L12-v2', 'sentence-transformers/paraphrase-multilingual-mpnet-base-v2', 'nomic-ai/nomic-embed-text-v1', 'nomic-ai/nomic-embed-text-v1.5', 'intfloat/multilingual-e5-small', 'intfloat/multilingual-e5-base', 'intfloat/multilingual-e5-large', 'mixedbread-ai/mxbai-embed-large-v1']
    },
    {
        id: 'OpenAI',
        name: 'OpenAI',
        embeddingURL: 'https://api.openai.com/v1/embeddings',
        eUrlEditable: false,
        showApiKeyInput: true,
        models: ['text-embedding-3-small', 'text-embedding-3-large', 'text-embedding-ada-002']
    },
    {
        id: 'Ollama',
        name: 'Ollama',
        embeddingURL: 'http://localhost:11434/api/embeddings',
        eUrlEditable: true,
        showApiKeyInput: false,
        models: ['llama3', 'phi3', 'mistral', 'gemma', 'llama2', 'qwen', 'mixtral', 'tinyllama', 'yi', 'all-minilm', 'llama2-chinese']
    },
    {
        id: 'MistralAI',
        name: 'Mistral AI',
        embeddingURL: 'https://api.mistral.ai',
        eUrlEditable: false,
        showApiKeyInput: true,
        models: ['']
    },
]
const modelOptions = reactive([])
const embeddingProviderSettings = reactive({
    provider: '',
    apiUrl: '',
    apiUrlDisabled: false,
    apiKey: '',
    model: '',
})
const changeEmbeddingProvider = (n) => {
    for (let i = 0; i < embeddingProviders.length; i++) {
        if (embeddingProviders[i].id == n) {
            embeddingProviderSettings.apiUrl = embeddingProviders[i].embeddingURL;
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
            <el-form :model="nodeData">
                <el-form-item label="IP addr (v4 or v6)" :label-width="formLabelWidth">
                    <el-input v-model="nodeData.ip" placeholder="" />
                </el-form-item>
                <el-form-item label="" :label-width="formLabelWidth">
                    {{ $t('lang.settings.ipNote') }}
                </el-form-item>
                <el-form-item :label="$t('lang.settings.prompt2')" :label-width="formLabelWidth">
                    <el-input-number v-model="nodeData.port" :min="1024" :max="65530" @change="handleChange" />
                </el-form-item>
                <el-form-item label="" :label-width="formLabelWidth">
                    <input type="checkbox" id="_randomPortWhenConflict_" v-model="nodeData.selectRandomPortWhenConflict"
                        :checked="nodeData.selectRandomPortWhenConflict" />
                    <label for="_randomPortWhenConflict_">{{ $t('lang.settings.prompt2_2') }}</label>
                </el-form-item>
                <el-form-item :label="$t('lang.settings.prompt3')" :label-width="formLabelWidth">
                    <el-input-number v-model="nodeData.maxSessionDurationMin" :min="1" :max="1440"
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
            <el-form :model="embeddingProviderSettings" label-width="auto" style="max-width: 600px">
                <el-form-item label="Provider">
                    <el-radio-group v-model="embeddingProviderSettings.provider" size="large"
                        @change="changeEmbeddingProvider">
                        <el-radio-button v-for="item in embeddingProviders" :id="item.id" :key="item.id"
                            :label="item.name" :value="item.id" />
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="Request address">
                    <el-input v-model="embeddingProviderSettings.apiUrl" :disabled="" />
                </el-form-item>
                <el-form-item label="OpenAI API key">
                    <el-input v-model="embeddingProviderSettings.apiKey" />
                </el-form-item>
                <el-form-item label="Model">
                    <el-select v-model="embeddingProviderSettings.model" placeholder="Choose a model">
                        <el-option v-for="item in modelOptions" :id="item" :key="item" :label="item" :value="item" />
                    </el-select>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
    <h3>Email settings</h3>
    <el-row>
        <el-col :span="11" :offset="1">
            <el-form :model="nodeData">
                <el-form-item label="Email SMTP" :label-width="formLabelWidth">
                </el-form-item>
                <el-form-item label="Host" :label-width="formLabelWidth">
                    <el-input v-model="nodeData.smtpHost" placeholder="" />
                </el-form-item>
                <el-form-item label="Username" :label-width="formLabelWidth">
                    <el-input v-model="nodeData.smtpUsername" placeholder="" />
                </el-form-item>
                <el-form-item label="Password" :label-width="formLabelWidth">
                    <el-input v-model="nodeData.smtpPassword" placeholder="" type="password" />
                </el-form-item>
                <el-form-item label="Timeout" :label-width="formLabelWidth">
                    <el-input-number v-model="nodeData.smtpTimeoutSec" :min="1" :max="600" @change="handleChange" />
                    Seconds
                </el-form-item>
                <el-form-item label="Email verification regex" label-width="200px">
                    <el-input v-model="nodeData.emailVerificationRegex" :placeholder="defaultEmailVerificationRegex" />
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