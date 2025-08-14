// Estado global de la aplicación
let uploadedFile = null;
let stations = [];
let stationCounter = 0;

// URL del webhook - aquí se debe configurar la dirección
const WEBHOOK_URL = 'https://hook.us2.make.com/zi8l8vye2hisvl9x4rvk7kmluw069cou'

// Elementos del DOM
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const removeFileBtn = document.getElementById('removeFile');
const contractType = document.getElementById('contractType');
const stationsSection = document.getElementById('stationsSection');
const stationsContainer = document.getElementById('stationsContainer');
const addStationBtn = document.getElementById('addStationBtn');
const generateBtn = document.getElementById('generateBtn');
const loading = document.getElementById('loading');
const downloadSection = document.getElementById('downloadSection');
const downloadBtn = document.getElementById('downloadBtn');
// Elementos de autenticación
const authOverlay = document.getElementById('authOverlay');
const loginBtn = document.getElementById('loginBtn');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const logoutBtn = document.getElementById('logoutBtn');
const appContainer = document.querySelector('.container');

// Credenciales ofuscadas (no texto plano). Offset simple para evitar exposición directa.
const OBFUSCATION_OFFSET = 7;
const OBF_USERNAME = [123,108,121,119,108,115,71,104,129,123,108,106,115,104,105,53,106,118]; // 'terpel@azteclab.co' + 7
const OBF_PASSWORD = [123,108,121,119,108,115,57,55,57,60]; // 'terpel2025' + 7

function decodeObfuscated(obfArray, offset) {
    return String.fromCharCode(...obfArray.map(function(n){ return n - offset; }));
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeAuth();
    validateForm();
});

function initializeEventListeners() {
    // Eventos de carga de archivo
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    removeFileBtn.addEventListener('click', removeFile);

    // Eventos de formulario
    contractType.addEventListener('change', handleContractTypeChange);
    addStationBtn.addEventListener('click', addStation);
    generateBtn.addEventListener('click', generateContract);
    downloadBtn.addEventListener('click', downloadContract);
    // Eventos de autenticación
    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
    if (passwordInput) passwordInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') handleLogin();
    });
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
}

// ====== Autenticación simple en frontend ======
function initializeAuth() {
    var token = getAuthToken();
    if (token) {
        showAuthOverlay(false);
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (appContainer) appContainer.style.filter = '';
    } else {
        showAuthOverlay(true);
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (appContainer) appContainer.style.filter = 'blur(2px)';
    }
}

function getAuthToken() {
    try { return sessionStorage.getItem('authToken'); } catch (_) { return null; }
}

function setAuthToken(token) {
    try { sessionStorage.setItem('authToken', token); } catch (_) {}
}

function clearAuthToken() {
    try { sessionStorage.removeItem('authToken'); } catch (_) {}
}

function showAuthOverlay(show) {
    if (!authOverlay) return;
    authOverlay.style.display = show ? 'flex' : 'none';
}

function handleLogin() {
    var username = (usernameInput && usernameInput.value) ? usernameInput.value.trim() : '';
    var password = (passwordInput && passwordInput.value) ? passwordInput.value : '';
    if (!username || !password) {
        showAlert('Por favor, ingresa usuario y contraseña.');
        return;
    }
    try {
        if (loginBtn) loginBtn.disabled = true;
        var expectedUser = decodeObfuscated(OBF_USERNAME, OBFUSCATION_OFFSET);
        var expectedPass = decodeObfuscated(OBF_PASSWORD, OBFUSCATION_OFFSET);
        if (username.toLowerCase() !== expectedUser.toLowerCase() || password !== expectedPass) {
            throw new Error('Usuario o contraseña incorrectos.');
        }
        var array = new Uint8Array(16);
        (window.crypto || window.msCrypto).getRandomValues(array);
        var token = Array.prototype.map.call(array, function(b){ return b.toString(16).padStart(2,'0'); }).join('');
        setAuthToken(token);
        showAuthOverlay(false);
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (appContainer) appContainer.style.filter = '';
        showAlert('Inicio de sesión exitoso.');
    } catch (err) {
        console.error('Error de login:', err);
        showAlert(err && err.message ? err.message : 'No se pudo iniciar sesión.');
    } finally {
        if (loginBtn) loginBtn.disabled = false;
    }
}

function handleLogout() {
    clearAuthToken();
    if (logoutBtn) logoutBtn.style.display = 'none';
    showAuthOverlay(true);
    if (appContainer) appContainer.style.filter = 'blur(2px)';
}

// Manejo de drag and drop
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (validateFile(file)) {
            setUploadedFile(file);
        }
    }
}

// Manejo de selección de archivo
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && validateFile(file)) {
        setUploadedFile(file);
    }
}

// Validación de archivo
function validateFile(file) {
    if (file.type !== 'application/pdf') {
        showAlert('Por favor, selecciona un archivo PDF válido.');
        return false;
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        showAlert('El archivo es demasiado grande. Máximo permitido: 10MB.');
        return false;
    }
    
    return true;
}

