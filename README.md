# Generador de Contratos de Mandato Terpel

Una aplicación web moderna y minimalista para generar contratos de mandato de certificados de carbono de Terpel. Inspirada en el diseño de WeTransfer y Apple, utiliza únicamente tecnologías web estándar: HTML, CSS y JavaScript puro.

## 🎨 Características de Diseño

- **Estética moderna y minimalista** inspirada en WeTransfer y Apple
- **Fondo de alta calidad** con imagen de estación de gasolina de Unsplash
- **Interfaz responsiva** que se adapta a diferentes dispositivos
- **Animaciones suaves** y transiciones elegantes
- **Tipografía moderna** utilizando la fuente del sistema Apple
- **Colores profesionales** con esquema de colores azul (#007aff)

## ⚡ Funcionalidades

### Carga de Archivos
- **Drag & Drop** intuitivo para cargar archivos PDF
- **Validación automática** de tipo de archivo y tamaño (máx. 10MB)
- **Vista previa** del archivo cargado con opción de eliminación

### Tipos de Contrato
1. **Industria - Contrato de Mandato Certificados de Carbono**
2. **EDS Afiliadas - Contrato de Mandato Certificados de Carbono**

### Gestión Dinámica de Estaciones (Solo para EDS Afiliadas)
- **Agregar/eliminar estaciones** dinámicamente
- **Campos requeridos** para cada estación:
  - Nombre de la estación
  - Dirección
  - Ciudad
- **Validación en tiempo real** de todos los campos

### Generación y Descarga
- **Envío seguro** a webhook configurado
- **Indicador de carga** durante el procesamiento
- **Descarga automática** del contrato generado

## 🚀 Instalación

1. **Clona o descarga** los archivos del proyecto
2. **Abre** `index.html` en tu navegador web
3. **Configura** la URL del webhook en `script.js`

## ⚙️ Configuración del Webhook

Para que la aplicación funcione correctamente, debes configurar la URL de tu webhook en el archivo `script.js`:

```javascript
// URL del webhook - aquí se debe configurar la dirección
const WEBHOOK_URL = 'https://tu-servidor.com/generate-contract';
```

### Datos Enviados al Webhook

El webhook recibirá los siguientes datos via POST con `FormData`:

#### Para todos los contratos:
- `certificado`: Archivo PDF del certificado de existencia y representación legal
- `tipo_contrato`: String con el tipo de contrato seleccionado

#### Para contratos EDS Afiliadas (adicional):
- `estaciones`: JSON string con array de estaciones de servicio:
```json
[
  {
    "nombre": "Estación Centro",
    "direccion": "Calle 123 #45-67",
    "ciudad": "Bogotá"
  },
  {
    "nombre": "Estación Norte",
    "direccion": "Carrera 45 #123-89",
    "ciudad": "Medellín"
  }
]
```

### Respuesta Esperada del Webhook

El webhook debe responder con:
- **Content-Type**: `application/pdf`
- **Body**: El archivo PDF del contrato generado

## 📁 Estructura del Proyecto

```
proyecto/
├── index.html          # Estructura principal de la página
├── styles.css          # Estilos y diseño visual
├── script.js           # Funcionalidad JavaScript
└── README.md          # Documentación del proyecto
```

## 🌐 Compatibilidad

- **Navegadores modernos** (Chrome, Firefox, Safari, Edge)
- **Dispositivos móviles** (iOS, Android)
- **Sin dependencias externas** - funciona offline (excepto la imagen de fondo)

## 🔧 Personalización

### Cambiar Imagen de Fondo
Modifica la URL en `styles.css`:
```css
background: url('TU_IMAGEN_URL') center/cover no-repeat;
```

### Modificar Colores
Los colores principales se encuentran en `styles.css`:
- **Azul principal**: `#007aff`
- **Azul hover**: `#0051d5`
- **Texto principal**: `#1d1d1f`
- **Texto secundario**: `#86868b`

### Agregar Nuevos Tipos de Contrato
Modifica el elemento `<select>` en `index.html` y ajusta la lógica en `script.js`.

## 📱 Responsive Design

La aplicación está optimizada para:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (320px - 767px)

## 🛡️ Seguridad

- **Validación client-side** de archivos PDF
- **Límite de tamaño** de archivo (10MB)
- **Sanitización** de datos antes del envío
- **Manejo de errores** robusto

## 🎯 Experiencia de Usuario

- **Feedback visual** inmediato en todas las interacciones
- **Mensajes de error** claros y específicos
- **Estados de carga** con indicadores animados
- **Validación en tiempo real** del formulario
- **Transiciones suaves** entre estados

---

**Desarrollado con 💙 utilizando tecnologías web estándar** 