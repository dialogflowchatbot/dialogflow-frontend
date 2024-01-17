<script setup>
const props = defineProps({
    parentPage: {
        type: String,
        default: 'home',
    }
})
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'
import { ElMessageBox } from 'element-plus'
import { isOnGithub } from '../assets/tools.js'
const { t, locale } = useI18n();
const router = useRouter();
function gotoDemo(id, name) {
    if (isOnGithub()) {
        ElMessageBox.alert(t('lang.home.demoUnvailableContent'), t('lang.home.demoUnvailableTitle'), {
            dangerouslyUseHTMLString: true,
            // if you want to disable its autofocus
            // autofocus: false,
            confirmButtonText: 'OK',
            callback: (action) => {
                // ElMessage({
                //     type: 'info',
                //     message: `action: ${action}`,
                // })
            },
        });
    } else {
        router.push({ name: 'subflow', params: { id: id, name: name } });
    }
}
// console.log("parentPage=" + props.parentPage);
</script>
<template>
    <div>
        {{ $t('lang.home.demo') }}:
        <template v-if="props.parentPage == 'home'">
            <ol>
                <li>
                    <el-link type="success" @click="gotoDemo('demo-repay', 'UmVwYXkgRGVtbw==')">{{
                        $t('lang.home.demo1') }}</el-link>
                </li>
                <li>
                    <el-link type="success" @click="gotoDemo('demo-collect', 'SW5mb3JtYXRpb24gQ29sbGVjdGlvbiBEZW1v')">{{
                        $t('lang.home.demo2') }}</el-link>
                </li>
                <li>
                    <el-link type="success" @click="gotoDemo('demo-notify', 'T25lIFNlbnRlbmNlIE5vdGlmaWNhdGlvbiBEZW1v')">{{
                        $t('lang.home.demo3') }}</el-link>
                </li>
            </ol>
        </template>
        <template v-else>
            <el-link type="success" @click="gotoDemo('demo-repay', 'UmVwYXkgRGVtbw==')">{{
                $t('lang.home.demo1') }}</el-link>
            |
            <el-link type="success" @click="gotoDemo('demo-collect', 'SW5mb3JtYXRpb24gQ29sbGVjdGlvbiBEZW1v')">{{
                $t('lang.home.demo2') }}</el-link>
            |
            <el-link type="success" @click="gotoDemo('demo-notify', 'T25lIFNlbnRlbmNlIE5vdGlmaWNhdGlvbiBEZW1v')">{{
                $t('lang.home.demo3') }}</el-link>
        </template>
    </div>
</template>