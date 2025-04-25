import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const targetProcessName = 'AnythingLLM.exe';
const configPath = path.join(process.cwd(), 'src', 'config.js');

async function updateConfig(port) {
  try {
    const configContent = await fs.readFile(configPath, 'utf8');
    const updatedContent = configContent.replace(
      /(anythingllmConfig\s*=\s*{[^}]*port\s*:\s*)[^,}]*(.*})/s,
      `$1"${port}"$2`
    );
    await fs.writeFile(configPath, updatedContent, 'utf8');
    console.log('✅ 配置文件已更新');
  } catch (error) {
    console.error('更新配置文件失败:', error);
  }
}

function getListeningPorts(processName) {
  exec('netstat -ano -p tcp', (err, stdout) => {
    if (err) return console.error('netstat error:', err);

    const netstatLines = stdout.split('\n').filter(line => line.includes('LISTENING'));
    const portPidMap = netstatLines.map(line => {
      const parts = line.trim().split(/\s+/);
      const localAddress = parts[1];
      const pid = parts[parts.length - 1];
      const portMatch = localAddress.match(/:(\d+)$/);
      const port = portMatch ? portMatch[1] : null;
      return { pid, port };
    }).filter(entry => entry.port);

    exec(`tasklist /FI "IMAGENAME eq ${processName}"`, (err, taskOut) => {
      if (err) return console.error('tasklist error:', err);

      const pidMatches = [...taskOut.matchAll(/\s(\d+)\s/g)].map(m => m[1]);
      const matchingPorts = portPidMap
        .filter(({ pid }) => pidMatches.includes(pid))
        .map(({ port }) => port);

      if (matchingPorts.length > 0) {
        console.log(`✅ ${processName} 正在监听端口:`, matchingPorts.join(', '));
        updateConfig(matchingPorts[0]); // 更新第一个端口到配置文件
      } else {
        console.log(`⚠️ 没有找到 ${processName} 正在监听的端口。`);
      }
    });
  });
}

getListeningPorts(targetProcessName);
