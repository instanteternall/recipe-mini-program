#!/bin/bash
# 重启服务器脚本
cd /home/recipe-mini-program/backend
pm2 stop recipe-api
cp server_restart.js server.js
pm2 start server.js --name "recipe-api"
