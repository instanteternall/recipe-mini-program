# 修复npm命令不存在问题

## 问题分析
阿里云轻量应用服务器的Node.js镜像可能没有正确安装Node.js和npm，或者需要手动安装。

## 解决方案

### 第一步：检查Node.js是否已安装
```bash
# 检查Node.js版本
node --version

# 检查npm版本
npm --version
```

如果显示版本号，说明已安装，跳到下一步。
如果显示"command not found"，继续安装。

### 第二步：安装Node.js和npm
```bash
# 方法1：使用yum安装（推荐）
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# 方法2：如果方法1失败，使用二进制安装
cd /tmp
wget https://nodejs.org/dist/v18.17.0/node-v18.17.0-linux-x64.tar.xz
tar -xJf node-v18.17.0-linux-x64.tar.xz
mv node-v18.17.0-linux-x64 /usr/local/node
echo 'export PATH=$PATH:/usr/local/node/bin' >> ~/.bashrc
source ~/.bashrc
```

### 第三步：验证安装
```bash
# 再次检查版本
node --version
npm --version

# 应该显示类似：
# v18.17.0
# 9.6.7
```

### 第四步：继续部署
安装完成后，继续之前的部署步骤：
```bash
cd recipe-mini-program/backend
npm install --production
```

## 备用方案

如果安装仍然有问题，可以使用nvm（Node Version Manager）：

```bash
# 安装nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# 安装Node.js 18
nvm install 18
nvm use 18

# 验证
node --version
npm --version
```

## 故障排除

### 问题1：权限不足
```bash
# 使用sudo（如果有权限）
sudo yum install -y nodejs
```

### 问题2：网络问题
```bash
# 配置国内镜像
npm config set registry https://registry.npmmirror.com
```

### 问题3：清理缓存重试
```bash
npm cache clean --force
npm install --production
```

告诉我安装结果，我会继续指导下一步！