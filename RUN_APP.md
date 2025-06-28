# 🛠️ GoGlam — Local Setup (Windows)

This guide helps you set up and run the **GoGlam** virtual makeup try-on app on a Windows machine.

---

## 📦 Step 1: Install Node.js

1. Go to: https://nodejs.org  
2. Download and install the **LTS version** for Windows  
3. Confirm installation:

```bash
node -v
npm -v
```

---

## 🖥️ Step 2: Install VS Code

1. Go to: https://code.visualstudio.com  
2. Download and install **Visual Studio Code for Windows**

---

## 📁 Step 3: Install the Project

1. Open **Command Prompt** or **PowerShell**
2. Navigate to your project folder:

```bash
cd path\to\your\goglam
```

3. Install dependencies:

```bash
npm install
```

---

## 🚀 Step 4: Run the Project

Start development server:

```bash
npm run dev
```

Open in browser:

```
http://localhost:8080 
or specified by vite in terminal
```

---

## 🏗️ Step 5: Production Build (Optional)

To build the project:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```
