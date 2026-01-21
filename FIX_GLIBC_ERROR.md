# 修复GLIBC版本兼容性问题

## 问题分析
阿里云服务器的系统库版本太低，不支持Node.js 18。需要使用兼容的Node.js版本或升级系统库。

## 解决方案1：使用Node.js 16（推荐）

```bash
# 卸载当前的Node.js
yum remove -y nodejs npm

# 安装Node.js 16（兼容性更好）
curl -fsSL https://rpm.nodesource.com/setup_16.x | bash -
yum install -y nodejs

# 验证版本
node --version  # 应该显示 v16.x.x
npm --version   # 应该显示 8.x.x
```

## 解决方案2：如果方案1仍然有问题

```bash
# 使用二进制安装兼容版本
cd /tmp
wget https://nodejs.org/dist/v16.20.2/node-v16.20.2-linux-x64.tar.xz
tar -xJf node-v16.20.2-linux-x64.tar.xz
mv node-v16.20.2-linux-x64 /usr/local/node16
echo 'export PATH=$PATH:/usr/local/node16/bin' >> ~/.bashrc
source ~/.bashrc

# 验证
node --version  # v16.20.2
npm --version   # 8.19.4
```

## 解决方案3：升级系统库（高级用户）

```bash
# 升级glibc（谨慎操作，可能会影响系统稳定性）
# 建议跳过此方案，除非你非常确定
```

## 测试安装

安装完成后测试：
```bash
cd recipe-mini-program/backend
npm install --production
```

## 成功标志

你应该看到：
```
npm WARN config production Use `--omit=dev` instead.
npm WARN deprecated ...
added XXX packages from YYY contributors and audited ZZZ packages in M.Ms
```

然后启动应用：
```bash
npm start
```

## 如果还有问题

告诉我具体的错误信息，我会继续帮你解决！

## 为什么会出现这个问题

阿里云轻量应用服务器使用的是较老的CentOS/Alibaba Cloud Linux系统，系统库版本较低。新版本的Node.js需要更新的系统库支持。