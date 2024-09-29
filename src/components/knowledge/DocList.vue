<script setup>
import { reactive } from 'vue';
const newDoc = reactive({
    question: '',
    answer: '',
})
const uploadDoc = () => {
    const file = document.getElementById('f').files[0];
    fetch('', {
        method: 'POST',
        body: file,
        onprogress: (event) => {
            if (event.lengthComputable) {
                const p = Math.round(event.loaded / event.total * 100);
            }
        },
    });
}
</script>
<template>
    <h3>QA</h3>
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
            <el-button @click="goBack()">{{ $t('lang.common.back') }}</el-button>
        </el-form-item>
    </el-form>
    <h3>Docs</h3>
</template>