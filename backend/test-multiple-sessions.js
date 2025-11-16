/**
 * Test Script: Create Multiple Sessions
 * Opens 10 widget sessions to test UI features
 */

import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3000';
const NUM_SESSIONS = 10;

console.log(`🧪 Creating ${NUM_SESSIONS} test sessions...`);
console.log('======================================');

// Array to store all socket connections
const sockets = [];

for (let i = 1; i <= NUM_SESSIONS; i++) {
  const sessionId = `test-session-${i}-${Date.now()}`;
  
  // Create socket connection for each session
  const socket = io(SERVER_URL, {
    auth: {
      type: 'widget',
      siteKey: 'PUBLIC_SITE_KEY_123',
      sessionId: sessionId
    }
  });

  socket.on('connect', () => {
    console.log(`✅ Session ${i}: Connected (ID: ${socket.id})`);
    console.log(`   📋 Session: ${sessionId}`);
  });

  socket.on('authenticated', (data) => {
    console.log(`🔐 Session ${i}: Authenticated - ${data.sessionId}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Session ${i}: Disconnected`);
  });

  socket.on('error', (error) => {
    console.log(`🚨 Session ${i}: Error - ${error}`);
  });

  sockets.push(socket);
  
  // Small delay between connections to avoid overwhelming
  await new Promise(resolve => setTimeout(resolve, 100));
}

console.log('======================================');
console.log(`🎯 All ${NUM_SESSIONS} sessions created!`);
console.log('💡 Check your dashboard - you should see multiple active sessions');
console.log('⏰ Sessions will stay connected for 2 minutes, then auto-disconnect');

// Keep sessions alive for 2 minutes, then cleanup
setTimeout(() => {
  console.log('🧹 Cleaning up test sessions...');
  sockets.forEach((socket, index) => {
    socket.disconnect();
    console.log(`🔌 Disconnected session ${index + 1}`);
  });
  console.log('✨ All test sessions cleaned up!');
  process.exit(0);
}, 120000); // 2 minutes

// Handle Ctrl+C to cleanup gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Interrupted! Cleaning up...');
  sockets.forEach(socket => socket.disconnect());
  process.exit(0);
});