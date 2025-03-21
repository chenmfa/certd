<template>
  <a-layout class="fs-framework">
    <a-layout-sider v-model:collapsed="asideCollapsed" :trigger="null" collapsible>
      <div class="header-logo">
        <img :src="siteInfo.logo" />
        <span v-if="!asideCollapsed" class="title">{{ siteInfo.title }}</span>
      </div>
      <div class="aside-menu">
        <fs-menu :scroll="true" :menus="asideMenus" :expand-selected="!asideCollapsed" />
      </div>
    </a-layout-sider>

    <a-layout class="layout-body">
      <a-layout-header class="header">
        <div class="header-left header-buttons">
          <div class="menu-fold" @click="asideCollapsedToggle">
            <MenuUnfoldOutlined v-if="asideCollapsed" />
            <MenuFoldOutlined v-else />
          </div>
          <!--          <fs-menu class="header-menu" mode="horizontal" :expand-selected="false" :selectable="false" :menus="frameworkMenus" />-->
          <div
            v-for="menu of resourceStore.authedTopMenus"
            class="top-menu flex-center header-btn"
            :class="{ current: resourceStore.currentTopMenu === menu }"
            :style="{ color: resourceStore.currentTopMenu === menu ? token.colorPrimary : '' }"
            @click="menuClick(menu)"
          >
            <fs-icon :icon="menu.meta.icon"></fs-icon>
            <span class="ml-5">{{ menu.title }} </span>
          </div>
          <tutorial-button v-if="!settingStore.isComm" class="flex-center header-btn" />
          <vip-button class="flex-center header-btn" mode="nav" />
        </div>
        <div class="header-right header-buttons">
          <!--          <button-->
          <!--            w:bg="blue-400 hover:blue-500 dark:blue-500 dark:hover:blue-600"-->
          <!--            w:text="sm white"-->
          <!--            w:font="mono light"-->
          <!--            w:p="y-2 x-4"-->
          <!--            w:border="2 rounded blue-200"-->
          <!--          >-->
          <!--            Button-->
          <!--          </button>-->
          <fs-menu class="header-menu" mode="horizontal" :expand-selected="false" :selectable="false" :menus="settingStore.getHeaderMenus" />

          <fs-menu
            v-if="!settingStore?.isAgent && !settingStore.isComm"
            class="header-menu"
            mode="horizontal"
            :expand-selected="false"
            :selectable="false"
            :menus="headerMenus"
          />
          <div class="header-btn">
            <fs-locale />
          </div>
          <!--          <div class="header-btn">-->
          <!--            <fs-theme-mode-set />-->
          <!--          </div>-->
          <div class="header-btn">
            <fs-theme-set />
          </div>
          <div class="header-btn">
            <fs-user-info />
          </div>
        </div>
      </a-layout-header>
      <fs-tabs></fs-tabs>
      <a-layout-content class="fs-framework-content">
        <router-view>
          <template #default="{ Component, route }">
            <transition name="fade-transverse">
              <keep-alive :include="keepAlive">
                <component :is="Component" :key="route.fullPath" />
              </keep-alive>
            </transition>
          </template>
        </router-view>
      </a-layout-content>
      <a-layout-footer class="fs-framework-footer">
        <div>
          <span v-if="!settingStore.isComm">
            <span>Powered by</span>
            <a> handsfree.work </a>
          </span>

          <template v-if="siteInfo.licenseTo">
            <a-divider type="vertical" />
            <a :href="siteInfo.licenseToUrl || ''">{{ siteInfo.licenseTo }}</a>
          </template>

          <template v-if="sysPublic.icpNo">
            <a-divider type="vertical" />
            <span>
              <a href="https://beian.miit.gov.cn/" target="_blank">{{ sysPublic.icpNo }}</a>
            </span>
          </template>
        </div>
        <div>v{{ version }}</div>

        <!--        <fs-source-link />-->
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script lang="ts" setup>
import { computed, onErrorCaptured, onMounted, ref } from "vue";
import FsMenu from "./components/menu/index.jsx";
import FsLocale from "./components/locale/index.vue";
import FsUserInfo from "./components/user-info/index.vue";
import FsTabs from "./components/tabs/index.vue";
import { useResourceStore } from "../store/modules/resource";
import { usePageStore } from "/@/store/modules/page";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons-vue";
import FsThemeSet from "/@/layout/components/theme/index.vue";
import { env } from "../utils/util.env";
import VipButton from "/@/components/vip-button/index.vue";
import TutorialButton from "/@/components/tutorial/index.vue";
import { useUserStore } from "/@/store/modules/user";
import { useSettingStore } from "/@/store/modules/settings";
import { routerUtils } from "/@/utils/util.router";
import { theme } from "ant-design-vue";

