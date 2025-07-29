# 🛠️ Repetito CI Scripts

> **Quick Reference**: Manual CI/CD scripty pro Repetito template

## 🚀 **Quick Start**

### **Quality Check & Fix**

```bash
# Comprehensive quality check
npm run quality

# Auto-fix common issues
npm run fix

# Pre-commit verification
npm run pre-commit
```

### **Development Builds**

```bash
# iOS development build
npm run ci:build development ios

# Android development build
npm run ci:build development android

# Both platforms
npm run ci:build development both
```

### **Deployment**

```bash
# OTA update
npm run ci:deploy update main "Feature: New study mode"

# Store submission
npm run ci:deploy submit both

# Complete release
npm run ci:deploy release patch both
```

## 🔧 **Script Details**

### **build.sh**

- Orchestruje EAS builds s quality checks
- Podporuje development, preview, production profily
- Automatické dependency installation a environment verification

### **test.sh**

- ESLint, TypeScript, Prettier, security checks
- Quality reports generation
- Auto-fix functionality

### **deploy.sh**

- OTA updates přes EAS Update
- Store submissions přes EAS Submit
- Complete release workflow s version bumping

## 📱 **Platform Support**

- **iOS**: App Store builds a submissions
- **Android**: Google Play builds a submissions
- **Both**: Parallel processing obou platforem

## 🎯 **Template Ready**

Všechny scripty jsou připravené k použití s:

- ✅ Error handling a colored output
- 📊 Progress reporting
- 🔒 Security best practices
- 📚 Comprehensive documentation

---

> **Tip**: Všechny scripty mají built-in help - spusť bez argumentů pro usage instructions!
