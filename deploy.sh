#!/usr/bin/env sh

# 遇到错误时终止
set -e

# 打包
npm run build

# 进入打包目录（⚠️ 这里改成 build）
cd build

# 如果有自定义域名，就在这里写入 CNAME 文件
# echo 'www.example.com' > CNAME

# 初始化 git 并提交
git init
git add -A
git commit -m 'deploy'

# 推送到 gh-pages 分支（改成你的 GitHub 用户名和仓库名）
git push -f https://github.com/RyanZerog/doctor-server.git main:gh-pages

# 返回上级目录
cd -