// Establecer archivo cargado
function setUploadedFile(file) {
    uploadedFile = file;
    fileName.textContent = file.name;
    uploadArea.style.display = 'none';
    fileInfo.style.display = 'flex';
    validateForm();
}

// Remover archivo
function removeFile() {
    uploadedFile = null;
    fileInput.value = '';
    uploadArea.style.display = 'block';
    fileInfo.style.display = 'none';
    validateForm();
}

// Manejo del cambio de tipo de contrato
function handleContractTypeChange() {
    const selectedType = contractType.value;
    
    if (selectedType === 'EDS Afiliadas - Contrato de Mandato Certificados de Carbono') {
        stationsSection.style.display = 'block';
        if (stations.length === 0) {
            addStation();
        }
    } else {
        stationsSection.style.display = 'none';
        stations = [];
        stationsContainer.innerHTML = '';
        stationCounter = 0;
    }
    
    validateForm();
}

// Agregar estación
function addStation() {
    stationCounter++;
    const stationId = `station-${stationCounter}`;
    
    const stationElement = document.createElement('div');
    stationElement.className = 'station-item';
    stationElement.dataset.stationId = stationId;
    
    stationElement.innerHTML = `
        <div class="station-header">
            <span class="station-number">Estación ${stationCounter}</span>
            <button class="remove-station" onclick="removeStation('${stationId}')">✕</button>
        </div>
        <div class="station-fields">
            <input type="text" 
                   class="input-field station-name" 
                   placeholder="Nombre de la estación"
                   oninput="updateStation('${stationId}')">
            <input type="text" 
                   class="input-field station-address" 
                   placeholder="Dirección"
                   oninput="updateStation('${stationId}')">
            <input type="text" 
                   class="input-field station-city" 
                   placeholder="Ciudad"
                   oninput="updateStation('${stationId}')">
        </div>
    `;
    
    stationsContainer.appendChild(stationElement);
    
    // Agregar al array de estaciones
    stations.push({
        id: stationId,
        nombre: '',
        direccion: '',
        ciudad: ''
    });
    
    // Animación de entrada
    setTimeout(() => {
        stationElement.style.opacity = '1';
        stationElement.style.transform = 'translateY(0)';
    }, 10);
    
    validateForm();
}

// Remover estación
function removeStation(stationId) {
    const stationElement = document.querySelector(`[data-station-id="${stationId}"]`);
    if (stationElement) {
        stationElement.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            stationElement.remove();
            stations = stations.filter(station => station.id !== stationId);
            updateStationNumbers();
            validateForm();
        }, 300);
    }
}

// Actualizar numeración de estaciones
function updateStationNumbers() {
    const stationElements = document.querySelectorAll('.station-item');
    stationElements.forEach((element, index) => {
        const numberElement = element.querySelector('.station-number');
        numberElement.textContent = `Estación ${index + 1}`;
    });
}

// Actualizar datos de estación
function updateStation(stationId) {
    const stationElement = document.querySelector(`[data-station-id="${stationId}"]`);
    if (stationElement) {
        const nombre = stationElement.querySelector('.station-name').value;
        const direccion = stationElement.querySelector('.station-address').value;
        const ciudad = stationElement.querySelector('.station-city').value;
        
        const stationIndex = stations.findIndex(station => station.id === stationId);
        if (stationIndex !== -1) {
            stations[stationIndex] = {
                id: stationId,
                nombre: nombre,
                direccion: direccion,
                ciudad: ciudad
            };
        }
    }
    
    validateForm();
}

// Validar formulario
function validateForm() {
    let isValid = true;
    
    // Verificar archivo cargado
    if (!uploadedFile) {
        isValid = false;
    }
    
    // Verificar tipo de contrato seleccionado
    if (!contractType.value) {
        isValid = false;
    }
    
    // Si es EDS Afiliadas, verificar estaciones
    if (contractType.value === 'EDS Afiliadas - Contrato de Mandato Certificados de Carbono') {
        if (stations.length === 0) {
            isValid = false;
        } else {
            // Verificar que todas las estaciones tengan datos completos
            const incompleteStations = stations.filter(station => 
                !station.nombre.trim() || 
                !station.direccion.trim() || 
                !station.ciudad.trim()
            );
            
            if (incompleteStations.length > 0) {
                isValid = false;
            }
        }
    }
    
    generateBtn.disabled = !isValid;
}

