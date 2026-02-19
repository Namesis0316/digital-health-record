const STORAGE_PATIENTS = 'kerala_health_patients';
const STORAGE_RECORDS = 'kerala_health_records';
const CURRENT_PATIENT_ID = 'kerala_health_current_patient';

function getPatients() {
  return JSON.parse(localStorage.getItem(STORAGE_PATIENTS) || '{}');
}

function getRecords() {
  return JSON.parse(localStorage.getItem(STORAGE_RECORDS) || '{}');
}

function getCurrentPatientId() {
  return localStorage.getItem(CURRENT_PATIENT_ID);
}

function setCurrentPatientId(id) {
  localStorage.setItem(CURRENT_PATIENT_ID, id);
}

function generateHealthId() {
  const patients = getPatients();
  let id;
  do {
    id = 'KW' + String(Math.floor(100000 + Math.random() * 900000));
  } while (patients[id]);
  return id;
}

document.getElementById('registrationForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const age = document.getElementById('age').value;
  const bloodGroup = document.getElementById('bloodGroup').value;
  const phone = document.getElementById('phone').value.trim();
  const language = document.getElementById('language').value;

  const patientId = generateHealthId();
  const patients = getPatients();
  patients[patientId] = {
    name,
    age: parseInt(age),
    bloodGroup,
    phone,
    language,
    registeredAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_PATIENTS, JSON.stringify(patients));

  // Initialize empty records for this patient
  const records = getRecords();
  records[patientId] = records[patientId] || [];
  localStorage.setItem(STORAGE_RECORDS, JSON.stringify(records));

  setCurrentPatientId(patientId);

  const qrContainer = document.getElementById('qrContainer');
  const qrcodeEl = document.getElementById('qrcode');
  qrcodeEl.innerHTML = '';

  if (typeof QRCode !== 'undefined') {
    new QRCode(qrcodeEl, {
      text: patientId,
      width: 200,
      height: 200
    });
  } else {
    qrcodeEl.innerHTML = `<p style="font-size:24px; font-weight:bold;">${patientId}</p><p>QR library not loaded</p>`;
  }

  document.querySelector('#qrContainer h3').textContent = `Your Health ID: ${patientId}`;
  qrContainer.classList.remove('hidden');
  document.querySelector('form#registrationForm').classList.add('hidden');
});

document.getElementById('goToDashboard').addEventListener('click', function () {
  document.getElementById('registrationPage').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  showTab('patient');
  renderPatientDashboard();
});

