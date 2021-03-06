<template>
    <!--
           el-tabs 用于显示标签页，
           其中：
               v-model 绑定当前选中的 标签
               :closable = true 表示当前标签可以关闭
               @tab-click 绑定标签选中事件
               @tab-remove 绑定标签删除事件
       -->
    <el-tabs v-model="mainTabsActiveName" class="tab" :closable="true" @tab-click="selectedTabHandle" @tab-remove="removeTabHandle">
        <!-- 循环遍历标签数组，用于生成标签列表 -->
        <el-tab-pane v-for="item in mainTabs" :key="item.name" :label="item.name" :name="item.name">
            <el-card class="card" shadow="hover">
                <!-- 以 http 或者 https 开头的地址，均使用 iframe 进行展示 -->
                <iframe v-if="item.type === 'iframe'" :src="item.iframeUrl" width="100%" height="650px" frameborder="0" scrolling="yes">
                </iframe>
                <!-- 自身组件模块路由跳转，使用 router-view 表示 -->
                <keep-alive v-else>
                    <router-view v-if="item.name === mainTabsActiveName" />
                </keep-alive>
            </el-card>
        </el-tab-pane>
        <!-- 定义下拉框，用于操作标签列表 -->
        <el-dropdown class="dropdown-tool" :show-timeout="0">
            <i class="el-icon-arrow-down"></i>
            <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="closeCurrentTabsHandle">{{$t("tab.closeCurrentTabs")}}</el-dropdown-item>
                <el-dropdown-item @click.native="closeOtherTabsHandle">{{$t("tab.closeOtherTabs")}}</el-dropdown-item>
                <el-dropdown-item @click.native="closeAllTabsHandle">{{$t("tab.closeAllTabs")}}</el-dropdown-item>
                <el-dropdown-item @click.native="refreshCurrentTabs">{{$t("tab.refreshCurrentTabs")}}</el-dropdown-item>
            </el-dropdown-menu>
        </el-dropdown>
    </el-tabs>
</template>

<script>
    import { mapState, mapActions } from 'vuex'
    export default {
        name: "Tab",
        computed: {
            ...mapState('common', ['mainTabs']),
            mainTabsActiveName: {
                get() {
                    return this.$store.state.common.mainTabsActiveName
                },
                set(val) {
                    this.updateMainTabsActiveName(val)
                }
            }
        },
        methods: {
            ...mapActions('common', ['updateMainTabs', 'updateMainTabsActiveName']),
    //             【selectedTabHandle：】
    // 选中事件处理很简单，首先找到选中的标签页，然后路由跳转即可，
    // 由于 Aside.vue 中，已经监听了 $route，所以路由一变化，就会进行相关处理（修改 vuex 的三个值）。
    // 注：
    //     选中已选中的标签时，由于是同一个路由，路由（$route）不变化，
    //     若想实现变化，可以见后面的 refreshCurrentTabs 方法处理。

    // 处理标签选中事件
    selectedTabHandle(tab) {
        // 选择某个标签，标签存在于标签数组时，则跳转到相应的路由（根据名字跳转）
        tab = this.mainTabs.filter(item => item.name === tab.name)[0]
        if (tab) {
            // 已经在 Aside.vue 中使用 watch 监视了 $route，所以一旦路由变化，其就可以感知到，从而维护 vuex 状态。
            this.$router.push({
                name: tab.name,
                query: tab.query,
                params: tab.params
            })
        }
    },

    // 【removeTabHandle】
    // 移除事件，只要从 标签列表 中找到选中的标签移除即可。
    // 若标签列表没有数据，则跳转到首页。
    // 若移除的标签是当前选中的标签，则移除后跳转到最后一个标签页。

    // 处理标签删除事件
    removeTabHandle(tabName) {
        // 从 mainTabs 中删除标签即可
        this.updateMainTabs(this.mainTabs.filter(item => item.name !== tabName))
        // 如果当前 mainTabs 中仍有值，则进行当前选中标签逻辑处理
        if (this.mainTabs.length > 0) {
            // 如果删除的是当前选中的标签,则默认选择最后一个标签
            let tab = this.mainTabs[this.mainTabs.length - 1]
            if (tabName === this.mainTabsActiveName) {
                this.$router.push({
                    name: tab.name,
                    query: tab.query,
                    params: tab.params
                })
            }
        } else {
            // 如果当前 mainTabs 中没有值，则跳转到 HomePage 主页面
            this.updateMainTabsActiveName('')
            this.$router.push({name: 'HomePage'})
        }
    },

    // 【closeCurrentTabsHandle、closeOtherTabsHandle、closeAllTabsHandle】
    // 直接操作 标签列表 mainTabs 即可。
    // 关闭所有列表后，需要跳转到首页。

    // 关闭当前标签
    closeCurrentTabsHandle() {
        this.removeTabHandle(this.mainTabsActiveName)
    },
    // 关闭其他标签
    closeOtherTabsHandle() {
        this.updateMainTabs(this.mainTabs.filter(item => item.name === this.mainTabsActiveName))
    },
    // 关闭所有标签
    closeAllTabsHandle() {
        // 清空 mainTabs 数组，并跳转到 主页面
        this.updateMainTabs([])
        // 如果当前 mainTabs 中没有值，则跳转到 HomePage 主页面
        this.updateMainTabsActiveName('')
        this.$router.push({name: 'HomePage'})
    },

    // 【refreshCurrentTabs：】
    // 由于同一个路由跳转时， $route 不会变化，即 watch 失效。
    // 想要实现刷新效果，可以先移除标签，再添加标签，并重新跳转。

    // 刷新当前选中的标签
    refreshCurrentTabs() {
        // 用于保存当前标签数组
        let tabs = []
        Object.assign(tabs, this.mainTabs)
        // 保存当前选中的标签
        let tab = this.mainTabs.filter(item => item.name === this.mainTabsActiveName)[0]
        // 先移除标签
        this.removeTabHandle(tab.name)
        this.$nextTick(() => {
            // 移除渲染后，再重新添加标签数组，并跳转路由
            this.updateMainTabs(tabs)
            this.$router.push({
                name: tab.name,
                query: tab.query,
                params: tab.params
            })
        })
    }
        }
    }
</script>

<style scoped>
    .tab {
        background-color: #fff;
        margin: -15px -20px 10px -20px;
        padding: 0 10px 0 10px;
        height: 40px;
    }

    .dropdown-tool {
        float: left;
        position: fixed !important;
        right: 0;
        width: 40px;
        height: 40px;
        line-height: 40px;
        top: 55px;
        background-color: #f1f4f5;
    }

    .card {
        height: 650px;
    }
</style>
