<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { httpReq } from '../../assets/tools.js'
const route = useRoute()
const router = useRouter();
const robotId = route.params.robotId
const newDoc = reactive({
    question: {
        question: ''
    },
    similarQuestions: [],
    answer: '',
})
const tableData = reactive([])
const objectSpanMethod = ({ row, column, rowIndex, columnIndex }) => {
    console.log(column);
    return { rowspan: column.length, colspan: 1 }
}
onMounted(async () => {
    const t = await httpReq('GET', 'kb/qa', { robotId: robotId }, null, null);
    console.log(t);
    if (t.status == 200)
        tableData.splice(0, tableData.length, ...t.data);
})
const saveQa = async () => {
    const t = await httpReq('POST', 'kb/qa', { robotId: robotId }, null, newDoc);
    console.log(t);
    dialogVisible = false
}
const goBack = () => {
    router.push({ name: 'robotDetail', params: { robotId: robotId } });
}

const dialogVisible = ref(false)
const formLabelWidth = '120px'
</script>
<template>
    <el-page-header :title="$t('lang.common.back')" @back="goBack">
        <template #content>
            <span class="text-large font-600 mr-3">Question and answers</span>
        </template>
    </el-page-header>
    <br />
    <!-- <h3>QA</h3> -->
    <el-button type="success" @click="dialogVisible = true">Add QnA pair</el-button>
    <table border="1" cellspacing="0">
        <tr>
            <th width="200">Question</th>
            <th width="200">Similar questions</th>
            <th width="200">Answer</th>
        </tr>
        <tr v-for="(item, index) in tableData" :id="index" :key="index">
            <td>{{ item.qaData.question.question }}</td>
            <td>
                <table>
                    <tr v-for="(sq, idx) in item.qaData.similarQuestions" :id="idx" :key="idx">
                        <td>{{ sq.question }}</td>
                    </tr>
                </table>
            </td>
            <td>{{ item.qaData.answer }}</td>
        </tr>
    </table>
    <el-dialog v-model="dialogVisible" title="Add new QA" width="800">
        <el-form :model="newDoc">
            <el-form-item label="Question" :label-width="formLabelWidth">
                <el-input v-model="newDoc.question.question" placeholder="" />
            </el-form-item>
            <el-form-item v-for="(item, index) in newDoc.similarQuestions" :id="index" :key="index"
                :label="index == 0 ? 'Similar questions' : ''" :label-width="formLabelWidth">
                <el-input v-model="newDoc.similarQuestions[index].question" placeholder="" style="width: 90%;" />
                <el-button circle @click="newDoc.similarQuestions.splice(index, 1)" v-show="index > 0">-</el-button>
            </el-form-item>
            <el-form-item label="" :label-width="formLabelWidth">
                <el-button plain @click="newDoc.similarQuestions.push({ question: '' })">New similar
                    question</el-button>
            </el-form-item>
            <el-form-item label="Answer" :label-width="formLabelWidth">
                <el-input v-model="newDoc.answer" placeholder="" type="textarea" :rows="5" />
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button type="primary" @click="saveQa">
                    {{ $t('lang.common.save') }}
                </el-button>
                <el-button @click="dialogVisible = false">Cancel</el-button>
            </div>
        </template>
    </el-dialog>

</template>