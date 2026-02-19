// ============================================
// Kerala Migrant Worker Health Records - Logic
// Hackathon Prototype: Digital Health Record for Migrant Workers
// ============================================

const STORAGE_PATIENTS = 'kerala_health_patients';
const STORAGE_RECORDS = 'kerala_health_records';
const CURRENT_PATIENT_ID = 'kerala_health_current_patient';

// ----------- Page Navigation -----------
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  const page = document.getElementById(pageId);
  if (page) page.classList.remove('hidden');

  if (pageId === 'patientDashboardPage') renderPatientDashboard();
  if (pageId === 'doctorDashboardPage') loadDoctorPatientLive();
}

// Get stored data
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

// Generate unique Health ID (KW + 6 digits)
function generateHealthId() {
  const patients = getPatients();
  let id;
  do {
    id = 'KW' + String(Math.floor(100000 + Math.random() * 900000));
  } while (patients[id]);
  return id;
}

// ----------- Doctor Login -----------
document.getElementById('doctorLoginForm').addEventListener('submit', function (e) {
  e.preventDefault();
  showPage('doctorDashboardPage');
});

// ----------- Patient Login -----------
document.getElementById('patientLoginForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const healthId = document.getElementById('loginHealthId').value.trim().toUpperCase();
  const phoneSuffix = document.getElementById('loginPhone').value.trim();
  const patients = getPatients();
  const patient = patients[healthId];
  if (!patient) {
    alert('Health ID not found. Please register first.');
    return;
  }
  if (!patient.phone.endsWith(phoneSuffix)) {
    alert('Invalid credentials.');
    return;
  }
  setCurrentPatientId(healthId);
  showPage('patientDashboardPage');
});

// ----------- Registration -----------
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

  const records = getRecords();
  records[patientId] = records[patientId] || [];
  localStorage.setItem(STORAGE_RECORDS, JSON.stringify(records));

  setCurrentPatientId(patientId);

  const qrContainer = document.getElementById('qrContainer');
  const qrcodeEl = document.getElementById('qrcode');
  qrcodeEl.innerHTML = '';

  if (typeof QRCode !== 'undefined') {
    try {
      new QRCode(qrcodeEl, { text: patientId, width: 200, height: 200 });
    } catch (err) {
      qrcodeEl.innerHTML = `<p style="font-size:24px; font-weight:bold;">${patientId}</p>`;
    }
  } else {
    qrcodeEl.innerHTML = `<p style="font-size:24px; font-weight:bold;">${patientId}</p>`;
  }

  document.querySelector('#qrContainer h3').textContent = `Your Health ID: ${patientId}`;
  qrContainer.classList.remove('hidden');
  document.querySelector('form#registrationForm').classList.add('hidden');
});

// Go to Dashboard (after registration)
document.getElementById('goToDashboard').addEventListener('click', function () {
  showPage('patientDashboardPage');
});

// ----------- Demo Modals (screenshot-style overlays) -----------
const DEMO_CONTENT = {
  doctor: {
    viewData: {
      title: 'View Patient Data',
      html: `
        <div class="demo-screenshot">
          <div class="demo-screen-header">Patient Health Profile</div>
          <div class="demo-screen-body">
            <p><strong>Health ID:</strong> KW123456</p>
            <p><strong>Name:</strong> Rajesh Kumar</p>
            <p><strong>Age:</strong> 32 | <strong>Blood:</strong> O+</p>
            <p><strong>Language:</strong> Hindi</p>
            <hr>
            <p><strong>Recent Records:</strong></p>
            <ul><li>2025-02-15: Fever, prescribed Paracetamol</li>
            <li>2025-01-20: Follow-up checkup</li></ul>
          </div>
        </div>`,
      caption: 'Doctor views patient demographics and full medical history'
    },
    uploadData: {
      title: 'Upload Medical Record',
      html: `
        <div class="demo-screenshot">
          <div class="demo-screen-header">Add Medical Record</div>
          <div class="demo-screen-body">
            <p>Patient ID: KW123456</p>
            <p>Date: 2025-02-20</p>
            <p>Notes: [Visit notes...]</p>
            <p>Diagnosis: [Diagnosis...]</p>
            <p>Prescription: [Medication...]</p>
            <p><button class="btn">Save Record</button></p>
          </div>
        </div>`,
      caption: 'Doctor uploads visit notes, diagnosis, and prescription'
    },
    searchPatient: {
      title: 'Search Patient',
      html: `
        <div class="demo-screenshot">
          <div class="demo-screen-header">Search by Health ID / QR</div>
          <div class="demo-screen-body">
            <p>Enter Health ID: [KW______]</p>
            <p>Or scan QR code from patient's phone/card</p>
            <button class="btn">Search</button>
          </div>
        </div>`,
      caption: 'Search patient by Health ID or scan their QR code'
    },
    prescribe: {
      title: 'Prescribe Medication',
      html: `
        <div class="demo-screenshot">
          <div class="demo-screen-header">Prescription</div>
          <div class="demo-screen-body">
            <p>Paracetamol 500mg - 1-0-1 for 5 days</p>
            <p>ORS sachets - as needed</p>
            <p>Advice: Rest, fluids</p>
          </div>
        </div>`,
      caption: 'Doctor writes prescription linked to patient record'
    }
  },
  patient: {
    viewData: {
      title: 'View My Data',
      html: `
        <div class="demo-screenshot">
          <div class="demo-screen-header">My Health Records</div>
          <div class="demo-screen-body">
            <p><strong>Health ID:</strong> KW123456</p>
            <p>Your records are accessible in your preferred language.</p>
            <p><strong>Recent:</strong></p>
            <ul><li>2025-02-15: Fever - Paracetamol</li></ul>
          </div>
        </div>`,
      caption: 'Patient views their own health records anytime'
    },
    uploadData: {
      title: 'Upload Document',
      html: `
        <div class="demo-screenshot">
          <div class="demo-screen-header">Upload Document</div>
          <div class="demo-screen-body">
            <p>Upload: Lab report / Prescription / X-ray</p>
            <p>[Choose file] [Upload]</p>
          </div>
        </div>`,
      caption: 'Patient uploads lab reports or prescriptions'
    }
  }
};

