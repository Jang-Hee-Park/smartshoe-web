let device, server;
let pressureChar, gyroChar, batteryChar;

async function connectToDevice() {
  try {
    device = await navigator.bluetooth.requestDevice({
      filters: [{ name: 'SmartShoe' }],
      optionalServices: ['0000aaaa-0000-1000-8000-00805f9b34fb']
    });

    server = await device.gatt.connect();
    const service = await server.getPrimaryService('0000aaaa-0000-1000-8000-00805f9b34fb');

    pressureChar = await service.getCharacteristic('0000bbb1-0000-1000-8000-00805f9b34fb');
    gyroChar = await service.getCharacteristic('0000bbb2-0000-1000-8000-00805f9b34fb');
    batteryChar = await service.getCharacteristic('0000bbb3-0000-1000-8000-00805f9b34fb');

    document.getElementById("status").innerText = "연결 상태: ✅ 연결됨";
  } catch (error) {
    console.error("BLE 연결 실패:", error);
    document.getElementById("status").innerText = "연결 상태: 🔌 미연결 (BLE 실패)";
  }
}

function showData(content, batteryPercent = null) {
  document.getElementById('menu').style.display = 'none';
  document.getElementById('dataSection').style.display = 'block';
  document.getElementById('data').innerHTML = content;

  if (batteryPercent !== null) {
    document.getElementById('batteryBar').innerHTML = `
      <div style="width: 100%; background: #ddd;">
        <div class="bar" style="width: ${batteryPercent}%;"></div>
      </div>
      <p>${batteryPercent}% 남음</p>
    `;
  } else {
    document.getElementById('batteryBar').innerHTML = '';
  }
}

function showMenu() {
  document.getElementById('menu').style.display = 'block';
  document.getElementById('dataSection').style.display = 'none';
}

async function connectAndReadPressure() {
  showData("압력 센서 데이터를 불러오는 중...");
  try {
    if (!pressureChar) await connectToDevice();
    const value = await pressureChar.readValue();
    const text = new TextDecoder().decode(value);

    // 예시: "R:30,20,28;F:10,11"
    const [rPart, fPart] = text.split(";");
    const [heel, fore1, fore2] = rPart.replace("R:", "").split(",");
    const [mid1, mid2] = fPart.replace("F:", "").split(",");

    const content = `
      <strong>발꿈치 압력:</strong> ${heel} kg<br>
      <strong>전족부1 센서 압력:</strong> ${fore1} kg<br>
      <strong>전족부2 센서 압력:</strong> ${fore2} kg<br>
      <strong>중족부1 센서 압력:</strong> ${mid1} kg<br>
      <strong>중족부2 센서 압력:</strong> ${mid2} kg
    `;
    document.getElementById("data").innerHTML = content;

  } catch (error) {
    document.getElementById("data").innerHTML = "❗ 센서와 연결되지 않았습니다. BLE 기기를 확인해주세요.";
    console.error(error);
  }
}

async function connectAndReadGyro() {
  showData("운동 상태 데이터를 불러오는 중...");
  try {
    if (!gyroChar) await connectToDevice();
    const value = await gyroChar.readValue();
    const text = new TextDecoder().decode(value);
    showData(`<strong>운동 상태:</strong> ${text}`);
  } catch (error) {
    document.getElementById("data").innerHTML = "❗ 자이로 센서 연결 실패";
    console.error(error);
  }
}

async function connectAndReadBattery() {
  showData("배터리 상태를 불러오는 중...");
  try {
    if (!batteryChar) await connectToDevice();
    const value = await batteryChar.readValue();
    const percent = parseInt(new TextDecoder().decode(value));
    showData("<strong>배터리 잔량</strong>", percent);
  } catch (error) {
    document.getElementById("data").innerHTML = "❗ 배터리 센서 연결 실패";
    console.error(error);
  }
}