const resourceStore = useResourceStore();
const frameworkMenus = computed(() => {
  return resourceStore.getFrameworkMenus;
});
const headerMenus = computed(() => {
  return resourceStore.getHeaderMenus;
});
const asideMenus = computed(() => {
  return resourceStore.getAsideMenus;
});

const pageStore = usePageStore();
const keepAlive = pageStore.keepAlive;

const asideCollapsed = ref(false);
function asideCollapsedToggle() {
  asideCollapsed.value = !asideCollapsed.value;
}
onErrorCaptured((e) => {
  console.error("ErrorCaptured:", e);
  // notification.error({ message: e.message });
  //阻止错误向上传递
  return false;
});
const version = ref(import.meta.env.VITE_APP_VERSION);

const envRef = ref(env);

const userStore = useUserStore();

const settingStore = useSettingStore();

const sysPublic = computed(() => {
  return settingStore.sysPublic;
});
const siteInfo = computed(() => {
  return settingStore.siteInfo;
});

onMounted(async () => {
  await settingStore.checkUrlBound();
});

function menuClick(menu: any) {
  routerUtils.open(menu.path);
}

const { useToken } = theme;
const { token } = useToken();
</script>
<style lang="less">
@import "../style/theme/index.less";
.fs-framework {
  height: 100%;
  overflow-x: hidden;
  min-width: 1200px;
  .menu-fold {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .header-logo {
    width: 100%;
    height: 50px;
    display: flex;
    justify-items: center;
    align-items: center;
    justify-content: center;

    // margin: 16px 24px 16px 0;
    //background: rgba(255, 255, 255, 0.3);
    img {
      height: 80%;
    }
    .title {
      margin-left: 5px;
      font-weight: bold;
    }
  }
  .fs-framework-content {
    flex: 1;
    border-left: 1px solid #f0f0f0;
  }
  .fs-framework-footer {
    border-left: 1px solid #f0f0f0;
    padding: 10px 20px;
    color: rgba(0, 0, 0, 0.85);
    font-size: 14px;
    background: #f6f6f6;
    display: flex;
    justify-content: space-between;

    > div {
      height: auto;
      padding: 5px;
    }
  }

  .ant-layout-header.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .header-buttons {
      display: flex;
      align-items: center;
      & > * {
        cursor: pointer;
        padding: 0 15px;
      }
      height: 100%;

      & > .header-btn {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        //border-bottom: 1px solid rgba(255, 255, 255, 0);
        &:hover {
          background-color: rgba(0, 0, 0, 0.06);
        }
        &.current {
          //color: #1890ff;
          //background-color: hsla(0, 0%, 100%, 0.5) !important;
        }
      }
    }
    .header-right {
      justify-content: flex-end;
      align-items: center;
      display: flex;
      flex: 1;
    }
  }

  .aside-menu {
    flex: 1;
    ui {
      height: 100%;
    }
    overflow: hidden;
    // overflow-y: auto;
  }

  .layout-body {
    flex: 1;
  }
}
//antdv
.fs-framework {
  &.ant-layout {
    flex-direction: row;
  }

  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
  }

  .ant-layout-sider {
    // border-right: 1px solid #eee;
  }

  .ant-layout-header {
    height: 50px;
    padding: 0 10px;
    line-height: 50px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
  .ant-layout-content {
    background: #fff;
    height: 100%;
    position: relative;
  }
}
//element
.fs-framework {
  .el-aside {
    .el-menu {
      height: 100%;
    }
  }
}
</style>
