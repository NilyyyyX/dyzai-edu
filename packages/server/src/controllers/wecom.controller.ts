import { Request, Response } from 'express';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { WeChatCrypto } from '../utils/wecom-crypto';
import { env } from '../config/env';
import { getDb } from '../db/database';
import OpenAI from 'openai';

const xmlParser = new XMLParser({ ignoreAttributes: false });
const xmlBuilder = new XMLBuilder({ ignoreAttributes: false });

// Lazy-init crypto (will be null if config not set)
let wechatCrypto: WeChatCrypto | null = null;
function getCrypto(): WeChatCrypto | null {
  if (!wechatCrypto && env.WECOM_CALLBACK_TOKEN && env.WECOM_ENCODING_AES_KEY
    && env.WECOM_CALLBACK_TOKEN !== 'your_callback_token'
    && env.WECOM_ENCODING_AES_KEY !== 'your_encoding_aes_key') {
    wechatCrypto = new WeChatCrypto(
      env.WECOM_CALLBACK_TOKEN,
      env.WECOM_ENCODING_AES_KEY,
      env.WECOM_CORP_ID || '',
    );
  }
  return wechatCrypto;
}

// AI client
let aiClient: OpenAI | null = null;
if (env.LLM_API_KEY && env.LLM_API_KEY !== 'sk-xxx') {
  aiClient = new OpenAI({ apiKey: env.LLM_API_KEY, baseURL: env.LLM_BASE_URL });
}

const ANALYSIS_PROMPT = `你是一位专业的小学教育分析师。请从以下家教消息中提取学习情况，分析学生的知识点掌握和薄弱项。

返回格式（纯文本，不要JSON）：
📊 分析总结：（2-3句话概述）
📚 涉及知识点：（列出）
⚠️ 薄弱项：（列出）
💡 建议：（2-3条具体建议）

如果消息内容与学习无关，请回复"该消息与学习无关，未进行分析"。`;

