<script setup>
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { UploadFilled } from '@element-plus/icons-vue'
const route = useRoute()
const router = useRouter();
const robotId = route.params.robotId
const uploadUrlHost = window.location.href.indexOf('localhost') > -1 ? 'http://localhost:12715' : '';
const uploadUrl = uploadUrlHost + "/kb/doc/upload?robotId=" + robotId
const newDoc = reactive({
    question: '',
    similarQuestions: [''],
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
const goBack = () => {
    router.push({ name: 'robotDetail', params: { robotId: robotId } });
}


const dialogVisible = ref(false)
const formLabelWidth = '120px'
</script>
<template>
    <el-page-header :title="$t('lang.common.back')" @back="goBack">
        <template #content>
            <span class="text-large font-600 mr-3">Knowledge base management</span>
        </template>
    </el-page-header>

    <el-container>
        <el-aside width="300px">
            <h3>Docs</h3>
            <el-upload drag :action="uploadUrl" multiple>
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                    Drop file here or <em>click to upload</em>
                </div>
                <template #tip>
                    <div class="el-upload__tip">
                        docx/pdf files with a size less than 20MB
                    </div>
                </template>
            </el-upload>
        </el-aside>
        <el-main>
            <h3>QA</h3>
            <el-button type="success" @click="dialogVisible = true">Add QnA pair</el-button>
            <el-dialog v-model="dialogVisible" title="Add new QA" width="800">
                <el-form :model="newDoc">
                    <el-form-item label="Question" :label-width="formLabelWidth">
                        <el-input v-model="newDoc.question" placeholder="" />
                    </el-form-item>
                    <el-form-item v-for="(item, index) in newDoc.similarQuestions" :id="index" :key="index"
                        :label="index == 0 ? 'Similar questions' : ''" :label-width="formLabelWidth">
                        <el-input v-model="newDoc.similarQuestions[index]" placeholder="" style="width: 90%;" />
                        <el-button circle @click="newDoc.similarQuestions.splice(index, 1)"
                            v-show="index > 0">-</el-button>
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

        </el-main>
    </el-container>
</template>