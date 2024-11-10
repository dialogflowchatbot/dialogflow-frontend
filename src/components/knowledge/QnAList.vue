<script setup>
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute()
const router = useRouter();
const robotId = route.params.robotId
const newDoc = reactive({
    question: '',
    similarQuestions: [''],
    answer: '',
})

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
    <el-dialog v-model="dialogVisible" title="Add new QA" width="800">
        <el-form :model="newDoc">
            <el-form-item label="Question" :label-width="formLabelWidth">
                <el-input v-model="newDoc.question" placeholder="" />
            </el-form-item>
            <el-form-item v-for="(item, index) in newDoc.similarQuestions" :id="index" :key="index"
                :label="index == 0 ? 'Similar questions' : ''" :label-width="formLabelWidth">
                <el-input v-model="newDoc.similarQuestions[index]" placeholder="" style="width: 90%;" />
                <el-button circle @click="newDoc.similarQuestions.splice(index, 1)" v-show="index > 0">-</el-button>
            </el-form-item>
            <el-form-item label="" :label-width="formLabelWidth">
                <el-button plain @click="newDoc.similarQuestions.push('')">New similar question</el-button>
            </el-form-item>
            <el-form-item label="Answer" :label-width="formLabelWidth">
                <el-input v-model="newDoc.answer" placeholder="" type="textarea" :rows="5" />
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button type="primary" @click="dialogVisible = false">
                    {{ $t('lang.common.save') }}
                </el-button>
                <el-button @click="dialogVisible = false">Cancel</el-button>
            </div>
        </template>
    </el-dialog>

</template>