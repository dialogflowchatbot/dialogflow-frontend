<script setup>
import { computed, ref } from "vue";
import { useRouter } from 'vue-router';
import Api from './Api.vue';
import FlowEditDoc from './FlowEdit.vue';
import HowToUseDoc from './HowToUse.vue';
import KnowledgeDoc from './KmsDoc.vue';
import VariableDoc from './VarDoc.vue';
import VariableHttpDoc from './VarHttpDoc.vue';
import NodesIntro from './NodesIntro.vue';
import { useI18n } from 'vue-i18n'
import BiChatSquareDots from '~icons/bi/chat-square-dots'
import SolarDownloadOutline from '~icons/solar/download-outline'
const { t, tm, rt } = useI18n();
const router = useRouter();
const currentDoc = ref('Api')
const docs = {
    Api,
    FlowEditDoc,
    HowToUseDoc,
    KnowledgeDoc,
    VariableDoc,
    VariableHttpDoc,
    NodesIntro,
}
function goBack() {
    router.push('/guide');
}
const menuItemClassObject = computed(() => ({
    item: currentDoc.value === '',
    itemSelected: false,
}))
</script>
<style scoped>
.title {
    font-weight: bold;
    font-size: 18px;
    margin-bottom: 16px;
    margin-left: 10px;
}

.item {
    color: black;
    background-color: white;
    padding: 10px;
    border-bottom: #ccc solid 1px;
    cursor: pointer;
}

.item-bg {
    color: white;
    background-color: #a0cfff;
}
</style>
<template>
    <el-page-header :title="t('lang.common.back')" @back="goBack">
        <template #content>
            <span class="text-large font-600 mr-3"> Dialog flow chat bot tool usage documents </span>
        </template>
    </el-page-header>
    <p></p>
    <el-row>
        <el-col :span="5">
            <p>
            <div class="title">
                <el-icon size="20">
                    <BiChatSquareDots />
                </el-icon>
                Dialog flow
            </div>
            <div class="item" @click="currentDoc = 'HowToUseDoc'">How to create a dialog flow?</div>
            <div class="item" @click="currentDoc = 'NodesIntro'">Nodes introduction</div>
            <div class="item" @click="currentDoc = 'Api'">Program interface integration guide</div>
            </p>
            <!-- <p>
            <div class="title">
                <el-icon size="20">
                    <Orange />
                </el-icon>Intents (WIP)
            </div>
            </p> -->
            <p>
            <div class="title">
                <el-icon size="20">
                    <SolarDownloadOutline />
                </el-icon>Variables
            </div>
            <div class="item" @click="currentDoc = 'VariableHttpDoc'">How to retrieve data from HTTP?</div>
            </p>
        </el-col>
        <el-col :span="19" style="padding-left: 6px;">
            <keep-alive>
                <component :is="docs[currentDoc]"></component>
            </keep-alive>
        </el-col>
    </el-row>
</template>