function showDemoModal(role, operation) {
  const data = DEMO_CONTENT[role]?.[operation];
  if (!data) return;
  const modal = document.getElementById('demoModal');
  document.getElementById('demoModalBody').innerHTML = data.html;
  document.getElementById('demoModalCaption').textContent = data.caption;
  modal.classList.remove('hidden');
}

function closeDemoModal() {
  document.getElementById('demoModal').classList.add('hidden');
}

document.getElementById('demoModal').addEventListener('click', function (e) {
  if (e.target === this) closeDemoModal();
});

// ----------- Patient Dashboard -----------
function renderPatientDashboard() {
  const patientInfoEl = document.getElementById('patientInfo');
  const patientRecordsEl = document.getElementById('patientRecords');
  if (!patientInfoEl) return;

  const patientId = getCurrentPatientId();
  if (!patientId) {
    patientInfoEl.innerHTML = '<p>No patient logged in. Please register or login.</p>';
    if (patientRecordsEl) patientRecordsEl.innerHTML = '';
    return;
  }

  const patients = getPatients();
  const patient = patients[patientId];
  if (!patient) {
    patientInfoEl.innerHTML = '<p>Patient data not found.</p>';
    return;
  }

  patientInfoEl.innerHTML = `
    <div class="info-box">
      <p><strong>Health ID:</strong> ${patientId}</p>
      <p><strong>Name:</strong> ${patient.name}</p>
      <p><strong>Age:</strong> ${patient.age} | <strong>Blood Group:</strong> ${patient.bloodGroup}</p>
      <p><strong>Phone:</strong> ${patient.phone}</p>
    </div>
  `;

  if (patientRecordsEl) renderRecordsList(patientRecordsEl, patientId);
}

function addPatientRecord() {
  const patientId = getCurrentPatientId();
  if (!patientId) {
    alert('Please register or login first.');
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

// ----------- Doctor Dashboard (Live) -----------
function loadDoctorPatientLive() {
  const el = document.getElementById('doctorPatientSearch');
  const patientId = (el && el.value.trim().toUpperCase()) || '';

  const infoEl = document.getElementById('doctorPatientInfo');
  const recordsEl = document.getElementById('doctorRecords');
  if (!infoEl) return;

  if (!patientId) {
    infoEl.innerHTML = '<p>Enter a Patient ID and click Search.</p>';
    if (recordsEl) recordsEl.innerHTML = '';
    return;
  }

  const patients = getPatients();
  const patient = patients[patientId];

  if (!patient) {
    infoEl.innerHTML = `<p>No patient found with ID: ${patientId}</p>`;
    if (recordsEl) recordsEl.innerHTML = '';
    return;
  }

  infoEl.innerHTML = `
    <div class="info-box">
      <p><strong>Health ID:</strong> ${patientId}</p>
      <p><strong>Name:</strong> ${patient.name}</p>
      <p><strong>Age:</strong> ${patient.age} | <strong>Blood Group:</strong> ${patient.bloodGroup}</p>
      <p><strong>Phone:</strong> ${patient.phone}</p>
    </div>
  `;

  if (recordsEl) renderRecordsList(recordsEl, patientId, true);
}

function addDoctorRecordLive() {
  const el = document.getElementById('doctorPatientSearch');
  const patientId = el ? el.value.trim().toUpperCase() : '';

  if (!patientId) {
    alert('Enter Patient ID and Search first.');
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

  loadDoctorPatientLive();
}

document.addEventListener('DOMContentLoaded', function () {
  const searchEl = document.getElementById('doctorPatientSearch');
  if (searchEl) {
    searchEl.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        loadDoctorPatientLive();
      }
    });
  }
});

// ----------- Render Records List -----------
function renderRecordsList(container, patientId, isDoctorView = false) {
  if (!container) return;
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
