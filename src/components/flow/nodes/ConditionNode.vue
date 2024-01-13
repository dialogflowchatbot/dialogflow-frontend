<script setup>
import { cloneObj, copyProperties, getDefaultBranch, httpReq } from '../../../assets/tools.js'
import { inject, reactive, ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n'
const { t, tm, rt } = useI18n();
const getNode = inject('getNode');
const nodeSetFormVisible = ref(false);
const branchSetFormVisible = ref(false);
const formLabelWidth = '110px';
const defaultCondition = getDefaultBranch().conditionGroup[0][0];
defaultCondition.refOptions = [];
defaultCondition.compareOptions = [];
defaultCondition.targetOptions = [];
defaultCondition.inputVariable = false;
const fallbackBranch = getDefaultBranch();
fallbackBranch.branchName = t('lang.common.else');
fallbackBranch.branchType = 'GotoAnotherNode';
fallbackBranch.editable = false;
// const defaultCondition = {
//     conditionType: '',
//     refChoice: '', compareType: '', targetChoice: '',
//     refOptions: [], compareOptions: [], targetOptions: [],
//     targetValue: '',
//     inputVariable: false,
// };
const defaultConditionGroup = [[]];
const types18 = tm('lang.conditionNode.types')
const conditionTypes = [
    { label: types18[0], value: 'UserIntent' },
    { label: types18[1], value: 'UserInput' },
    { label: types18[2], value: 'FlowVariable' },
];
const refOptionsSet = {
    "FlowVariable": [],
};
const compares18 = tm('lang.conditionNode.compares')
const compareOptionsSet = {
    "UserIntent": [{ label: compares18[0], value: 'Eq', inputType: 0 }],
    "UserInput": [{ label: compares18[0], value: 'Eq', inputType: 1 }, { label: compares18[2], value: 'Contains', inputType: 1 }, { label: compares18[3], value: 'Timeout', inputType: 0 }],
    "FlowVariable": [
        { label: 'Has value', value: 'HasValue', inputType: 0, belongsTo: 'StrNum' },
        { label: 'Does not have value', value: 'DoesNotHaveValue', inputType: 0, belongsTo: 'StrNum' },
        { label: 'Is empty string', value: 'EmptyString', inputType: 0, belongsTo: 'Str' },
        { label: compares18[0], value: 'Eq', inputType: 1, belongsTo: 'StrNum' },
        { label: compares18[1], value: 'NotEq', inputType: 1, belongsTo: 'StrNum' },
        { label: 'Contains', value: 'Contains', inputType: 1, belongsTo: 'Str' },
        { label: 'Not contains', value: 'NotContains', inputType: 1, belongsTo: 'Str' },
        { label: 'Greater than', value: 'NGT', inputType: 1, belongsTo: 'Num' },
        { label: 'Greater than or equal to', value: 'NGTE', inputType: 1, belongsTo: 'Num' },
        { label: 'Less than', value: 'NLT', inputType: 1, belongsTo: 'Num' },
        { label: 'Less than or equal to', value: 'NLTE', inputType: 1, belongsTo: 'Num' },
    ]
};
const targetOptionsSet = {
    "UserIntent": [],
};
const loading = false;
let editConditionIndex = -1;
const nodeData = reactive({
    nodeName: t('lang.conditionNode.nodeName'),
    branches: [fallbackBranch],
    valid: false,
    invalidMessages: [],
    newNode: true,
});
const _branch = getDefaultBranch();
_branch.conditionGroup = [];
const branch = reactive(_branch);
// const branch = reactive({
//     branchId: '',
//     branchName: '',
//     branchType: 'Condition',
//     conditionGroup: [],
// });
const nodeName = ref();

getNode().on("change:data", ({ current }) => {
    nodeSetFormVisible.value = true;
});
defaultConditionGroup[0].push(cloneObj(defaultCondition));

onMounted(async () => {
    let t = await httpReq('GET', 'intent', null, null, null);
    // console.log(t);
    if (t && t.status == 200 && t.data) {
        const d = targetOptionsSet.UserIntent;
        d.splice(0, d.length);
        t.data.forEach(function (item, index, arr) {
            this.push({ label: item.name, value: item.name });
        }, d);
    }
    t = await httpReq('GET', 'variable', null, null, null);
    // console.log(t);
    if (t && t.status == 200 && t.data) {
        const d = refOptionsSet.FlowVariable;
        d.splice(0, d.length);
        t.data.forEach(function (item, index, arr) {
            this.push({ label: item.varName, value: item.varName, vtype: item.varType });
        }, d);
    }

    const node = getNode();
    const data = node.getData();
    // console.log(data);
    copyProperties(data, nodeData);
    // console.log(nodeData);
    // if (data) {
    //     if (data.nodeName)
    //         nodeData.nodeName = data.nodeName;
    // if (data.branches)
    //     nodeData.branches = data.branches;
    //     console.log(nodeData.branches);
    // }
    if (nodeData.newNode)
        nodeData.nodeName += data.nodeCnt.toString();
    nodeData.newNode = false;
    validate();
});
const errors18 = tm('lang.conditionNode.errors')
const validateBranchName = (rule, value, callback) => {
    if (value == '')
        callback(new Error(errors18[0]));
    else {
        for (let i = 0; i < nodeData.branches.length; i++) {
            if (nodeData.branches[i].branchName == value) {
                callback(new Error(errors18[1]));
                return;
            }
        }
        callback();
    }
};
const branchValidators = reactive({
    branchName: [{ validator: validateBranchName, trigger: 'blur' }],
});

function validate() {
    const d = nodeData;
    const m = d.invalidMessages;
    m.splice(0, m.length);
    if (!d.nodeName)
        m.push(errors18[2]);
    if (d.branches.length == 0)
        m.push(errors18[3]);
    d.valid = m.length == 0;
}
function addNewBranch() {
    // console.log(branch);
    editConditionIndex = -1;
    branch.branchName = '';
    branch.conditionGroup = cloneObj(defaultConditionGroup);
    branch.conditionGroup[0][0].conditionType = '';
    branch.conditionGroup[0][0].compareType = '';
    branchSetFormVisible.value = true;
}
function hideBranchForm() {
    branchSetFormVisible.value = false;
}
function saveBranch() {
    if (!branch.branchName) {
        ElMessage({
            message: errors18[0],
            type: 'warning',
        });
        return;
    }
    if (editConditionIndex == -1)
        nodeData.branches.unshift(cloneObj(branch));
    hideBranchForm();
}
function editBranch(i) {
    // branch = cloneObj(nodeData.branches[i]);
    // branch = nodeData.branches[i];
    branch.branchName = nodeData.branches[i].branchName;
    branch.conditionGroup = nodeData.branches[i].conditionGroup;
    editConditionIndex = i;
    branchSetFormVisible.value = true;
}
function removeBranch(i) {
    nodeData.branches.splice(i, 1);
    hideBranchForm();
}
function hideForm() {
    // const { nodeSetFormVisible } = .getNode().getData();
    // console.log(getNode().getData());
    nodeSetFormVisible.value = false;
}
function saveForm() {
    let heightOffset = nodeName.value.offsetHeight;
    const node = getNode();
    const len = nodeData.branches.length;
    // let hasFallbackBranch = false;
    // for (let i = 0; i < len; i++) {
    //     if (branch.branchType == 'GotoAnotherNode') {
    //         hasFallbackBranch = true;
    //     }
    // }
    // if (!hasFallbackBranch)
    //     nodeData.branches.push(fallbackBranch);
    const x = nodeName.value.offsetWidth - 15;
    node.removePorts();
    let n;
    for (let i = 0; i < len; i++) {
        heightOffset += 20;
        n = node.addPort({
            group: 'absolute',
            args: { x: x, y: heightOffset },
            attrs: {
                text: {
                    text: nodeData.branches[i].branchName,
                    fontSize: 12,
                },
            },

        });
        nodeData.branches[i].branchId = n.ports.items[i].id;
        // console.log(nodeData.branches[i].branchId);
        if (branch.branchType == 'GotoAnotherNode') {
            hasFallbackBranch = true;
        }
    }
    node.resize(node.size().width, 20 + heightOffset, { direction: 'bottom' })
    validate();
    node.setData(nodeData, { silent: false });
    hideForm();
    // console.log(node.getData());
}
function showOptions(v, groupIndex, conditionIdx) {
    console.log(v + ' ' + groupIndex + ' ' + conditionIdx);
    const condition = branch.conditionGroup[groupIndex][conditionIdx];
    condition.refChoice = '';
    condition.compareType = '';
    condition.targetValueVariant = 'Const';
    condition.targetValue = '';
    condition.inputVariable = false;
    const refOptions = refOptionsSet[v];
    if (refOptions)
        condition.refOptions = refOptions;
    else
        condition.refOptions = [];
    // compareOptions.splice(0, compareOptions.length);
    condition.compareOptions = compareOptionsSet[v];
    if (condition.compareOptions.length == 1)
        condition.compareType = condition.compareOptions[0].value;
    // console.log(compareOptions);
    const targetOptions = targetOptionsSet[v];
    if (targetOptions)
        condition.targetOptions = targetOptions;
    else
        condition.targetOptions = [];
}
function percolateCompareOptions(compareType, groupIndex, conditionIdx, refOption) {
    const condition = branch.conditionGroup[groupIndex][conditionIdx];
    if (condition.compareOptions[0].belongsTo) {
        const selectedVar = refOptionsSet.FlowVariable.filter(function (curValue, index, arr) {
            return curValue.label === refOption;
        });
        // console.log(selectedVar);
        if (selectedVar.length == 1) {
            condition.compareType = '';
            condition.compareOptions = compareOptionsSet[compareType].filter(function (curVar, index, arr) {
                // console.log(curVar.belongsTo);
                // console.log(selectedVar[0].vtype);
                // console.log(curVar.belongsTo.indexOf(selectedVar[0].vtype));
                return curVar.belongsTo.indexOf(selectedVar[0].vtype) > -1;
            });
        }
    }
}
function selectCompareOption(groupIndex, conditionIndex, item) {
    // console.log(item.inputType);
    branch.conditionGroup[groupIndex][conditionIndex].inputVariable = item.inputType == 1;
}
function addContidion(conditionGroup) {
    conditionGroup.push(cloneObj(defaultCondition));
}
function addConditionGroup() {
    // console.log(branch);
    branch.conditionGroup.push(...cloneObj(defaultConditionGroup));
    // console.log(branch);
}
</script>
<style scoped>
.nodeBox {
    border: 2px #0000000e solid;
    height: 100%;
    width: 100%;
    background-color: white;
}

.nodeTitle {
    background-color: rgb(145, 113, 227);
    color: white;
    font-weight: 500;
    font-size: 0.9rem;
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
                        <Warning />
                    </el-icon>
                </el-tooltip>
            </span>
        </div>
        <teleport to="body">
            <el-dialog v-model="branchSetFormVisible" :title="t('lang.conditionNode.newBranch')" width="70%">
                <el-form :model="branch" :rules="branchValidators">
                    <el-form-item :label="t('lang.conditionNode.condName')" :label-width="formLabelWidth" prop="branchName">
                        <el-input v-model="branch.branchName" autocomplete="off" minlength="1" maxlength="15" />
                    </el-form-item>
                    <el-form-item v-for="(g, groupIndex) in branch.conditionGroup" :key="groupIndex"
                        :label="t('lang.conditionNode.condType')" :label-width="formLabelWidth">
                        <el-row v-for="(c, index) in g" :key="index">
                            <el-select v-model="c.conditionType" :placeholder="t('lang.conditionNode.condTypePH')"
                                @change="(v) => showOptions(v, groupIndex, index)" class="optionWidth">
                                <el-option v-for="item in conditionTypes" :key="item.label" :label="item.label"
                                    :value="item.value" />
                            </el-select>
                            <el-select v-model="c.refChoice" :placeholder="t('lang.conditionNode.comparedPH')"
                                v-show="c.refOptions.length > 0" class="optionWidth"
                                @change="(v) => percolateCompareOptions(c.conditionType, groupIndex, index, v)">
                                <el-option v-for="item in c.refOptions" :key="item.label" :label="item.label"
                                    :value="item.value" />
                            </el-select>
                            <el-select v-model="c.compareType" :placeholder="t('lang.conditionNode.compareTypePH')"
                                v-show="c.compareOptions.length > 0" class="optionWidth">
                                <el-option v-for="item in c.compareOptions" :key="item.label" :label="item.label"
                                    :value="item.value" @click.native="selectCompareOption(groupIndex, index, item)" />
                            </el-select>
                            <el-select v-model="c.targetValue" :placeholder="t('lang.conditionNode.targetPH')"
                                v-show="c.targetOptions.length > 0" class="optionWidth">
                                <el-option v-for="item in c.compareOptions" :key="item.label" :label="item.label"
                                    :value="item.value" />
                            </el-select>
                            <el-select v-model="c.targetValueVariant" v-show="c.inputVariable" class="optionWidth">
                                <el-option label="to a const value" value="Const" />
                                <el-option label="to value of a variable" value="Variable" />
                            </el-select>
                            <el-select v-model="c.targetValue" placeholder="Please choose a variable"
                                v-show="c.inputVariable && c.targetValueVariant == 'Variable'" class="optionWidth">
                                <el-option v-for="item in refOptionsSet['FlowVariable']" :key="item.label" :label="item.label"
                                    :value="item.value" />
                            </el-select>
                            <el-input v-model="c.targetValue" class="optionWidth" v-show="c.inputVariable && c.targetValueVariant == 'Const'" />
                            <el-button type="primary" @click="addContidion(g)">
                                <el-icon>
                                    <Plus />
                                </el-icon>
                                {{ t('lang.conditionNode.andCond') }}
                            </el-button>
                            <el-button type="danger" v-show="g.length > 1" @click="g.splice(index, 1);">
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
                            {{ t('lang.conditionNode.orCond') }}
                        </el-button>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button type="primary" @click="saveBranch()">
                            {{ t('lang.common.save') }}
                        </el-button>
                        <el-button v-on:click="hideBranchForm()">{{ t('lang.common.cancel') }}</el-button>
                        <el-button type="danger" :disabled="editConditionIndex == -1"
                            v-on:click="removeBranch(editConditionIndex)">{{ t('lang.common.del') }}</el-button>
                    </span>
                </template>
            </el-dialog>
            <el-drawer v-model="nodeSetFormVisible" :title="nodeData.nodeName" direction="rtl" size="70%">
                <el-form :model="nodeData">
                    <el-form-item :label="t('lang.common.nodeName')" :label-width="formLabelWidth">
                        <el-input v-model="nodeData.nodeName" autocomplete="off" />
                    </el-form-item>
                    <el-form-item :label="t('lang.conditionNode.newCond')" :label-width="formLabelWidth">
                        <el-button type="primary" @click="addNewBranch()">
                            <el-icon>
                                <Plus />
                            </el-icon>
                        </el-button>
                        <el-button v-for="(btn, index) in nodeData.branches" :key="index" type="primary"
                            @click="editBranch(index)" :disabled="!btn.editable">{{ btn.branchName }}</el-button>
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