# 🚀 Sistema de Acreditación - LIDERAZGO LAB 2026

Sistema de acreditación y control de acceso en tiempo real desarrollado con **Next.js 14 (App Router)**, **Tailwind CSS**, **Google Sheets API** y diseño visual adaptado del afiche oficial del evento.

---

## 📱 Características

- **100% Responsivo**: Diseñado para funcionar impecablemente en computadores, tablets (iPad/Android) y smartphones (iPhone/Android).
- **Entrada Rápida de RUT**: Formateo automático de RUT chileno en tiempo real con validación de dígito verificador.
- **Acciones Rápidas de Acreditación**: Botón 'Asistió' con animación de confetti y confirmación visual inmediata.
- **Registro de Emergencia**: Formulario integrado cuando un asistente no aparece en la lista de inscritos.
- **Estadísticas en Vivo**: Conteo de acreditados, porcentaje de asistencia y distribución por tipo de entrada.
- **Sincronización con Google Sheets**: Conexión directa mediante Google Sheets API v4.

---

## ☁️ Guía de Despliegue en Vercel

Puedes desplegar este proyecto en **Vercel** en menos de 2 minutos:

### Paso 1: Subir el proyecto a GitHub
1. Inicializa git en este directorio:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Sistema Acreditacion Liderazgo Lab"
   ```
2. Crea un repositorio en GitHub y sube el código:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/liderazgo-lab-acreditacion.git
   git branch -M main
   git push -u origin main
   ```

### Paso 2: Importar en Vercel
1. Ingresa a [https://vercel.com](https://vercel.com) e inicia sesión con GitHub.
2. Haz clic en **"Add New..." ➔ "Project"** y selecciona tu repositorio.

### Paso 3: Configurar Variables de Entorno en Vercel
En la sección **Environment Variables** de Vercel, agrega las siguientes 3 variables:

| Nombre de Variable | Valor |
| :--- | :--- |
| `GOOGLE_CLIENT_EMAIL` | `plataforma-liderazgo@cumbre-liderazgo-506117.iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | *(Pega el contenido completo de tu Private Key con las líneas BEGIN y END)* |
| `SPREADSHEET_ID` | `1ukcNSduM2345SG6kY3538M3WtHk1TDFMrwIXZR0QYGA` |

> 💡 **Tip para Vercel**: Puedes pegar la clave privada con saltos de línea reales o con `\n`, el sistema la procesa automáticamente.

### Paso 4: Desplegar
Haz clic en **"Deploy"**. Vercel compilará la aplicación y te entregará una URL pública segura (con SSL HTTPS) lista para usar en todos los dispositivos de la entrada del evento.

---

## 💻 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Correr servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
npm start
```
