<script>
// import bootstrap from 'bootstrap/dist/js/bootstrap.js';
import { defineComponent, watch, nextTick } from "vue";
// import { ElMessageBox } from 'element-plus'
import { copyProperties, getDefaultBranch, httpReq } from '../../../assets/tools.js'
import { useI18n } from 'vue-i18n'
import EpPlus from '~icons/ep/plus'
import EpWarning from '~icons/ep/warning'
// import {
//     // necessary extensions
//     Doc,
//     Text,
//     Paragraph,
//     //________________________
//     Color,
//     Heading,
//     FontSize,
//     Bold,
//     Underline,
//     Italic,
//     Strike,
//     BulletList,
//     OrderedList,
//     Link,
//     Table,
//     Image,
//     TaskList,
//     TextAlign,
//     FormatClear,
//     HorizontalRule,
// } from 'element-tiptap-vue3-fixed';
// import EleTipTap from './EleTipTap.vue'

export default defineComponent({
    name: "DialogNode",
    setup() {
        const { t, tm, rt } = useI18n();
        return { t, tm, rt };
    },
    inject: ["getGraph", "getNode"],
    data() {
        return {
            preview: '',
            nodeSetFormVisible: false,
            varDialogVisible: false,
            formLabelWidth: '90px',
            vars: [],
            selectedVar: '',
            nodeData: {
                nodeName: this.t('lang.dialogNode.nodeName'),
                dialogText: '',
                branches: [],
                nextStep: 'WaitUserResponse',
                valid: false,
                invalidMessages: [],
                newNode: true,
            },
            nextSteps: [{ label: this.tm('lang.dialogNode.nextSteps')[0], value: 'WaitUserResponse' }, { label: this.tm('lang.dialogNode.nextSteps')[1], value: 'GotoNextNode' }],
            loading: false,
            lastEditRange: null,
            textEditor: '1',
            // extensions: [
            //     Color,
            //     Doc,
            //     Text,
            //     Paragraph,
            //     Heading.configure({ level: 5 }),
            //     FontSize,
            //     Bold.configure({ bubble: true }), // render command-button in bubble menu.
            //     Underline.configure({ bubble: true, menubar: false }), // render command-button in bubble menu but not in menubar.
            //     Italic,
            //     Strike,
            //     BulletList,
            //     OrderedList,
            //     Link,
            //     Table,
            //     Image,
            //     TaskList,
            //     TextAlign,
            //     FormatClear,
            //     HorizontalRule,
            // ],
        };
    },
    mounted() {
        // console.log('mounted dialognode')
        const node = this.getNode();
        const data = node.getData();
        // console.log(data);
        // console.log(this.nodeData);
        copyProperties(data, this.nodeData);
        this.setPreview();
        // console.log(this.nodeData);
        // if (data) {
        //     console.log(data);
        //     console.log(data.newNode);
        //     if (data.nodeName)
        //         this.nodeData.nodeName = data.nodeName;
        //     this.nodeData.dialogText = data.dialogText;
        //     if (data.nextStep)
        //         this.nodeData.nextStep = data.nextStep;
        //     if (data.newNode)
        //         this.nodeData.newNode = data.newNode;
        // }
        // console.log(node.getData().dialogText);
        if (this.nodeData.newNode) {
            this.nodeData.nodeName += data.nodeCnt.toString();
            this.nodeData.branches.push(getDefaultBranch());
            const heightOffset = this.$refs.nodeName.offsetHeight + this.$refs.nodeAnswer.offsetHeight + 20;
            const x = this.$refs.nodeName.offsetWidth - 15;
            this.getNode().addPort({
                group: 'absolute',
                args: { x: x, y: heightOffset },
                markup: [
                    { tagName: "circle", selector: "bopdy" },
                    { tagName: "rect", selector: "bg" }
                ],
                attrs: {
                    text: {
                        text: this.nextSteps[0].label,
                        fontSize: 12,
                    },
                    // https://codesandbox.io/s/port-label-viwnos?file=/src/App.tsx
                    bg: {
                        ref: "text",
                        refWidth: "100%",
                        refHeight: "110%",
                        refX: "-100%",
                        refX2: -15,
                        refY: -5,
                        fill: "rgb(235,238,245)"
                    }
                },
            });
            this.nodeData.newNode = false;
            node.setData(this.nodeData, { silent: false });
        }
        this.validate();
        node.on("change:data", ({ current }) => {
            // console.log(current);
            // const { name, text, nodeSetFormVisible } = current;
            this.nodeSetFormVisible = true;
            // delete current.dataInit;
        });
        nextTick(() => {
            this.setPortPos();
        })
    },
    methods: {
        hideForm() {
            // const { nodeSetFormVisible } = this.getNode().getData();
            // console.log(this.getNode().getData());
            this.nodeSetFormVisible = false;
        },
        validate() {
            const d = this.nodeData;
            const m = d.invalidMessages;
            m.splice(0, m.length);
            if (!d.nodeName)
                m.push(this.tm('lang.dialogNode.errors')[0]);
            if (d.dialogText.length < 1)
                m.push(this.tm('lang.dialogNode.errors')[1]);
            if (d.dialogText.length > 200)
                m.push(this.tm('lang.dialogNode.errors')[2]);
            d.valid = m.length == 0;
        },
        getTextWidth() {
            // let twts = document.getElementById('_twts');
            // if (!twts) {
            //     twts = document.createElement("span");
            //     twts.setAttribute("id", '_twts');
            //     twts.style.whiteSpace = 'no-wrap';
            //     twts.style.visibility = 'hidden';
            //     document.body.appendChild(twts);
            // }
            // twts.innerText = t;
            // return Math.ceil(twts.offsetWidth)
            // console.log(this.$refs.nodeAnswer.scrollWidth)
            return this.$refs.nodeAnswer.offsetWidth
        },
        setPreview() {
            let p = this.nodeData.dialogText.replace(/<[^>]+>/g, '').replace(/\r/g, '');
            if (p) {
                const array = p.split('\n');
                // console.log(array.splice(3, array.length - 3))
                if (array.length > 3) {
                    array.splice(3, array.length - 3, '......')
                }
                const node = this.getNode();
                // console.log(node.size().width)
                // console.log(this.getTextWidth())
                // console.log(this.$refs.nodeAnswer.getBoundingClientRect())
                array.forEach(function (item, idx, arr) {
                    if (this.$refs.nodeAnswer.getBoundingClientRect().width > node.size().width) {
                        const shortPercent = (this.$refs.nodeAnswer.scrollWidth - node.size().width) / node.size().width;
                        // console.log(shortPercent)
                        // console.log(shortPercent * item.length)
                        console.log(Math.floor(shortPercent * item.length))
                        arr[idx] = item.substring(0, Math.floor(shortPercent * item.length) - 5) + "...";
                    }
                    // if (item.length > 20)
                    //     arr[idx] = item.substring(0, 20) + "...";
                }, this);
                p = array.join('\n');
                nextTick(() => {
                    this.setPortPos();
                })
            }
            this.preview = p;
        },
        setPortPos() {
            const node = this.getNode();
            const port = node.getPortAt(0);
            const heightOffset = this.$refs.nodeName.offsetHeight + this.$refs.nodeAnswer.offsetHeight + 20;
            // console.log(heightOffset);
            node.setPortProp(port.id, ['args', 'y'], heightOffset);
            node.resize(node.size().width, 20 + heightOffset, { direction: 'bottom' })
        },
        saveForm() {
            let text = '';
            for (let i = 0; i < this.nextSteps.length; i++) {
                if (this.nodeData.nextStep == this.nextSteps[i].value) {
                    text = this.nextSteps[i].label;
                    break;
                }
            }
            this.setPortPos();
            const node = this.getNode();
            const port = node.getPortAt(0);
            node.setPortProp(port.id, ['attrs', 'text', 'text'], text);
            // this.nodeData.dialogText = this.$refs.textArea.innerText;
            const branch = this.nodeData.branches[0];
            branch.branchName = text;
            branch.branchId = port.id;
            this.validate();
            this.setPreview();
            // console.log(this.preview);
            node.setData(this.nodeData, { silent: false });
            this.hideForm();
            // console.log(node.getData());
        },
        getSel() {
            const sel = window.getSelection();
            // console.log(sel, sel.rangeCount, 'sel')
            if (sel.rangeCount > 0) {
                this.lastEditRange = sel.getRangeAt(0);
                // console.log(this.lastEditRange);
            }
        },
        async showVarsForm() {
            let t = await httpReq('GET', 'variable', null, null, null);
            // console.log(t);
            if (t && t.status == 200 && t.data) {
                this.vars = t.data;
            }
            this.varDialogVisible = true;
        },
        insertVar() {
            this.nodeData.dialogText += '`' + this.selectedVar + '`';
            /*
            const t = this.$refs.textArea;
            // console.log(t);
            t.focus();
            let sel = window.getSelection();
            if (this.lastEditRange) {
                sel.removeAllRanges();
                sel.addRange(this.lastEditRange);
                const range = sel.getRangeAt(0);
                // console.log(range);
                range.insertNode(document.createTextNode('`' + this.selectedVar + '`'));
                range.collapse(false)
                this.lastEditRange = sel.getRangeAt(0);
            } else {
                this.nodeData.dialogText += '`' + this.selectedVar + '`';
                // selection.selectAllChildren(t.value);
                // selection.collapseToEnd()
            }
            */
            this.varDialogVisible = false;
        },
        changeEditorNote() {
            // console.log('this.nodeData.dialogText=' + this.nodeData.dialogText)
            // console.log('this.textEditor='+this.textEditor)
            if (this.nodeData.dialogText) {
                if (this.textEditor == '1') {
                    ElMessageBox.confirm(
                        'Switch to plain text and all styles will be lost. Whether to continue?',
                        'Warning',
                        {
                            confirmButtonText: 'OK',
                            cancelButtonText: 'Cancel',
                            type: 'warning',
                        }
                    )
                        .then(() => {
                            const c = this.nodeData.dialogText.replace(/<\/p>/g, '\n').trim();
                            const regex = /(<([^>]+)>)/ig;
                            this.nodeData.dialogText = c.replace(regex, '');
                        })
                        .catch(() => {
                            this.textEditor = '2';
                        })
                } else {
                    const c = '<p>' + this.nodeData.dialogText.replace(/\n/g, '</p><p>') + '</p>';
                    // console.log(c);
                    this.$refs.editor.setContent(c);
                }
            }
        },
        // editorCallback(s) {
        //     console.log('callback=' + s);
        // },
    },
    components: {
        EpPlus,
        EpWarning,
        //     EleTipTap,
    },
});
/*
watch(this.nodeData.dialogText, async (newT, oldT) => {
    if (newT != oldT) {
        this.preview = newT.replace(/<[^>]+>/g, '');
    }
    // if (newQuestion.indexOf('?') > -1) {
    //     answer.value = 'Thinking...'
    //     try {
    //         const res = await fetch('https://yesno.wtf/api')
    //         answer.value = (await res.json()).answer
    //     } catch (error) {
    //         answer.value = 'Error! Could not reach the API. ' + error
    //     }
    // }
})
*/
</script>
<style scoped>
.nodeBox {
    border: 2px #0000000e solid;
    height: 100%;
    width: 100%;
    background-color: white;
    overflow: hidden;
}

