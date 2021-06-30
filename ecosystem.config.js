const { name } = require('./package.json');
const path = require('path');

/**
 * 配置pm2 的启动方式
 * 由于使用了socketIo 所以这里用fork 的模式启动 需要为每一个worker配置单独的端口
 * 
 * 如 开启负载 需要使用ip_hash 或其他方式 让链接保持在一个worker端口内
 * 
 * nginx 配置如下
 * upstream io_nodes {
      ip_hash;
      server 127.0.0.1:3131;
      server 127.0.0.1:3132;
      server 127.0.0.1:3133;
      server 127.0.0.1:3134;
    }
    server {
        listen 80;
        server_name www.51kk.com;
        location / {
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection "upgrade";
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header Host $host;
          proxy_http_version 1.1;
          proxy_pass http://io_nodes;
        }
 */

// 配置多个端口就会启动多少个worker,同时项目配置的端口会失效
const ports = new Set([8080, 8081, 8082, 8083, 8084, 8085])

const workersConfig = [] 
for (let port of ports) {
  workersConfig.push({
    name: name + ':' + port,
    script: path.resolve(__dirname, './dist/start.js'), // 启动文件
    autorestart: true, // 发生异常的情况下自动重启；
    max_restarts : 3, // 最大异常重启次数，即小于min_uptime运行时间重启次数
    restart_delay : 5000, // 异常重启情况下，延时重启时间
    instance_var: 'INSTANCE_' + port,
    env_production: {
      NODE_ENV: 'production',
      PORT: port,
    }
  })
}
// const workers = ports.forEach(port => (
  
// ))

module.exports = {
  apps: workersConfig
};