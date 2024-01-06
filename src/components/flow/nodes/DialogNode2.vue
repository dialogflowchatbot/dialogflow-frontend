<script>
// import bootstrap from 'bootstrap/dist/js/bootstrap.js';
import { cloneObj } from '../../assets/tools.js'
import { defineComponent } from "vue";
import { ElMessage } from 'element-plus';

export default defineComponent({
    name: "DialogNode",
    inject: ["getGraph", "getNode"],
    data() {
        const validateBranchName = (rule, value, callback) => {
            if (value == '')
                callback(new Error('请输入条件名称'));
            else {
                for (let i = 0; i < this.formData.branches.length; i++) {
                    if (this.formData.branches[i].name == value) {
                        callback(new Error('输入的条件名称重复'));
                        return;
                    }
                }
                callback();
            }
        };
        return {
            nodeSetFormVisible: false,
            branchSetFormVisible: false,
            formLabelWidth: '70px',
            defaultCondition: {
                type: '',
                firstOption: '', secondOption: '', thirdOption: '',
                firstOptions: [], secondOptions: [], thirdOptions: [],
                compareToValue: '',
                inputVariable: false,
                inputVariables: false,
            },
            defaultConditionGroup: [{
                conditions: []
            }],
            formData: {
                name: '对话节点',
                text: '',
                branches: [],
            },
            conditionTypes: [
                { label: '用户意图', value: 'UserIntent' },
                { label: '用户输入', value: 'UserInput' },
                { label: '流程变量', value: 'FlowVariable' },
            ],
            firstOptionsSet: {
                "FlowVariable": [{ label: '变量1', value: 'v1' }, { label: '变量2', value: 'v2' }, { label: '变量3', value: 'v3' }],
            },
            secondOptionsSet: {
                "UserIntent": [{ label: '等于', value: 'equals', inputType: 0 }],
                "UserInput": [{ label: '等于', value: 'equals', inputType: 1 }, { label: '包含', value: 'contains', inputType: 1 }, { label: '超时', value: 'timeout', inputType: 0 }],
                "FlowVariable": [{ label: '等于', value: 'equals', inputType: 1 }, { label: '不等于', value: 'not_equals', inputType: 1 }]
            },

            thirdOptionsSet: {
                "UserIntent": [{ label: '肯定', value: 'POSITIVE' }, { label: '否定', value: 'NEGATIVE' }, { label: '拒绝', value: 'DENY' }],
            },

            branch: {
                name: '',
                type: 'CONDITION_BRANCH',
                conditionGroup: [],
            },
            loading: false,
            editConditionIndex: -1,
            branchFormValidators: {
                name: [{ validator: validateBranchName, trigger: 'blur' }],
            },

        };
    },
    mounted() {
        this.getNode().on("change:data", ({ current }) => {
            // console.log('toggled');
            // const { name, text, nodeSetFormVisible } = current;
            this.nodeSetFormVisible = true;
        });
        this.defaultConditionGroup[0].conditions.push(cloneObj(this.defaultCondition));
        // this.branch.conditionGroup = cloneObj(this.defaultConditionGroup);
        console.log(this.branch);
    },
    methods: {
        addNewBranch() {
            console.log(this.branch);
            this.editConditionIndex = -1;
            this.branch.name = '';
            this.branch.conditionGroup = cloneObj(this.defaultConditionGroup);
            this.branchSetFormVisible = true;
        },
        hideBranchForm() {
            // if (this.editConditionIndex == -1) {
            //     this.branch.name = '';
            //     this.branch.conditionGroup = this.defaultConditions;
            // }
            this.branchSetFormVisible = false;
        },
        saveBranch() {
            if (!this.branch.name) {
                ElMessage({
                    message: '请输入条件名称',
                    type: 'warning',
                });
                return;
            }
            if (this.editConditionIndex == -1)
                this.formData.branches.push(cloneObj(this.branch));
            this.hideBranchForm();
        },
        editBranch(i) {
            // this.branch = cloneObj(this.formData.branches[i]);
            this.branch = this.formData.branches[i];
            this.editConditionIndex = i;
            this.branchSetFormVisible = true;
        },
        removeBranch(i) {
            this.formData.branches.splice(i, 1);
            this.hideBranchForm();
        },
        hideForm() {
            // const { nodeSetFormVisible } = this.getNode().getData();
            // console.log(this.getNode().getData());
            this.nodeSetFormVisible = false;
        },
        saveForm() {
            let heightOffset = this.$refs.nodeName.offsetHeight + this.$refs.nodeAnswer.offsetHeight;
            const node = this.getNode();
            const len = this.formData.branches.length;
            const x = this.$refs.nodeName.offsetWidth - 50;
            node.removePorts();
            for (let i = 0; i < len; i++) {
                heightOffset += 20;
                node.addPort({
                    group: 'absolute',
                    args: { x: x, y: heightOffset },
                    attrs: {
                        text: {
                            text: this.formData.branches[i].name,
                            fontSize: 16,
                        },
                    },

                });
            }
            node.setData({ answer: this.formData.text }, { silent: false });
            this.hideForm();
            console.log(node.getData());
        },
        showOptions(v, groupIndex, conditionIdx) {
            console.log(v + ' ' + groupIndex + ' ' + conditionIdx);
            const condition = this.branch.conditionGroup[groupIndex].conditions[conditionIdx];
            condition.firstOption = '';
            condition.secondOption = '';
            condition.thirdOption = '';
            condition.inputVariable = false;
            const firstOptions = this.firstOptionsSet[v];
            if (firstOptions)
                condition.firstOptions = firstOptions;
            else
                condition.firstOptions = [];
            // this.secondOptions.splice(0, this.secondOptions.length);
            condition.secondOptions = this.secondOptionsSet[v];
            if (condition.secondOptions.length == 1)
                condition.secondOption = condition.secondOptions[0];
            // console.log(secondOptions);
            const thirdOptions = this.thirdOptionsSet[v];
            if (thirdOptions)
                condition.thirdOptions = thirdOptions;
            else
                condition.thirdOptions = [];
        },
        selectSecondOption(groupIndex, conditionIndex, item) {
            console.log(item.inputType);
            this.branch.conditionGroup[groupIndex].conditions[conditionIndex].inputVariable = item.inputType == 1;
        },
        addContidion(conditionGroup) {
            conditionGroup.conditions.push(cloneObj(this.defaultCondition));
        },
        addConditionGroup() {
            this.branch.conditionGroup.push(cloneObj(this.defaultConditionGroup));
            // for (let i in this.firstOptions) {
            //     console.log(i);
            //     const d = this.firstOptions[i];
            //     if (d.label === v) {
            //         console.log(d.values);
            //         if (d.values == null)
            //             this.showCompareOptions(i);
            //         else
            //             this.toBeComparedOptions = d.values;
            //         break;
            //     }
            // }
        },
    }
});
</script>
<style scoped>
.nodeBox {
    border: 2px #0000000e solid;
    height: 100%;
    width: 100%;
    background-color: white;
}

