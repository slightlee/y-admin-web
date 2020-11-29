module.exports = {
   lintOnSave: false, //关闭ESLint 校验
    // 指定端口
    // devServer: {
    //     port: 9001
    // },
    devServer: {
        port: process.env.NODE_ENV == "production" ? 8000 : 9000,
        proxy: {
            '/api': {
                target: process.env.VUE_APP_URL,
                // 允许跨域
                changeOrigin: true,
                ws: true,
                pathRewrite: {
                    '^/api': ''
                }
            }
        }
    }
}