async function analyzeMessage(content: string): Promise<string> {
  if (content.trim().length < 10) return '消息太短，无法分析。';

  if (aiClient) {
    try {
      const response = await aiClient.chat.completions.create({
        model: env.LLM_MODEL,
        messages: [
          { role: 'system', content: ANALYSIS_PROMPT },
          { role: 'user', content: `请分析以下家教消息：\n\n${content}` },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });
      return response.choices[0]?.message?.content || '分析失败，请重试。';
    } catch (e) {
      console.error('AI analysis error:', e);
    }
  }

  // Fallback: keyword-based
  const topics = ['加减法', '乘除法', '分数', '小数', '应用题', '通分', '约分',
    '阅读理解', '作文', '生字', '拼音', '古诗', '笔画',
    '单词', '语法', '听写', '拼写'];
  const found = topics.filter(t => content.includes(t));
  const errors: string[] = [];
  for (const s of content.split(/[。！？\n]+/)) {
    if (['错', '不会', '不懂', '加强', '薄弱', '不熟'].some(p => s.includes(p)) && s.trim().length > 5) {
      errors.push(s.trim().slice(0, 40));
    }
  }
  let result = `📊 收到${content.length}字消息\n`;
  result += found.length > 0 ? `📚 知识点：${found.join('、')}\n` : '';
  result += errors.length > 0 ? `⚠️ 薄弱项：${errors.join('；')}\n` : '';
  result += '💡 配置 AI Key 后可获得更精准的分析';
  return result;
}

/**
 * GET /api/wecom/callback - URL verification
 */
export function verifyCallback(req: Request, res: Response) {
  const { msg_signature, timestamp, nonce, echostr } = req.query;
  const crypto = getCrypto();

  if (!crypto) {
    res.status(500).send('WeChat crypto not configured');
    return;
  }

  if (!msg_signature || !timestamp || !nonce || !echostr) {
    res.status(400).send('Missing parameters');
    return;
  }

  const ts = timestamp as string;
  const nc = nonce as string;
  const es = echostr as string;
  const sig = msg_signature as string;

  if (!crypto.verifySignature(sig, ts, nc, es)) {
    res.status(403).send('Signature verification failed');
    return;
  }

  try {
    const decrypted = crypto.decrypt(es);
    console.log('[WeCom] Callback verified successfully');
    res.send(decrypted);
  } catch (e) {
    console.error('[WeCom] Callback verification failed:', e);
    res.status(500).send('Decryption failed');
  }
}

/**
 * POST /api/wecom/callback - Receive messages
 */
export async function receiveMessage(req: Request, res: Response) {
  const { msg_signature, timestamp, nonce } = req.query;
  const crypto = getCrypto();

  if (!crypto) {
    res.status(500).send('WeChat crypto not configured');
    return;
  }

  const ts = (timestamp || '') as string;
  const nc = (nonce || '') as string;

  try {
    // Parse outer XML to get encrypted content
    const xmlBody = typeof req.body === 'string' ? req.body : req.body.toString();
    const parsed = xmlParser.parse(xmlBody);
    const encrypted = parsed?.xml?.Encrypt;

    if (!encrypted) {
      res.status(400).send('Missing Encrypt field');
      return;
    }

    // Verify signature
    const sig = (msg_signature || '') as string;
    if (!crypto.verifySignature(sig, ts, nc, encrypted)) {
      res.status(403).send('Message signature verification failed');
      return;
    }

    // Decrypt message
    const decryptedXml = crypto.decrypt(encrypted);
    const msgData = xmlParser.parse(decryptedXml);
    const msgType = msgData?.xml?.MsgType;
    const fromUser = msgData?.xml?.FromUserName || '';
    const xmlNode = msgData?.xml || {};

    // Extract text content from various message types
    let content = '';
    if (msgType === 'text') {
      content = xmlNode.Content || '';
    } else if (msgType === 'location') {
      content = xmlNode.Label || '';
    } else if (msgType === 'link') {
      content = `${xmlNode.Title || ''}\n${xmlNode.Description || ''}\n${xmlNode.Url || ''}`;
    } else if (msgType === 'file') {
      content = `[文件: ${xmlNode.FileName || '未知'}]`;
    } else if (msgType === 'image') {
      content = '';
    } else {
      // Log full XML for unknown types to help debug
      console.log(`[WeCom] Unknown msg type '${msgType}', full XML:`, decryptedXml.slice(0, 500));
      // Try to extract any text content from the XML
      content = xmlNode.Content || xmlNode.Title || xmlNode.Description || '';
    }

    console.log(`[WeCom] Received ${msgType} from ${fromUser}: ${(content || '').slice(0, 80)}...`);

    if (!content || content.trim().length === 0) {
      const reply = buildReplyXml(fromUser, '请发送文字消息或合并转发的聊天记录，我会自动分析学习情况。', crypto, ts, nc);
      res.type('application/xml').send(reply);
      return;
    }

    // Analyze the message
    const analysisResult = await analyzeMessage(content);

    // Save to database
    const db = await getDb();
    const now = new Date().toISOString();
    db.data.chat_messages.push({
      id: db.data.chat_messages.length + 1,
      from_user: fromUser,
      content,
      analysis_result: analysisResult,
      received_at: now,
    });
    await db.write();

    // Send reply
    const reply = buildReplyXml(fromUser, analysisResult, crypto, ts, nc);
    res.type('application/xml').send(reply);
  } catch (e) {
    console.error('[WeCom] Message processing failed:', e);
    res.status(500).send('Processing failed');
  }
}

function buildReplyXml(
  toUser: string,
  content: string,
  crypto: WeChatCrypto,
  timestamp: string,
  nonce: string,
): string {
  const replyXml = xmlBuilder.build({
    xml: {
      ToUserName: toUser,
      FromUserName: env.WECOM_CORP_ID,
      CreateTime: Math.floor(Date.now() / 1000),
      MsgType: 'text',
      Content: content,
    },
  });

  const encrypted = crypto.encrypt(replyXml);
  const signature = crypto.generateSignature(timestamp, nonce, encrypted);

  return `<xml>
<Encrypt><![CDATA[${encrypted}]]></Encrypt>
<MsgSignature><![CDATA[${signature}]]></MsgSignature>
<TimeStamp>${timestamp}</TimeStamp>
<Nonce><![CDATA[${nonce}]]></Nonce>
</xml>`;
}

/**
 * GET /api/wecom/messages - List received messages (for frontend)
 */
export async function listMessages(req: Request, res: Response) {
  const db = await getDb();
  const messages = db.data.chat_messages
    .sort((a, b) => b.received_at.localeCompare(a.received_at))
    .slice(0, 50);
  res.json(messages);
}