.nodeTitle {
    background-color: chartreuse;
}

.optionWidth {
    width: 110px;
}
</style>
<template>
    <div class="nodeBox">
        <div ref="nodeName" class="nodeTitle">{{ formData.name }}</div>
        <div ref="nodeAnswer">{{ formData.text }}</div>
        <teleport to="#modal-container">
            <el-dialog v-model="branchSetFormVisible" :title="formData.name" width="60%">
                <el-form :model="branch" ref="branch" :rules="branchFormValidators">
                    <el-form-item label="条件名称" :label-width="formLabelWidth" prop="name">
                        <el-input v-model="branch.name" autocomplete="off" minlength="1" maxlength="15" />
                    </el-form-item>
                    <el-form-item v-for="(g, groupIndex) in branch.conditionGroup" :key="groupIndex" label="条件类型"
                        :label-width="formLabelWidth">
                        <el-row v-for="(c, index) in g.conditions" :key="index">
                            <el-select v-model="c.type" placeholder="请选择条件类型"
                                @change="(v) => showOptions(v, groupIndex, index)" class="optionWidth">
                                <el-option v-for="item in conditionTypes" :key="item.label" :label="item.label"
                                    :value="item.value" />
                            </el-select>
                            <el-select v-model="c.firstOption" placeholder="请选择被比较数据"
                                :style="c.firstOptions.length > 0 ? 'display:block' : 'display:none'" class="optionWidth">
                                <el-option v-for="item in c.firstOptions" :key="item.label" :label="item.label"
                                    :value="item.value" />
                            </el-select>
                            <el-select v-model="c.secondOption" placeholder="请选择比较类型"
                                :style="c.secondOptions.length > 0 ? 'display:block' : 'display:none'" class="optionWidth">
                                <el-option v-for="item in c.secondOptions" :key="item.label" :label="item.label"
                                    :value="item.value" @click.native="selectSecondOption(groupIndex, index, item)" />
                            </el-select>
                            <el-select v-model="c.thirdOption" placeholder="请选择比较的值"
                                :style="c.thirdOptions.length > 0 ? 'display:block' : 'display:none'" class="optionWidth">
                                <el-option v-for="item in c.thirdOptions" :key="item.label" :label="item.label"
                                    :value="item.value" />
                            </el-select>
                            <el-input v-model="c.compareToValue" class="optionWidth"
                                :style="c.inputVariable ? 'display:block' : 'display:none'" />
                            <el-button type="primary" @click="addContidion(g)">
                                <el-icon>
                                    <Plus />
                                </el-icon>
                                "与"条件
                            </el-button>
                            <el-button type="danger" :style="g.conditions.length > 1 ? 'display:block' : 'display:none'"
                                @click="g.conditions.splice(index, 1);">
                                <el-icon>
                                    <Minus />
                                </el-icon>
                            </el-button>
                        </el-row>
                    </el-form-item>
                    <el-form-item label="" :label-width="formLabelWidth">
                        <el-button type="primary" @click="addConditionGroup()">
                            <el-icon>
                                <Plus />
                            </el-icon>
                            添加"或"条件
                        </el-button>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button type="danger" :disabled="editConditionIndex == -1"
                            v-on:click="removeBranch(editConditionIndex)">删除</el-button>
                        <el-button v-on:click="hideBranchForm()">取消</el-button>
                        <el-button type="primary" @click="saveBranch()">
                            保存
                        </el-button>
                    </span>
                </template>
            </el-dialog>
            <el-drawer v-model="nodeSetFormVisible" :title="formData.name" direction="rtl">
                <el-form :model="formData">
                    <el-form-item label="节点名称" :label-width="formLabelWidth">
                        <el-input v-model="formData.name" autocomplete="off" />
                    </el-form-item>
                    <el-form-item label="节点答案" :label-width="formLabelWidth">
                        <el-input v-model="formData.text" type="textarea" />
                    </el-form-item>
                    <el-form-item label="添加条件" :label-width="formLabelWidth">
                        <el-button type="primary" @click="addNewBranch()">
                            <el-icon>
                                <Plus />
                            </el-icon>
                        </el-button>
                        <el-button v-for="(btn, index) in formData.branches" :key="index" type="primary"
                            @click="editBranch(index)">{{ btn.name }}</el-button>
                    </el-form-item>
                </el-form>
                <div class="demo-drawer__footer">
                    <el-button @click="this.hideForm()">取消</el-button>
                    <el-button type="primary" :loading="loading" @click="saveForm()">保存</el-button>
                </div>
            </el-drawer>
        </teleport>
    </div>
</template>
