let device, server;
let pressureChar, gyroChar, batteryChar;

async function connectToDevice() {
  device = await navigator.bluetooth.requestDevice({
    filters: [{ name: 'SmartShoe' }],
    optionalServices: ['0000aaaa-0000-1000-8000-00805f9b34fb']
  });

  server = await device.gatt.connect();
  const service = await server.getPrimaryService('0000aaaa-0000-1000-8000-00805f9b34fb');

  // 각 Characteristic UUID에 맞춰 연결
  pressureChar = await service.getCharacteristic('0000bbb1-0000-1000-8000-00805f9b34fb'); // 압력 센서
  gyroChar = await service.getCharacteristic('0000bbb2-0000-1000-8000-00805f9b34fb');    // 자이로
  batteryChar = await service.getCharacteristic('0000bbb3-0000-1000-8000-00805f9b34fb'); // 배터리

  document.getElementById('status').innerText = "연결 상태: ✅ 연결됨";
}

async function connectAndReadPressure() {
  if (!pressureChar) await connectToDevice();
  const value = await pressureChar.readValue();
  const text = new TextDecoder().decode(value);
  document.getElementById('data').innerText = `압력 센서 값: ${text}`;
}

async function connectAndReadGyro() {
  if (!gyroChar) await connectToDevice();
  const value = await gyroChar.readValue();
  const text = new TextDecoder().decode(value);
  document.getElementById('data').innerText = `운동 상태: ${text}`;
}

async function connectAndReadBattery() {
  if (!batteryChar) await connectToDevice();
  const value = await batteryChar.readValue();
  const text = new TextDecoder().decode(value);
  document.getElementById('data').innerText = `🔋 배터리 잔량: ${text}%`;
}