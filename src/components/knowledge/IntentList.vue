<script setup>
import { nextTick, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { httpReq } from '../../assets/tools.js'
import { useI18n } from 'vue-i18n'
const { t, tm, rt } = useI18n();
const router = useRouter();

const intentData = ref([]);
const formLabelWidth = '70px';
const dialogFormVisible = ref(false);
const intentName = ref('');

onMounted(async () => {
    await list();
});

const goBack = () => {
    router.push('/guide')
}

async function list() {
    const t = await httpReq('GET', 'intent', null, null, null);
    if (t.status == 200)
        intentData.value = t.data;
}

async function newIntent() {
    const formData = { id: '', data: intentName.value };
    const t = await httpReq('POST', 'intent', null, null, formData);
    // console.log(t.data);
    if (t.status == 200)
        await list();
}
function editIntent(idx, row) {
    router.push({ path: '/intent/detail', query: { id: intentData.value[idx].id, idx: idx, name: row.name } });
}
async function deleteIntent(idx, row) {
    ElMessageBox.confirm(
        t('lang.intent.delConfirm'),
        'Warning',
        {
            confirmButtonText: t('lang.common.del'),
            cancelButtonText: t('lang.common.cancel'),
            type: 'warning',
        }
    ).then(async () => {
        const formData = { id: intentData.value[idx].id, data: idx.toString() };
        const t = await httpReq('DELETE', 'intent', null, null, formData);
        console.log(t.data);
        if (t.status == 200)
            await list();
        ElMessage({
            type: 'success',
            message: t('lang.common.deleted'),
        })
    }).catch(() => {
        // ElMessage({
        //     type: 'info',
        //     message: 'Delete canceled',
        // })
    })
}

const testIntentDetectionText = ref('')
const intentDetectResult = ref('')
async function detectIntent() {
    const formData = { id: '', data: testIntentDetectionText.value };
    const t = await httpReq('POST', 'intent/detect', null, null, formData);
    console.log(t.data);
    if (t.status == 200) {
        if (t.data == null)
            intentDetectResult.value = 'No intention detected.';
        else
            intentDetectResult.value = 'The detected intention is: ' + t.data;
    }
}
</script>
<template>
    <el-page-header :title="t('lang.common.back')" @back="goBack">
        <template #content>
            <span class="text-large font-600 mr-3">{{ $t('lang.intent.title') }}</span>
        </template>
        <template #extra>
            <div class="flex items-center">
                <el-button type="primary" class="ml-2" @click="dialogFormVisible = true">{{ $t('lang.intent.add')
                    }}</el-button>
            </div>
        </template>
    </el-page-header>
    <el-table :data="intentData" stripe style="width: 100%">
        <el-table-column prop="name" :label="tm('lang.intent.table')[0]" width="180" />
        <el-table-column prop="keyword_num" :label="tm('lang.intent.table')[1]" width="180" />
        <el-table-column prop="regex_num" :label="tm('lang.intent.table')[2]" width="180" />
        <el-table-column prop="phrase_num" :label="tm('lang.intent.table')[3]" width="180" />
        <el-table-column fixed="right" :label="tm('lang.intent.table')[4]" width="120">
            <template #default="scope">
                <el-button link type="primary" size="small" @click="editIntent(scope.$index, scope.row)">{{
                    $t('lang.common.edit') }}</el-button>
                <el-button link type="primary" size="small" @click="deleteIntent(scope.$index, scope.row)">{{
                    $t('lang.common.del') }}</el-button>
            </template>
        </el-table-column>
    </el-table>
    <el-divider />
    <el-input v-model="testIntentDetectionText" style="width: 240px" placeholder="Please input some texts" />
    <el-button type="primary" @click="detectIntent">Test intent detection</el-button>
    <div>{{ intentDetectResult }}</div>
    <el-dialog v-model="dialogFormVisible" :title="t('lang.intent.form.title')">
        <el-form :model="form">
            <el-form-item :label="t('lang.intent.form.name')" :label-width="formLabelWidth">
                <el-input v-model="intentName" autocomplete="off" />
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" @click="dialogFormVisible = false; newIntent();">
                    {{ $t('lang.common.add') }}
                </el-button>
                <el-button @click="dialogFormVisible = false">{{ $t('lang.common.cancel') }}</el-button>
            </span>
        </template>
    </el-dialog>
</template>