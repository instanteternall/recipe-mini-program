# 检查系统状态并修复Node.js安装

## 第一步：检查当前Node.js状态
```bash
# 检查是否有node命令
which node
which npm

# 检查进程
ps aux | grep node

# 检查已安装的包
rpm -qa | grep node
rpm -qa | grep npm
```

## 第二步：清理可能的残留
```bash
# 如果有残留文件，清理它们
rm -rf /usr/local/node* 2>/dev/null || true
rm -rf /usr/bin/node 2>/dev/null || true
rm -rf /usr/bin/npm 2>/dev/null || true
```

## 第三步：重新安装Node.js 16
```bash
# 使用二进制安装（最可靠的方法）
cd /tmp
wget https://nodejs.org/dist/v16.20.2/node-v16.20.2-linux-x64.tar.xz
tar -xJf node-v16.20.2-linux-x64.tar.xz
mv node-v16.20.2-linux-x64 /usr/local/node

# 设置环境变量
echo 'export PATH=$PATH:/usr/local/node/bin' >> ~/.bashrc
export PATH=$PATH:/usr/local/node/bin

# 验证安装
node --version
npm --version
```

## 第四步：如果wget不可用，使用curl
```bash
# 或者使用curl下载
cd /tmp
curl -o node.tar.xz https://nodejs.org/dist/v16.20.2/node-v16.20.2-linux-x64.tar.xz
tar -xJf node.tar.xz
mv node-v16.20.2-linux-x64 /usr/local/node
echo 'export PATH=$PATH:/usr/local/node/bin' >> ~/.bashrc
export PATH=$PATH:/usr/local/node/bin
```

## 第五步：配置npm国内镜像
```bash
npm config set registry https://registry.npmmirror.com
```

## 第六步：测试安装
```bash
cd recipe-mini-program/backend
npm install --production
```

## 备用方案：检查系统是否已有Node.js
```bash
# 检查所有可能的Node.js位置
find /usr -name "node" 2>/dev/null
find /usr/local -name "node" 2>/dev/null

# 如果找到，使用绝对路径
/usr/local/node/bin/node --version
```

告诉我检查的结果，我会根据具体情况提供解决方案！