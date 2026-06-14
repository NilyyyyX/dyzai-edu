#!/bin/bash
set -e

echo "========================================="
echo "  嘟崽学情分析 - 一键部署脚本"
echo "========================================="

# 1. 克隆代码
echo "[1/6] 克隆代码..."
cd /www/duzai-api
if [ -d ".git" ]; then
  echo "  代码已存在，拉取最新..."
  git pull origin main
else
  git clone https://github.com/NilyyyyX/dyzai-edu.git .
fi

# 2. 安装依赖
echo "[2/6] 安装依赖..."
pnpm install

# 3. 创建 .env
echo "[3/6] 创建生产环境配置..."
cat > packages/server/.env << 'ENVEOF'
PORT=3000
NODE_ENV=production
DB_TYPE=sqlite
DB_PATH=./db/prod.sqlite3.json
JWT_SECRET=duzai-jwt-secret-2026-prod
JWT_EXPIRES_IN=7d
LLM_API_KEY=
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
WECOM_CORP_ID=wwb1c6755cd9fbfbef
WECOM_AGENT_ID=your_agent_id
WECOM_SECRET=your_agent_secret
WECOM_CALLBACK_TOKEN=US6YdgKQIcUY2GUKnAlb
WECOM_ENCODING_AES_KEY=3De1O57poFEi9srf2m4AKWhYabMoJbQubdeprlc9on4
ENVEOF

# 4. 初始化数据库目录
echo "[4/6] 初始化数据库..."
cd packages/server
mkdir -p db uploads

# 5. 添加本地 SSH 公钥（让 Qoder 以后可以远程部署）
echo "[5/6] 配置 SSH 公钥..."
mkdir -p ~/.ssh
chmod 700 ~/.ssh
PUB_KEY='ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDa5nBRjFAEmMsCcrM/gz8Ufn1Hv38X/4CvIEfUW7emSLwjyThrR1YFSVkO9a16Uh1CustsPNmdK6NhHuPxopP8nPC7RUS9tCpj80jQ73cwB6xV2y/D/05Wikk06UX5UD+fG8/JEWqIf6brx0CfVMUixOm215rER1aj2aaXye3Yq2a6cv3mAvyUNhSXedPBw0YsW1s0Nb1rxBc2aK9IDuTlqRdrxRsiRsAgVMsCFoo/USCMiMUmyeqOkAdVxKiLzmVnOrW30dMii8S+ak9cgonNQjjhqPP+rM7kBWpE15DAWtOoqMI/34jkt1lLLDQ1qhw1PoqVC8for0Cck6KVYQ4tjhV12c+WRKcBqw3iAmk0Z3ONWWu3ItnGmwtUkBS3DUy+fmgbOZuIHlvdxmdx9WrftuQF6q4VQgNIUAsKdXalsGm/aL4YqvNPhxSmfeGqEUw/ixVUF40jQEB+o/72oPn8UOcVPGQCfqBKzsXhnzyHTijmzYLOIYNmoiFQV5xqg7qk+sPVbgPbdMgy59irXcOrn8KPCdplJ48G2BSJP4Oyr89qfIMA2wSgjIXi8GRDL5CHguE7+i4QnNJ23ESpx/76T4U4wjb2EaDgZDlLKPKvHE0tOuVbmfS7OvhFA5viH+JVf/eVUy2K2a7p1n4K6idxNeBFZG/G6Ij7SIyQd7USyQ== Nilyyy@Nilyyy'
if ! grep -q "Nilyyy@Nilyyy" ~/.ssh/authorized_keys 2>/dev/null; then
  echo "$PUB_KEY" >> ~/.ssh/authorized_keys
  chmod 600 ~/.ssh/authorized_keys
  echo "  SSH 公钥已添加"
else
  echo "  SSH 公钥已存在"
fi

# 6. 启动服务
echo "[6/6] 启动 API 服务..."
cd /www/duzai-api/packages/server
pm2 delete duzai-api 2>/dev/null || true
pm2 start "npx tsx src/index.ts" --name duzai-api
pm2 save

echo ""
echo "========================================="
echo "  部署完成！"
echo "========================================="
pm2 status
echo ""
echo "API 运行在 http://localhost:3000"
echo "测试: curl http://localhost:3000/api/health"
