import { dialog } from 'electron';
/* eslint-disable promise/catch-or-return */
import electronUpdater from 'electron-updater';
import logger from './logger';

// Original legacy/unused async updater check commented out in the codebase:
// export default async function checkForUpdates() {
//   electronUpdater.autoUpdater.logger = {
//     info: (mes) => logger.info(mes),
//     warn: (mes) => logger.warn(mes),
//     error: (mes) => logger.error(mes),
//     debug: (mes) => logger.debug(mes)
//   };
//   electronUpdater.autoUpdater.autoDownload = false;
//   // electronUpdater.autoUpdater.forceDevUpdateConfig = IS_DEVELOPMENT;

//   const result = await electronUpdater.autoUpdater.checkForUpdatesAndNotify();

//   return result;
// }

electronUpdater.autoUpdater.autoDownload = false;

let isManualCheck = false;

electronUpdater.autoUpdater.on('error', (error) => {
  logger.error('Auto-updater error:', error);
  // Only show error boxes to the user for manual update checks, not automatic startup checks.
  if (isManualCheck) {
    dialog.showErrorBox('Error: ', error == null ? 'unknown' : (error.stack || error).toString());
  }
});

electronUpdater.autoUpdater.on('update-available', () => {
  dialog
    .showMessageBox({
      type: 'info',
      title: 'Found Updates',
      message: 'Found updates, do you want update now?',
      buttons: ['Sure', 'No']
    })
    .then((buttonIndex) => {
      if (buttonIndex.response === 0) {
        electronUpdater.autoUpdater.downloadUpdate();
      }
    });
});

electronUpdater.autoUpdater.on('update-not-available', () => {
  logger.info('No updates available.');
  // Only show "No Updates" popup dialog if checked manually, so startup check remains silent.
  if (isManualCheck) {
    dialog.showMessageBox({
      title: 'No Updates',
      message: 'Current version is up-to-date.'
    });
  }
});

electronUpdater.autoUpdater.on('update-downloaded', () => {
  dialog
    .showMessageBox({
      title: 'Install Updates',
      message: 'Updates downloaded, application will be quit for update...'
    })
    .then(() => {
      setImmediate(() => electronUpdater.autoUpdater.quitAndInstall());
    });
});

// export this to MenuItem click callback
export default function checkForUpdates(isManual = false) {
  isManualCheck = isManual;
  electronUpdater.autoUpdater.checkForUpdates();
}
