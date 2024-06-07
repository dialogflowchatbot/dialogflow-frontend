<script setup>
import { nextTick, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { httpReq } from '../../assets/tools.js'
import { useI18n } from 'vue-i18n'
const { t, tm, rt } = useI18n();
const router = useRouter();

const robotData = ref([]);
const formLabelWidth = '70px';
const dialogFormVisible = ref(false);
const robotData = reactive({
    robotName: '',
    robotType: '',
});

onMounted(async () => {
    await list();
});

const goBack = () => {
    router.push('/guide')
}

async function list() {
    const t = await httpReq('GET', 'robot', null, null, null);
    if (t.status == 200)
        robotData.value = t.data;
}

async function newRobot() {
    const formData = { id: '', data: robotName.value };
    const t = await httpReq('POST', 'robot', null, null, formData);
    // console.log(t.data);
    if (t.status == 200)
        await list();
}
function editRobot(idx, row) {
    router.push({ path: '/robot/detail', query: { id: robotData.value[idx].id, idx: idx, name: row.name } });
}
async function deleteRobot(idx, row) {
    ElMessageBox.confirm(
        'Do you confirm that delete this robot and its all data?',
        'Warning',
        {
            confirmButtonText: t('lang.common.del'),
            cancelButtonText: t('lang.common.cancel'),
            type: 'warning',
        }
    ).then(async () => {
        const formData = { id: robotData.value[idx].id, data: idx.toString() };
        const t = await httpReq('DELETE', 'robot', null, null, formData);
        console.log(t.data);
        if (t.status == 200) {
            await list();
            ElMessage({
                type: 'success',
                message: t('lang.common.deleted'),
            })
        } else {
            ElMessage({
                type: 'error',
                message: t.err.message,
            })
        }
    }).catch(() => {
        // ElMessage({
        //     type: 'info',
        //     message: 'Delete canceled',
        // })
    })
}
</script>
<template>
    <el-page-header :title="t('lang.common.back')" @back="goBack">
        <template #content>
            <span class="text-large font-600 mr-3">Robots</span>
        </template>
        <template #extra>
            <div class="flex items-center">
                <el-button type="primary" class="ml-2" @click="dialogFormVisible = true">New robot</el-button>
            </div>
        </template>
    </el-page-header>
    <el-table :data="robotData" stripe style="width: 100%">
        <el-table-column prop="robot_name" label="Robot name" width="180" />
        <el-table-column prop="robot_type" label="Robot type" width="180" />
        <el-table-column prop="intent_num" label="Quantity of intent" width="180" />
        <el-table-column prop="flow_num" label="Quantity of dialog flow" width="230" />
        <el-table-column fixed="right" label="Operations" width="120">
            <template #default="scope">
                <el-button link type="primary" size="small" @click="editRobot(scope.$index, scope.row)">{{
                    $t('lang.common.edit') }}</el-button>
                <el-button link type="primary" size="small" @click="deleteRobot(scope.$index, scope.row)">{{
                    $t('lang.common.del') }}</el-button>
            </template>
        </el-table-column>
    </el-table>
    <el-dialog v-model="dialogFormVisible" :title="New robot">
        <el-form :model="form">
            <el-form-item label="Name" :label-width="formLabelWidth">
                <el-input v-model="robotData.robotName" autocomplete="off" />
            </el-form-item>
            <el-form-item label="Purpose" :label-width="formLabelWidth">
                <el-select v-model="robotData.robotType" placeholder="" @change="changeTab">
                    <el-option label="Text" value="Text" />
                    <el-option label="Inbound" value="Inbound" />
                    <el-option label="Outbound" value="Outbound" />
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" @click="dialogFormVisible = false; newRobot();">
                    {{ $t('lang.common.add') }}
                </el-button>
                <el-button @click="dialogFormVisible = false">{{ $t('lang.common.cancel') }}</el-button>
            </span>
        </template>
    </el-dialog>
</template>