.nodeTitle {
    background-color: rgb(255, 196, 0);
    color: white;
    font-weight: 500;
    font-size: 14px;
    padding: 5px;
}

/* .optionWidth {
    width: 110px;
} */

/* .divInputBox {
    height: 100px;
    width: 100%;
    padding: 5px;
    overflow-y: auto;
    border: 1px solid #000;
    line-height: 150%;
} */
    /* box-shadow: 0 0 5px 5px rgba(0, 0, 0, 0.28); */
</style>
<template>
    <div class="nodeBox">
        <div ref="nodeName" class="nodeTitle">
            {{ nodeData.nodeName }}
            <span v-show="nodeData.invalidMessages.length > 0">
                <el-tooltip class="box-item" effect="dark" :content="nodeData.invalidMessages.join('<br/>')"
                    placement="bottom" raw-content>
                    <el-icon color="red" size="16">
                        <EpWarning />
                    </el-icon>
                </el-tooltip>
            </span>
        </div>
        <div ref="nodeAnswer" style="white-space: pre-wrap;font-size:12px;">{{ preview }}</div>
        <!-- <el-text ref="nodeAnswer" line-clamp="2">
            {{ preview }}
        </el-text> -->
        <!-- <el-text truncated ref="nodeAnswer">{{ nodeData.dialogText }}</el-text> -->
        <!-- <teleport to="#modal-container"> -->
        <!-- <teleport to="body"> -->
            <el-drawer v-model="nodeSetFormVisible" :title="nodeData.nodeName" direction="rtl" size="72%" :append-to-body="true" :destroy-on-close="true">
                <el-form :model="nodeData">
                    <el-form-item :label="t('lang.common.nodeName')" :label-width="formLabelWidth">
                        <el-input v-model="nodeData.nodeName" autocomplete="off" />
                    </el-form-item>
                    <el-form-item :label="t('lang.dialogNode.form.label')" :label-width="formLabelWidth">
                        <!-- <el-radio-group v-model="textEditor" class="ml-4" @change="changeEditorNote">
                            <el-radio label="1">Plain text</el-radio>
                            <el-radio label="2">Rich text</el-radio>
                        </el-radio-group> -->
                        <el-input v-show="textEditor == '1'" ref="textArea" v-model="nodeData.dialogText" type="textarea"
                            @blur="getSel" />
                        <!-- <div v-show="textEditor == '1'" ref="textArea" v-text="nodeData.dialogText" class="divInputBox"
                            contenteditable="true" @blur="getSel"></div> -->
                        <!-- <EleTipTap v-show="textEditor == '2'" :editorText="nodeData.dialogText" @updatedEditorText="editorCallback" /> -->
                        <!-- Current using follow one -->
                        <!-- <el-tiptap ref="editor" v-show="textEditor == '2'" v-model:content="nodeData.dialogText"
                            :extensions="extensions" /> -->
                    </el-form-item>
                    <el-form-item label="" :label-width="formLabelWidth">
                        <el-button link @click="showVarsForm">
                            <el-icon>
                                <EpPlus />
                            </el-icon>
                            {{ t('lang.dialogNode.form.addVar') }}
                        </el-button>
                    </el-form-item>
                    <el-form-item :label="t('lang.dialogNode.form.nextStep')" :label-width="formLabelWidth">
                        <el-select v-model="nodeData.nextStep" :placeholder="t('lang.dialogNode.form.choose')">
                            <el-option v-for="item in nextSteps" :key="item.label" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>
                </el-form>
                <div class="demo-drawer__footer">
                    <el-button type="primary" :loading="loading" @click="saveForm()">{{ t('lang.common.save') }}</el-button>
                    <el-button @click="hideForm()">{{ t('lang.common.cancel') }}</el-button>
                </div>
            </el-drawer>
            <el-dialog v-model="varDialogVisible" :title="t('lang.dialogNode.var.title')" width="30%" :append-to-body="true" :destroy-on-close="true">
                <el-select v-model="selectedVar" class="m-2" :placeholder="t('lang.dialogNode.var.choose')" size="large">
                    <el-option v-for="item in vars" :key="item.varName" :label="item.varName" :value="item.varName" />
                </el-select>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button type="primary" @click="insertVar">
                            {{ t('lang.common.insert') }}
                        </el-button>
                        <el-button @click="varDialogVisible = false">{{ t('lang.common.cancel') }}</el-button>
                    </span>
                </template>
            </el-dialog>
        <!-- </teleport> -->
    </div>
</template>
