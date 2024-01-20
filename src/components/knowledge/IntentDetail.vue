<script setup>
import { nextTick, reactive, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// import { ElMessage, ElMessageBox } from 'element-plus'
import { httpReq } from '../../assets/tools.js'
import { useI18n } from 'vue-i18n'
const { t, tm, rt } = useI18n();
const route = useRoute();
const router = useRouter();

const intentData = reactive({
    keywords: [],
    regexes: [],
    phrases: [],
});

const formData = {
    id: '',
    data: '',
};

onMounted(async () => {
    formData.id = route.query.id;
    const t = await httpReq('GET', 'intent/detail', formData, null, null);
    console.log(t.data);
    if (t.status == 200 && t.data) {
        intentData.keywords = t.data.keywords;
        intentData.regexes = t.data.regexes;
        intentData.phrases = t.data.phrases;
    }
});

//keyword
const keywordValue = ref('');
const keywordInputVisible = ref(false);
const keywordInputRef = ref();
const showKeyWordInput = () => {
    keywordInputVisible.value = true
    nextTick(() => {
        keywordInputRef.value.focus()
    })
}

async function newKeyword() {
    if (keywordValue.value) {
        formData.id = route.query.id;
        formData.data = keywordValue.value;
        const t = await httpReq('POST', 'intent/keyword', null, null, formData);
        console.log(t.data);
        if (t.status == 200)
            intentData.keywords.push(keywordValue.value)
    }
    keywordInputVisible.value = false
    keywordValue.value = ''
}

async function removeKeyword(w) {
    ElMessageBox.confirm(
        w + ' will be deleted permanently. Continue?',
        'Warning',
        {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning',
        }
    )
        .then(async () => {
            const idx = intentData.keywords.indexOf(w);
            formData.id = route.query.id;
            formData.data = idx.toString();
            const t = await httpReq('DELETE', 'intent/keyword', null, null, formData);
            console.log(t.data);
            if (t.status == 200) {
                intentData.keywords.splice(idx, 1);
                ElMessage({
                    type: 'success',
                    message: 'Delete completed',
                })
            }
        })
        .catch(() => {
            // ElMessage({
            //     type: 'info',
            //     message: 'Delete canceled',
            // })
        })
}

//regex
const regexValue = ref('');
const regexInputVisible = ref(false);
const regexInputRef = ref();
const showRegexInput = () => {
    regexInputVisible.value = true
    nextTick(() => {
        regexInputRef.value.focus()
    })
}

async function newRegex() {
    if (regexValue.value) {
        formData.id = route.query.id;
        formData.data = regexValue.value;
        const t = await httpReq('POST', 'intent/regex', null, null, formData);
        console.log(t.data);
        if (t.status == 200)
            intentData.regexes.push(regexValue.value)
    }
    regexInputVisible.value = false
    regexValue.value = ''
}

async function removeRegex(w) {
    ElMessageBox.confirm(
        w + ' will be deleted permanently. Continue?',
        'Warning',
        {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning',
        }
    )
        .then(async () => {
            const idx = intentData.regexes.indexOf(w);
            formData.id = route.query.id;
            formData.data = idx.toString();
            const t = await httpReq('DELETE', 'intent/regex', null, null, formData);
            console.log(t.data);
            if (t.status == 200) {
                intentData.regexes.splice(idx, 1);
                ElMessage({
                    type: 'success',
                    message: 'Delete completed',
                })
            }
        })
        .catch(() => {
            // ElMessage({
            //     type: 'info',
            //     message: 'Delete canceled',
            // })
        })
}

//phrase
const phraseValue = ref('');
const phraseInputVisible = ref(false);
const phraseInputRef = ref();
const showPhraseInput = () => {
    phraseInputVisible.value = true
    nextTick(() => {
        phraseInputRef.value.focus()
    })
}

async function newPhrase() {
    if (phraseValue.value) {
        formData.id = route.query.id;
        formData.data = phraseValue.value;
        const t = await httpReq('POST', 'intent/phrase', null, null, formData);
        console.log(t.data);
        if (t.status == 200)
            intentData.phrases.push(phraseValue.value)
    }
    phraseInputVisible.value = false
    phraseValue.value = ''
}

async function removePhrase(w) {
    ElMessageBox.confirm(
        w + ' will be deleted permanently. Continue?',
        'Warning',
        {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning',
        }
    )
        .then(async () => {
            const idx = intentData.phrases.indexOf(w);
            formData.id = route.query.id;
            formData.data = idx.toString();
            const t = await httpReq('DELETE', 'intent/phrase', null, null, formData);
            console.log(t.data);
            if (t.status == 200) {
                intentData.phrases.splice(idx, 1);
                ElMessage({
                    type: 'success',
                    message: 'Delete completed',
                })
            }
        })
        .catch(() => {
            // ElMessage({
            //     type: 'info',
            //     message: 'Delete canceled',
            // })
        })
}

const goBack = () => {
    router.push('/intents')
}
</script>
<style scoped></style>
<template>
    <el-page-header :title="t('lang.common.back')" @back="goBack">
        <template #content>
            <span class="text-large font-600 mr-3">{{ $t('lang.intent.detail.edit') }}: {{ route.query.name }} </span>
        </template>
    </el-page-header>

    <h3>{{ $t('lang.intent.detail.kw') }}</h3>
    <el-tag v-for="tag in intentData.keywords" type="info" :key="tag" class="mx-1" closable :disable-transitions="false"
        @close="removeKeyword(tag)">
        {{ tag }}
    </el-tag>
    <el-input v-if="keywordInputVisible" ref="keywordInputRef" v-model="keywordValue" class="ml-1 w-20" size="small"
        @keyup.enter="newKeyword" @blur="newKeyword" />
    <el-button v-else class="button-new-tag ml-1" size="small" @click="showKeyWordInput">
        + {{ $t('lang.intent.detail.addKw') }}
    </el-button>

    <h3>{{ $t('lang.intent.detail.re') }}</h3>
    <el-tag v-for="tag in intentData.regexes" type="info" :key="tag" class="mx-1" closable :disable-transitions="false"
        @close="removeRegex(tag)">
        {{ tag }}
    </el-tag>
    <el-input v-if="regexInputVisible" ref="regexInputRef" v-model="regexValue" class="ml-1 w-20" size="small"
        @keyup.enter="newRegex" @blur="newRegex" />
    <el-button v-else class="button-new-tag ml-1" size="small" @click="showRegexInput">
        + {{ $t('lang.intent.detail.addRe') }}
    </el-button>

    <h3>{{ $t('lang.intent.detail.sp') }}</h3>
    <el-tag v-for="tag in intentData.phrases" type="info" :key="tag" class="mx-1" closable :disable-transitions="false"
        @close="removePhrase(tag)">
        {{ tag }}
    </el-tag>
    <el-input v-if="phraseInputVisible" ref="phraseInputRef" v-model="phraseValue" class="ml-1 w-20" size="small"
        @keyup.enter="newPhrase" @blur="newPhrase" />
    <el-button v-else class="button-new-tag ml-1" size="small" @click="showPhraseInput">
        + {{ $t('lang.intent.detail.addSp') }}
    </el-button>
</template>