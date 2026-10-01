// PM2 进程管理配置 — star-chart
// 启动：pm2 start ecosystem.config.cjs
// 日志：pm2 logs
// 停止：pm2 stop star-chart-web
// 删除：pm2 delete star-chart-web

module.exports = {
  apps: [
    {
      name: 'star-chart-web',
      // 直接用 node 运行 vite.js，规避 Windows 下 pnpm.CMD/vite.CMD 批处理无法被 pm2 当脚本执行的问题
      // cwd 设为 apps/web，使 vite 能正确读取 vite.config.ts（含东财 API 代理中间件与 host 配置）
      script: 'node_modules/vite/bin/vite.js',
      cwd: __dirname + '\\apps\\web',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 8888,
      },
      // 输出与错误日志
      out_file: './logs/web-out.log',
      error_file: './logs/web-error.log',
      merge_logs: true,
      time: true,
    },
  ],
};
