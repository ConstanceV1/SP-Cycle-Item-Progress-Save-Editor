'use strict';
const {app,dialog}=require('electron');
class AutoUpdater {
 constructor(){
  this.checking=null;
  if(!app.isPackaged||process.env.PORTABLE_EXECUTABLE_FILE)return;
  const {autoUpdater}=require('electron-updater');this.updater=autoUpdater;
  autoUpdater.setFeedURL({provider:'github',owner:'ConstanceV1',repo:'SP-Cycle-Item-Progress-Save-Editor'});
  autoUpdater.autoDownload=false;autoUpdater.autoInstallOnAppQuit=false;
  autoUpdater.on('error',e=>console.error('Editor update:',e.message));
 }
 async checkForUpdates(show=false){
  if(!this.updater){if(show)await dialog.showMessageBox({type:'info',message:'Automatic updates require the Setup-installed Editor.',buttons:['OK']});return;}
  if(this.checking)return this.checking;
  this.checking=(async()=>{try{
   const result=await this.updater.checkForUpdates();
   if(!result?.isUpdateAvailable){if(show)await dialog.showMessageBox({message:'No newer Editor update is available.'});return;}
   const answer=await dialog.showMessageBox({type:'question',message:'Download Editor '+result.updateInfo.version+'?',detail:'Finish and save any edits before continuing.',buttons:['Download','Later'],cancelId:1});
   if(answer.response!==0)return;
   await this.updater.downloadUpdate();
   const install=await dialog.showMessageBox({message:'Verified Editor update downloaded. Close and install now?',buttons:['Install','Later'],cancelId:1});
   if(install.response===0)this.updater.quitAndInstall(false,true);
  }catch(e){console.error(e);if(show)dialog.showErrorBox('Editor update unavailable','The update service could not be reached or its release metadata is incomplete. Your installed Editor is unchanged. Try again later.');}finally{this.checking=null;}})();
  return this.checking;
 }
}
module.exports=AutoUpdater;
AutoUpdater.prototype.checkForUpdatesManually = function(){ return this.checkForUpdates(true); };
