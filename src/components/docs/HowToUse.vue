<script setup>
import SolarDocumentTextLinear from '~icons/solar/document-text-linear'</script>
<style scoped>
.mid {
  justify-content: center;
  align-items: center;
  vertical-align: middle;
}

.black-line {
  height: 6px;
  background-color: black;
}
</style>
<template>
  <el-row class="mid" id="howToUse">
    <el-col :span="8">
      <div class="black-line"></div>
    </el-col>
    <el-col :span="4">
      <h1 style="text-align: center;">How to use</h1>
    </el-col>
    <el-col :span="8">
      <div class="black-line"></div>
    </el-col>
  </el-row>
  <el-timeline>
    <el-timeline-item timestamp="#1" placement="top">
      <el-card>
        <div class="title">Click the "Get started" button on the homepage</div>
        <p>
          <img src="../../assets/step1.png" />
        </p>
        <div class="description">
          To enter the "Guide" page
        </div>
      </el-card>
    </el-timeline-item>
    <el-timeline-item timestamp="#2" placement="top">
      <el-card>
        <div class="title">On the "Guide" page, click on the button in the image below to go to the main flows management page.</div>
        <p>
          <img src="../../assets/step2.png" />
        </p>
        <div class="description">One dialog flow contains many main flows which contains many sub flows.</div>
      </el-card>
    </el-timeline-item>
    <el-timeline-item timestamp="#3" placement="top">
      <el-card>
        <div class="title">Create a main flow if there's none.</div>
        <p>
          <img src="../../assets/step3.png" />
        </p>
        <div class="description">Here give a name to main flow, you can change the name anytime.</div>
      </el-card>
    </el-timeline-item>
    <el-timeline-item timestamp="#4" placement="top">
      <el-card>
        <div class="title">Create dialog flow</div>
        <p>
          <img src="../../assets/step4.png" /><br />
          <img src="../../assets/step5.png" />
        </p>
        <div class="description">On the left, you can add sub-flow.</div>
      </el-card>
    </el-timeline-item>
    <el-timeline-item timestamp="#5" placement="top">
      <el-card>
        <div class="title">Edit dialog flow</div>
        <p>
          <img src="../../assets/step6.png" /><br />
          <img src="../../assets/step7.png" />
        </p>
        <div class="description">You can drag and drop flow node. Double-click on one node, will popup detail setting.
        </div>
      </el-card>
    </el-timeline-item>
    <el-timeline-item timestamp="#6" placement="top">
      <el-card>
        <div class="title">Test dialog flow</div>
        <p>
          <img src="../../assets/step8.png" /><br />
          <img src="../../assets/step9.png" />
        </p>
        <div class="description">1. Save current sub-flow 2. Release main flow (All sub-flows only need one click) 3. Test
          it</div>
      </el-card>
    </el-timeline-item>
    <el-timeline-item timestamp="#7" placement="top">
      <el-card>
        <div class="title">Integrate to your application</div>
        <p>
          <el-icon>
            <SolarDocumentTextLinear />
          </el-icon>
          Checkout <router-link to="/docs">requet API doc</router-link>
        </p>
        <div class="description"></div>
      </el-card>
    </el-timeline-item>
  </el-timeline>
</template>