## Version 2.1.1

Download **SP-Cycle-Editor-Setup-v2.1.1.exe** from Releases for the normal installation. The portable EXE is optional. `latest.yml` and `.blockmap` are updater files; players do not need to open them.

This Editor edits **regular SPCycle**, not campaign checkpoints. Close the game before saving changes. Select the correct player ID when the database contains multiple players. Existing documents are backed up before changes under the Editor user-data folder's `backups` directory.

Setup-installed 2.1.1 checks for updates automatically and asks before downloading and installing them. Older builds have inconsistent update-repository settings: install 2.1.1 manually once. Portable builds require manual replacement. Future Setup updates require the installer and matching `latest.yml`/blockmap release files.

The API now binds to 127.0.0.1, requires the desktop session token, and rejects untrusted browser origins. Start the desktop application with `npm start`; opening an arbitrary browser tab is no longer an authenticated editing session.

Validation: isolated API and mock-database tests; source/packaged-file comparison; Windows Setup and portable builds. Real player-database writes and an actual in-place Windows installation have not been exercised.

---
# 🔧 The Cycle: Reborn - Save Editor

<div align="center">

![The Cycle: Reborn Save Editor](https://img.shields.io/badge/The%20Cycle-Reborn%20Save%20Editor-64ffda?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjNjRmZmRhIi8+Cjwvc3ZnPg==)

**A powerful desktop application for editing The Cycle: Reborn save files through MongoDB**

[📥 **DOWNLOAD LATEST VERSION**](https://github.com/ConstanceV1/SP-Cycle-Item-Progress-Save-Editor/releases/latest) | [🐛 Report Bug](https://github.com/ConstanceV1/SP-Cycle-Item-Progress-Save-Editor/issues) | [💡 Request Feature](https://github.com/ConstanceV1/SP-Cycle-Item-Progress-Save-Editor/issues)

</div>

---

## ✨ Features

### 🎒 **Inventory Management**
- **Edit Stash Items**: Add, remove, or modify any item in your stash
- **Smart Stacking**: Automatically handles item stack limits and splitting
- **Item Search**: Quickly find items by name or ID
- **Category Filtering**: Filter by weapons, ammo, armor, consumables, materials, tools, and attachments
- **Visual Interface**: Beautiful item icons with rarity-based color coding

### 💰 **Currency Editor**
- **Edit Aurum** (Premium currency)
- **Edit K-Marks** (Standard currency) 
- **Edit Insurance Credits**
- **Real-time Updates**: Changes save automatically

### 🔧 **Advanced Features**
- **Item Durability**: Adjust weapon and armor durability
- **Stack Management**: Handles proper item stacking automatically
- **Backup & Restore**: Export and import your save data
- **Auto-Save**: Changes are automatically saved to your database
- **Error Handling**: Graceful handling of missing images and data

### 🎨 **User Experience**
- **Modern UI**: Sleek, game-inspired interface
- **Responsive Design**: Clean layout that scales to your screen
- **Visual Feedback**: Hover effects, animations, and status indicators
- **Item Details**: Click items to view and edit detailed information

---

## 🚀 Quick Start

### **Step 1: Download**
📥 **[Download the latest release](https://github.com/ConstanceV1/SP-Cycle-Item-Progress-Save-Editor/releases/latest)**

### **Step 2: Setup MongoDB**
The save editor connects to your local MongoDB database automatically where The Cycle: Reborn stores save data.

### **Step 3: Run the Editor**
1. **Extract** the downloaded zip file
2. **Run** `The Cycle Reborn Save Editor.exe`
3. **Auto-Connect** - The application will automatically connect to your MongoDB
4. **Start Editing** - Your inventory will load automatically!

---

## 📖 How to Use

### **Managing Your Inventory**

#### **Adding Items**
1. Click **"Browse Items"** in the sidebar
2. Use **category filters** or **search** to find items
3. Set the **quantity** you want
4. Click **"Add"** to add items to your stash

#### **Editing Existing Items**
1. **Click on any item** in your inventory
2. **Modify quantity** or **durability** (for weapons/armor)
3. Click **"Update"** to save changes
4. Or click **"Remove"** to delete the item

#### **Managing Currency**
1. **Click on any currency value** in the top-right header
2. **Type the new amount** you want
3. **Press Enter** or **click away** - changes save automatically!

### **Categories & Filtering**

| Category | Items |
|----------|-------|
| 🔫 **Weapons** | All firearms, melee weapons |
| 📦 **Ammo** | Light, Medium, Heavy, Shotgun, Special ammo |
| 🛡️ **Armor** | Helmets, shields, vests, backpacks |
| 💊 **Consumables** | Stims, medkits, grenades, utilities |
| ⚙️ **Materials** | Crafting materials, quest items, currencies |
| 🔧 **Tools** | Mining tools, scanners, utilities |
| 🎯 **Attachments** | Weapon mods, optics, magazines |

### **Backup & Safety**

#### **Export Backup**
- Click **"Export Backup"** to save your current inventory
- Saves as a JSON file with timestamp
- **Always backup before major changes!**

#### **Import Backup**  
- Click **"Import Backup"** to restore a previous save
- Select your backup JSON file
- Confirms before overwriting current data

---

## ⚠️ Important Notes

### **Safety First**
- 🔒 **Always backup your save** before making major changes
- 🎮 **Close the game** before using the editor
- 💾 **Auto-save is enabled** - changes are saved automatically

### **Compatibility**
- ✅ **Windows 10/11** (Primary support)
- ✅ **MongoDB 4.0+** required
- ✅ **The Cycle: Reborn** (Latest version)

### **Limitations**
- ⚠️ **Stash editing only** - Cannot edit equipped items or loadouts
- ⚠️ **Local saves only** - Requires MongoDB access
- ⚠️ **Single player focus** - Designed for offline/local saves

---

## 🛠️ Troubleshooting

<details>
<summary><strong>❌ "Connection Failed" Error</strong></summary>

**Possible Solutions:**
1. **Install MongoDB** - Download from [mongodb.com](https://www.mongodb.com/try/download/community)
2. **Start MongoDB Service** - Check Windows Services for "MongoDB Server"
3. **Check Port 27017** - Ensure MongoDB is running on default port
4. **Firewall** - Allow MongoDB through Windows Firewall

</details>

<details>
<summary><strong>📦 "No Inventory Found" Error</strong></summary>

**Possible Solutions:**
1. **Play the game first** - Create a character and enter the game once
2. **Check database** - Ensure ProspectDb exists in MongoDB
3. **Verify save location** - Editor searches for standard save locations
4. **Try reloading** - Click the reload button in the header

</details>

<details>
<summary><strong>🖼️ Missing Item Images</strong></summary>

**This is normal! As I am still developing the rest of the Application** The editor includes placeholder images for items without icons. The functionality works perfectly - icons are just visual enhancements.

</details>

<details>
<summary><strong>💾 Changes Not Saving</strong></summary>

**Check:**
1. **MongoDB connection** - Green indicator in bottom-right
2. **Game is closed** - Close The Cycle: Reborn completely
3. **Database permissions** - Run as administrator if needed
4. **Auto-save indicator** - Should show "Auto-saved!" briefly

</details>

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

- 🐛 **Report bugs** in the [Issues section](https://github.com/ConstanceV1/SP-Cycle-Item-Progress-Save-Editor/issues)
- 💡 **Suggest features** or improvements
- 📝 **Improve documentation**
- 🔧 **Submit pull requests** with fixes or enhancements

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## ⚡ Disclaimer

**This is an unofficial tool** created by the community for The Cycle: Reborn players. 

- ✅ **Use at your own risk** - Always backup your saves
- ✅ **Single-player focused** - Designed for offline/local play
- ✅ **No game modification** - Only edits save data through standard database access
- ✅ **Educational purpose** - Learn about game data structures and MongoDB

---

<div align="center">

**Made with ❤️ by the community, for the community**

⭐ **Star this repo** if you find it useful! ⭐

[![GitHub stars](https://img.shields.io/github/stars/lxjo101/TheCycleRebornEditor?style=social)](https://github.com/ConstanceV1/SP-Cycle-Item-Progress-Save-Editor/stargazers)

</div>