function showTab(tab) {
  const patientTab = document.getElementById('patientTab');
  const doctorTab = document.getElementById('doctorTab');
  const buttons = document.querySelectorAll('.tab-btn');

  buttons.forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.tab-btn[onclick="showTab('${tab}')"]`).classList.add('active');

  if (tab === 'patient') {
    patientTab.classList.remove('hidden');
    doctorTab.classList.add('hidden');
    renderPatientDashboard();
  } else {
    patientTab.classList.remove('hidden');
    doctorTab.classList.add('hidden');
    patientTab.classList.add('hidden');
    doctorTab.classList.remove('hidden');
    loadDoctorPatient();
  }
}

function renderPatientDashboard() {
  const patientId = getCurrentPatientId();
  if (!patientId) {
    document.getElementById('patientInfo').innerHTML = '<p>No patient logged in. Please register first.</p>';
    document.getElementById('patientRecords').innerHTML = '';
    return;
  }

  const patients = getPatients();
  const patient = patients[patientId];
  if (!patient) {
    document.getElementById('patientInfo').innerHTML = '<p>Patient data not found.</p>';
    return;
  }

  document.getElementById('patientInfo').innerHTML = `
    <div class="info-box">
      <p><strong>Health ID:</strong> ${patientId}</p>
      <p><strong>Name:</strong> ${patient.name}</p>
      <p><strong>Age:</strong> ${patient.age}</p>
      <p><strong>Blood Group:</strong> ${patient.bloodGroup}</p>
      <p><strong>Phone:</strong> ${patient.phone}</p>
    </div>
  `;

  renderRecordsList(document.getElementById('patientRecords'), patientId);
}

function addPatientRecord() {
  const patientId = getCurrentPatientId();
  if (!patientId) {
    alert('Please register first.');
    return;
  }

  const date = prompt('Date of visit (YYYY-MM-DD):', new Date().toISOString().slice(0, 10));
  if (!date) return;
  const description = prompt('Brief description of the visit:') || 'N/A';
  const diagnosis = prompt('Diagnosis (if any):') || 'N/A';

  const records = getRecords();
  records[patientId] = records[patientId] || [];
  records[patientId].unshift({
    date,
    description,
    diagnosis,
    addedBy: 'self',
    addedAt: new Date().toISOString()
  });
  localStorage.setItem(STORAGE_RECORDS, JSON.stringify(records));

  renderPatientDashboard();
}

function loadDoctorPatient() {
  const searchInput = document.getElementById('patientSearch');
  const patientId = searchInput.value.trim().toUpperCase() || getCurrentPatientId();

  if (!patientId) {
    document.getElementById('doctorPatientInfo').innerHTML = '<p>Enter a Patient ID to view records.</p>';
    document.getElementById('doctorRecords').innerHTML = '';
    return;
  }

  const patients = getPatients();
  const patient = patients[patientId];

  if (!patient) {
    document.getElementById('doctorPatientInfo').innerHTML = `<p>No patient found with ID: ${patientId}</p>`;
    document.getElementById('doctorRecords').innerHTML = '';
    return;
  }

  document.getElementById('doctorPatientInfo').innerHTML = `
    <div class="info-box">
      <p><strong>Health ID:</strong> ${patientId}</p>
      <p><strong>Name:</strong> ${patient.name}</p>
      <p><strong>Age:</strong> ${patient.age} | <strong>Blood Group:</strong> ${patient.bloodGroup}</p>
      <p><strong>Phone:</strong> ${patient.phone}</p>
    </div>
  `;

  renderRecordsList(document.getElementById('doctorRecords'), patientId, true);
}

document.getElementById('patientSearch').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    loadDoctorPatient();
  }
});
document.getElementById('patientSearch').addEventListener('blur', loadDoctorPatient);

function addDoctorRecord() {
  const patientId = document.getElementById('patientSearch').value.trim().toUpperCase();
  if (!patientId) {
    alert('Enter Patient ID first.');
    return;
  }

  const patients = getPatients();
  if (!patients[patientId]) {
    alert('Patient not found. Please search for a valid Patient ID.');
    return;
  }

  const date = prompt('Date of visit (YYYY-MM-DD):', new Date().toISOString().slice(0, 10));
  if (!date) return;
  const description = prompt('Visit notes / symptoms:') || 'N/A';
  const diagnosis = prompt('Diagnosis:') || 'N/A';
  const prescription = prompt('Prescription / medication:') || 'N/A';
  const doctorName = prompt('Doctor name:') || 'Doctor';

  const records = getRecords();
  records[patientId] = records[patientId] || [];
  records[patientId].unshift({
    date,
    description,
    diagnosis,
    prescription,
    doctorName,
    addedBy: 'doctor',
    addedAt: new Date().toISOString()
  });
  localStorage.setItem(STORAGE_RECORDS, JSON.stringify(records));

  loadDoctorPatient();
}

function renderRecordsList(container, patientId, isDoctorView = false) {
  const records = getRecords()[patientId] || [];

  if (records.length === 0) {
    container.innerHTML = '<p>No health records yet.</p>';
    return;
  }

  container.innerHTML = records.map(r => {
    let html = `
      <div class="record-item">
        <p><strong>${r.date}</strong> ${r.addedBy === 'doctor' ? '— ' + (r.doctorName || 'Doctor') : '(self)'}</p>
        <p>${r.description}</p>
        <p><strong>Diagnosis:</strong> ${r.diagnosis}</p>
    `;
    if (isDoctorView && r.prescription) {
      html += `<p><strong>Prescription:</strong> ${r.prescription}</p>`;
    }
    html += '</div>';
    return html;
  }).join('');
}


