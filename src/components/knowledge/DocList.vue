<script setup>
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { UploadFilled } from '@element-plus/icons-vue'
const route = useRoute()
const router = useRouter();
const robotId = route.params.robotId
const uploadUrlHost = window.location.href.indexOf('localhost') > -1 ? 'http://localhost:12715' : '';
const uploadUrl = uploadUrlHost + "/kb/doc/upload?robotId=" + robotId
/*
const updateUploadingProgress = (evt, uploadFile, uploadFiles) => {
    // const file = document.getElementById('f').files[0];
    // fetch('', {
    //     method: 'POST',
    //     body: file,
    //     onprogress: (event) => {
    //         if (event.lengthComputable) {
    //             const p = Math.round(event.loaded / event.total * 100);
    //         }
    //     },
    // });
    if (evt.lengthComputable) {
        const p = `Uploading (${((evt.loaded / evt.total) * 100).toFixed(2,)}%)…`;
        const m = 'Uploading ' + JSON.stringify(uploadFile) + ' ' + p + '%'
        console.log(m)
    }
}
*/
const goBack = () => {
    router.push({ name: 'robotDetail', params: { robotId: robotId } });
}

</script>
<template>
    <!-- <el-page-header :title="$t('lang.common.back')" @back="goBack">
        <template #content>
            <span class="text-large font-600 mr-3">Documents management</span>
        </template>
    </el-page-header> -->
    <h1>Documents</h1>
    <el-upload drag :action="uploadUrl" multiple>
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div>
            Drop file here or <em>click to upload</em>
        </div>
        <template #tip>
            <div class="el-upload__tip">
                docx/pdf files with a size less than 20MB
            </div>
        </template>
    </el-upload>
</template>