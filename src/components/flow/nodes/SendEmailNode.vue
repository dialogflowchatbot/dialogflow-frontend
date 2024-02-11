<script setup>
import { inject,reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n();

const nodeData = reactive({
    nodeName: 'Send email node',
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    content: '',
    invalidMessages:[],
})
const nodeSetFormVisible = ref(false)
const getNode = inject('getNode');
const node = getNode();
node.on("change:data", ({ current }) => {
    nodeSetFormVisible.value = true;
});
const saveForm = () => {}
const hideForm = () => {
    nodeSetFormVisible.value = false;
}
</script>
<style scoped>
.nodeBox {
    border: 2px #0000000e solid;
    height: 100%;
    width: 100%;
    background-color: white;
    font-size: 12px;
}

.nodeTitle {
    background-color: rgb(255, 101, 85);
    color: white;
    font-weight: 500;
    font-size: 14px;
    padding: 5px;
}

.optionWidth {
    width: 110px;
}
</style>
<template>
    <div class="nodeBox">
        <div ref="nodeName" class="nodeTitle">
            {{ nodeData.nodeName }}
            <span v-show="nodeData.invalidMessages.length > 0">
                <el-tooltip class="box-item" effect="dark" :content="nodeData.invalidMessages.join('<br/>')"
                    placement="bottom" raw-content>
                    <el-icon color="red">
                        <EpWarning />
                    </el-icon>
                </el-tooltip>
            </span>
        </div>
        <div>To: {{ nodeData.to }}</div>
        <div>Subject: {{ nodeData.subject }}</div>
        <teleport to="body">
            <el-drawer v-model="nodeSetFormVisible" :title="nodeData.nodeName" direction="rtl" size="70%">
                <el-form :label-position="labelPosition" label-width="90px" :model="nodeData" style="max-width: 500px">
                    <el-form-item :label="t('lang.common.nodeName')" :label-width="formLabelWidth">
                        <el-input v-model="nodeData.nodeName" />
                    </el-form-item>
                    <el-form-item label="To" :label-width="formLabelWidth">
                        <el-input v-model="nodeData.to" placeholder="" />
                    </el-form-item>
                    <el-form-item label="" :label-width="formLabelWidth">
                        Separate multiple recipients with semicolons
                    </el-form-item>
                    <el-form-item label="Cc" :label-width="formLabelWidth">
                        <el-input v-model="nodeData.cc" placeholder="" />
                    </el-form-item>
                    <el-form-item label="Bcc" :label-width="formLabelWidth">
                        <el-input v-model="nodeData.bcc" placeholder="" />
                    </el-form-item>
                    <el-form-item label="Subject" :label-width="formLabelWidth">
                        <el-input v-model="nodeData.subject" placeholder="" />
                    </el-form-item>
                    <el-form-item label="Content" :label-width="formLabelWidth">
                        <el-input v-model="nodeData.content" :rows="2" type="textarea" placeholder="Please input" />
                    </el-form-item>
                </el-form>
                <div class="demo-drawer__footer">
                    <el-button type="primary" :loading="loading" @click="saveForm()">{{ t('lang.common.save') }}</el-button>
                    <el-button @click="hideForm()">{{ t('lang.common.cancel') }}</el-button>
                </div>
            </el-drawer>
        </teleport>
    </div>
</template>
