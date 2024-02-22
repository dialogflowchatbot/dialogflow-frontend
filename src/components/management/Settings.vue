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
    randomPort: false,
    maxSessionDurationMin: '30',
    smtpHost: '',
    smtpUsername: '',
    smtpPassword: '',
    smtpTimeoutSec: 60,
    emailVerificationRegex: '',
});
const formLabelWidth = '130px'

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

const goBack = () => {
    router.push('/guide')
}
</script>
<template>
    <el-page-header :title="$t('lang.common.back')" @back="goBack">
        <template #content>
            <span class="text-large font-600 mr-3">{{ $t('lang.settings.title') }}</span>
        </template>
    </el-page-header>
    <p>&nbsp;</p>
    <el-row>
        <el-col :span="11" :offset="1">
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
                    <input type="checkbox" id="_randomPort_" v-model="nodeData.randomPort" :checked="nodeData.randomPort" />
                    <label for="_randomPort_">{{ $t('lang.settings.prompt2_2') }}</label>
                </el-form-item>
                <el-form-item :label="$t('lang.settings.prompt3')" :label-width="formLabelWidth">
                    <el-input-number v-model="nodeData.maxSessionDurationMin" :min="1" :max="1440" @change="handleChange" />
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
    <p>&nbsp;</p>
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
                    <el-button type="primary" @click="save">
                        {{ $t('lang.common.save') }}
                    </el-button>
                    <el-button @click="goBack()">{{ $t('lang.common.cancel') }}</el-button>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
</template>