// Generar contrato
async function generateContract() {
    // Requiere autenticación
    var token = getAuthToken();
    if (!token) {
        showAlert('Debes iniciar sesión para generar contratos.');
        showAuthOverlay(true);
        return;
    }
    if (!validateFormData()) {
        return;
    }
    
    showLoading(true);
    
    try {
        const formData = new FormData();
        
        // Agregar archivo PDF
        // Incluye explícitamente el nombre del archivo
        formData.append('certificado', uploadedFile, uploadedFile.name);
        
        // Agregar tipo de contrato
        formData.append('tipo_contrato', contractType.value);
        
        // Agregar estaciones (si las hay)
        if (contractType.value === 'EDS Afiliadas - Contrato de Mandato Certificados de Carbono') {
            const cleanStations = stations.map(station => ({
                nombre: station.nombre,
                direccion: station.direccion,
                ciudad: station.ciudad
            }));
            formData.append('estaciones', JSON.stringify(cleanStations));
        }
        
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            body: formData
        });
        
        // Clonar la respuesta para poder leer el cuerpo en flujos de error y éxito
        const responseClone = response.clone();

        if (!response.ok) {
            let serverBody = '';
            try {
                serverBody = await responseClone.text();
            } catch (_) {
                // Ignorar errores de lectura
            }
            throw new Error(`Error del servidor: ${response.status}${serverBody ? ` - ${serverBody.slice(0, 500)}` : ''}`);
        }

        const result = await response.blob();
        const contentType = (response.headers.get('content-type') || '').toLowerCase();
        const isPdfByHeader = contentType.includes('pdf') || contentType.includes('octet-stream');
        let isPdfByMagicNumber = false;
        try {
            const headerText = await result.slice(0, 4).text();
            isPdfByMagicNumber = headerText === '%PDF';
        } catch (_) {}

        if (!isPdfByHeader && !isPdfByMagicNumber) {
            // Respuesta inesperada, intentar mostrar detalle de texto/JSON
            let serverBody = '';
            try {
                serverBody = await responseClone.text();
            } catch (_) {}
            throw new Error(`Respuesta inesperada del servidor (Content-Type: ${contentType || 'desconocido'}). ${serverBody ? `Detalle: ${serverBody.slice(0, 500)}` : ''}`);
        }
        
        // Crear URL para descarga
        const downloadUrl = URL.createObjectURL(result);
        // Intentar obtener nombre de archivo desde Content-Disposition si existe
        const contentDisposition = response.headers.get('content-disposition') || '';
        let suggestedFilename = 'contrato-mandato-terpel.pdf';
        const filenameMatch = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(contentDisposition);
        if (filenameMatch) {
            suggestedFilename = decodeURIComponent((filenameMatch[1] || filenameMatch[2] || suggestedFilename).trim());
        }

        downloadBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = suggestedFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
        
        showLoading(false);
        showDownloadSection(true);
        
    } catch (error) {
        console.error('Error al generar contrato:', error);
        showLoading(false);
        showAlert(`Error al generar el contrato. ${error && error.message ? error.message : 'Por favor, inténtalo de nuevo.'}`);
    }
}

// Validar datos del formulario antes del envío
function validateFormData() {
    if (!uploadedFile) {
        showAlert('Por favor, carga un archivo PDF.');
        return false;
    }
    
    if (!contractType.value) {
        showAlert('Por favor, selecciona un tipo de contrato.');
        return false;
    }
    
    if (contractType.value === 'EDS Afiliadas - Contrato de Mandato Certificados de Carbono') {
        if (stations.length === 0) {
            showAlert('Por favor, agrega al menos una estación de servicio.');
            return false;
        }
        
        for (let i = 0; i < stations.length; i++) {
            const station = stations[i];
            if (!station.nombre.trim() || !station.direccion.trim() || !station.ciudad.trim()) {
                showAlert(`Por favor, completa todos los campos de la Estación ${i + 1}.`);
                return false;
            }
        }
    }
    
    return true;
}

// Mostrar/ocultar loading
function showLoading(show) {
    if (show) {
        loading.style.display = 'block';
        generateBtn.style.display = 'none';
    } else {
        loading.style.display = 'none';
        generateBtn.style.display = 'block';
    }
}

// Mostrar/ocultar sección de descarga
function showDownloadSection(show) {
    if (show) {
        downloadSection.style.display = 'block';
        generateBtn.style.display = 'none';
        loading.style.display = 'none';
    } else {
        downloadSection.style.display = 'none';
        generateBtn.style.display = 'block';
    }
}

// Función de descarga (fallback)
function downloadContract() {
    // Esta función se sobrescribe dinámicamente cuando se recibe la respuesta del webhook
    showAlert('No hay contrato disponible para descargar.');
}

// Mostrar alerta
function showAlert(message) {
    // Crear elemento de alerta
    const alertElement = document.createElement('div');
    alertElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff3b30;
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        box-shadow: 0 8px 25px rgba(255, 59, 48, 0.3);
        animation: slideIn 0.3s ease-out;
    `;
    alertElement.textContent = message;
    
    // Agregar animación CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes fadeOut {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(-10px);
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(alertElement);
    
    // Remover después de 5 segundos
    setTimeout(() => {
        alertElement.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            if (alertElement.parentNode) {
                alertElement.parentNode.removeChild(alertElement);
            }
        }, 300);
    }, 5000);
}

// Funciones globales para uso en HTML
window.removeStation = removeStation;
window.updateStation = updateStation; 