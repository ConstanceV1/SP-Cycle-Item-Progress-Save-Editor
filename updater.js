// updater.js - Auto-updater module
const { dialog, shell, app } = require('electron');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class AutoUpdater {
    constructor(options = {}) {
        // UPDATED: Use your new GitHub repo
        this.githubOwner = options.githubOwner || 'ConstanceV1';
        this.githubRepo = options.githubRepo || 'SPCycle-Editor';
        this.currentVersion = app.getVersion();
        this.updateCheckUrl = `https://api.github.com/repos/${this.githubOwner}/${this.githubRepo}/releases/latest`;
        this.downloadDir = path.join(app.getPath('temp'), 'app-updates');
        this.isUpdating = false;
        this.skippedVersions = new Set(); // Track skipped versions
    }

    // Check for updates on startup
    async checkForUpdates(showNoUpdateDialog = false) {
        if (this.isUpdating) return;

        try {
            console.log('🔍 Checking for updates...');
            const latestRelease = await this.getLatestRelease();
            
            if (!latestRelease) {
                if (showNoUpdateDialog) {
                    this.showNoUpdateDialog();
                }
                return;
            }

            // Check if this version was skipped
            if (this.skippedVersions.has(latestRelease.tag_name)) {
                console.log(`⏭️ Skipping version ${latestRelease.tag_name} (user chose to skip)`);
                return;
            }

            const isNewVersion = this.compareVersions(latestRelease.tag_name, this.currentVersion);
            
            if (isNewVersion) {
                console.log(`🆕 New version available: ${latestRelease.tag_name}`);
                await this.promptUpdate(latestRelease);
            } else if (showNoUpdateDialog) {
                this.showNoUpdateDialog();
            } else {
                console.log('✅ Already on latest version');
            }
        } catch (error) {
            console.error('❌ Error checking for updates:', error);
            if (showNoUpdateDialog) {
                this.showUpdateError(error.message);
            }
        }
    }

    // Get latest release from GitHub API
    getLatestRelease() {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.github.com',
                path: `/repos/${this.githubOwner}/${this.githubRepo}/releases/latest`,
                method: 'GET',
                headers: {
                    'User-Agent': 'SPCycle-Editor-AutoUpdater',
                    'Accept': 'application/vnd.github.v3+json'
                }
            };

            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        if (res.statusCode === 200) {
                            const release = JSON.parse(data);
                            resolve(release);
                        } else if (res.statusCode === 404) {
                            console.log('📭 No releases found');
                            resolve(null);
                        } else {
                            reject(new Error(`GitHub API returned status ${res.statusCode}`));
                        }
                    } catch (error) {
                        reject(new Error('Failed to parse GitHub API response'));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`Network error: ${error.message}`));
            });

            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            req.end();
        });
    }

    // Compare version strings (returns true if newVersion is newer)
    compareVersions(newVersion, currentVersion) {
        // Remove 'v' prefix if present
        const cleanNew = newVersion.replace(/^v/, '');
        const cleanCurrent = currentVersion.replace(/^v/, '');

        const newParts = cleanNew.split('.').map(num => parseInt(num, 10));
        const currentParts = cleanCurrent.split('.').map(num => parseInt(num, 10));

        const maxLength = Math.max(newParts.length, currentParts.length);
        while (newParts.length < maxLength) newParts.push(0);
        while (currentParts.length < maxLength) currentParts.push(0);

        for (let i = 0; i < maxLength; i++) {
            if (newParts[i] > currentParts[i]) return true;
            if (newParts[i] < currentParts[i]) return false;
        }

        return false;
    }

    // Show update prompt dialog
    async promptUpdate(release) {
        const response = await dialog.showMessageBox(null, {
            type: 'info',
            title: '🆕 Update Available',
            message: `A new version (${release.tag_name}) is available!`,
            detail: `Current version: v${this.currentVersion}\nNew version: ${release.tag_name}\n\n${release.body || 'Click "Update Now" to download and install the latest version.'}`,
            buttons: ['Update Now', 'Skip This Version', 'Remind Me Later'],
            defaultId: 0,
            cancelId: 2
        });

        switch (response.response) {
            case 0: // Update Now
                await this.downloadAndInstallUpdate(release);
                break;
            case 1: // Skip This Version
                this.skippedVersions.add(release.tag_name);
                console.log(`⏭️ Skipped version ${release.tag_name}`);
                break;
            case 2: // Remind Me Later
                // Do nothing, will check again next startup
                break;
        }
    }

    // Download and install update
    async downloadAndInstallUpdate(release) {
        this.isUpdating = true;

        try {
            const asset = this.findUpdateAsset(release.assets);
            
            if (!asset) {
                throw new Error('No compatible update file found for your platform');
            }

            console.log(`📥 Downloading: ${asset.name}`);

            const progressDialog = this.showDownloadDialog();

            if (!fs.existsSync(this.downloadDir)) {
                fs.mkdirSync(this.downloadDir, { recursive: true });
            }

            const downloadPath = path.join(this.downloadDir, asset.name);

            await this.downloadFile(asset.browser_download_url, downloadPath, (progress) => {
                console.log(`⬇️ Download progress: ${progress}%`);
                // Update progress window if needed
                if (progressDialog && progressDialog.webContents) {
                    progressDialog.webContents.executeJavaScript(`
                        document.getElementById('progress').style.width = '${progress}%';
                        document.getElementById('progress-text').textContent = '${progress}%';
                    `);
                }
            });

            progressDialog.close();

            const installResponse = await dialog.showMessageBox(null, {
                type: 'question',
                title: 'Install Update',
                message: '✅ Download completed! Install update now?',
                detail: 'The application will close and the new version will start automatically.',
                buttons: ['Install Now', 'Install Later'],
                defaultId: 0
            });

            if (installResponse.response === 0) {
                await this.installUpdate(downloadPath);
            }

        } catch (error) {
            console.error('❌ Update error:', error);
            dialog.showErrorBox('Update Failed', `Failed to update: ${error.message}`);
        } finally {
            this.isUpdating = false;
        }
    }

    // Find the appropriate asset for the current platform
    findUpdateAsset(assets) {
        if (process.platform === 'win32') {
            // Look for your specific EXE patterns
            return assets.find(asset => 
                asset.name.includes('SP-Cycle-Editor') && 
                asset.name.includes('.exe') &&
                !asset.name.includes('Setup') // Avoid installer, use portable
            ) || assets.find(asset => 
                asset.name.includes('.exe') && 
                !asset.name.includes('Setup') // Fallback to any non-setup EXE
            ) || assets.find(asset => 
                asset.name.includes('.exe') // Last resort
            );
        } else if (process.platform === 'darwin') {
            return assets.find(asset => 
                asset.name.includes('.dmg') || asset.name.includes('.app')
            );
        } else if (process.platform === 'linux') {
            return assets.find(asset => 
                asset.name.includes('.AppImage') || 
                asset.name.includes('.deb') || 
                asset.name.includes('.tar.gz')
            );
        }
        
        return null;
    }

    // Download file with progress
    downloadFile(url, outputPath, progressCallback) {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(outputPath);
            let downloadedBytes = 0;
            let totalBytes = 0;

            const request = https.get(url, (response) => {
                if (response.statusCode === 302 || response.statusCode === 301) {
                    return this.downloadFile(response.headers.location, outputPath, progressCallback)
                        .then(resolve)
                        .catch(reject);
                }

                if (response.statusCode !== 200) {
                    reject(new Error(`Download failed with status ${response.statusCode}`));
                    return;
                }

                totalBytes = parseInt(response.headers['content-length'], 10) || 0;

                response.on('data', (chunk) => {
                    downloadedBytes += chunk.length;
                    file.write(chunk);
                    
                    if (progressCallback && totalBytes > 0) {
                        const progress = Math.round((downloadedBytes / totalBytes) * 100);
                        progressCallback(progress);
                    }
                });

                response.on('end', () => {
                    file.end();
                    resolve();
                });

                response.on('error', (error) => {
                    file.destroy();
                    fs.unlink(outputPath, () => {});
                    reject(error);
                });
            });

            request.on('error', (error) => {
                file.destroy();
                fs.unlink(outputPath, () => {});
                reject(error);
            });

            request.setTimeout(60000, () => {
                request.destroy();
                file.destroy();
                fs.unlink(outputPath, () => {});
                reject(new Error('Download timeout'));
            });

            request.end();
        });
    }

    // Install the update
    async installUpdate(updatePath) {
        try {
            const currentExePath = process.execPath;
            const backupPath = currentExePath + '.backup';
            const newExePath = currentExePath + '.new';

            fs.copyFileSync(updatePath, newExePath);

            if (process.platform === 'win32') {
                const batchScript = this.createWindowsUpdateScript(currentExePath, newExePath, backupPath);
                const batchPath = path.join(this.downloadDir, 'update.bat');
                fs.writeFileSync(batchPath, batchScript);

                spawn('cmd.exe', ['/c', batchPath], {
                    detached: true,
                    stdio: 'ignore'
                });

                app.quit();
            } else {
                const shellScript = this.createUnixUpdateScript(currentExePath, newExePath, backupPath);
                const scriptPath = path.join(this.downloadDir, 'update.sh');
                fs.writeFileSync(scriptPath, shellScript);
                fs.chmodSync(scriptPath, '755');

                spawn('sh', [scriptPath], {
                    detached: true,
                    stdio: 'ignore'
                });

                app.quit();
            }
        } catch (error) {
            throw new Error(`Failed to install update: ${error.message}`);
        }
    }

    createWindowsUpdateScript(currentPath, newPath, backupPath) {
        return `@echo off
echo Updating SP Cycle Editor...
timeout /t 3 /nobreak > nul
move "${currentPath}" "${backupPath}"
move "${newPath}" "${currentPath}"
start "" "${currentPath}"
timeout /t 3 /nobreak > nul
del "${backupPath}"
del "%~f0"`;
    }

    createUnixUpdateScript(currentPath, newPath, backupPath) {
        return `#!/bin/sh
echo "Updating SP Cycle Editor..."
sleep 3
mv "${currentPath}" "${backupPath}"
mv "${newPath}" "${currentPath}"
chmod +x "${currentPath}"
"${currentPath}" &
sleep 3
rm -f "${backupPath}"
rm -f "$0"`;
    }

    showDownloadDialog() {
        const { BrowserWindow } = require('electron');
        const progressWindow = new BrowserWindow({
            width: 400,
            height: 150,
            resizable: false,
            minimizable: false,
            maximizable: false,
            modal: true,
            show: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        progressWindow.loadURL(`data:text/html;charset=utf-8,
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        padding: 20px;
                        text-align: center;
                        background: #1a1a2e;
                        color: #e0e0e0;
                        margin: 0;
                    }
                    h2 { color: #64ffda; font-weight: 300; }
                    .progress-bar {
                        width: 100%;
                        height: 20px;
                        background: #2d2d44;
                        border-radius: 10px;
                        overflow: hidden;
                        margin: 20px 0;
                    }
                    .progress-fill {
                        height: 100%;
                        background: linear-gradient(135deg, #64ffda 0%, #4fd1c7 100%);
                        width: 0%;
                        transition: width 0.3s ease;
                        border-radius: 10px;
                    }
                    #progress-text {
                        font-size: 14px;
                        color: #a0aec0;
                    }
                </style>
            </head>
            <body>
                <h2>⬇️ Downloading Update</h2>
                <div class="progress-bar">
                    <div class="progress-fill" id="progress"></div>
                </div>
                <p id="progress-text">0%</p>
                <p style="font-size: 12px; color: #718096;">Please wait while the update is downloaded...</p>
            </body>
            </html>
        `);

        progressWindow.show();
        return progressWindow;
    }

    skipVersion(version) {
        this.skippedVersions.add(version);
        console.log(`⏭️ Skipped version ${version}`);
    }

    showNoUpdateDialog() {
        dialog.showMessageBox(null, {
            type: 'info',
            title: '✅ No Updates Available',
            message: 'You are running the latest version!',
            detail: `Current version: v${this.currentVersion}`,
            buttons: ['OK']
        });
    }

    showUpdateError(message) {
        dialog.showErrorBox('Update Check Failed', `Could not check for updates: ${message}`);
    }

    async checkForUpdatesManually() {
        await this.checkForUpdates(true);
    }
}

module.exports = AutoUpdater;