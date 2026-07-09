const fs = require('fs');
const file = "c:/Users/Usman Pasha/Documents/GitHub/FRONT-GALLERY/src/app/page.tsx";
let content = fs.readFileSync(file, 'utf8');

// Fix 1: isFetchingGallery -> remove it
content = content.replace(
    /className={isFetchingGallery \? "animate-spin" : ""} \/>/g,
    `/>`
);

// Fix 2: folder type any
content = content.replace(
    /folders\.map\(\(folder, i\) => \(/g,
    `folders.map((folder: any, i: number) => (`
);

// Fix 3: filteredImages type any
content = content.replace(
    /filteredImages\.map\(\(img\) => \(/g,
    `filteredImages.map((img: any) => (`
);

// Fix 4: items map type any
content = content.replace(
    /items\.map\(\(item, i\) => \(/g,
    `items.map((item: any, i: number) => (`
);

// Fix 5: notifications map type any
content = content.replace(
    /notifications\.filter\(n => selectedNotifApp === 'all' \|\| notifAppFilters\.find\(f => f\.key === selectedNotifApp\)\?\.packages\.includes\(n\.packageName\)\)\.map\(\(notif, i\) => \(/g,
    `notifications.filter(n => selectedNotifApp === 'all' || notifAppFilters.find(f => f.key === selectedNotifApp)?.packages.includes(n.packageName)).map((notif: any, i: number) => (`
);

// Fix 6: Modals props
content = content.replace(
    /<AppGenerationModal isOpen={showAppModal} onClose={\(\) => setShowAppModal\(false\)} \/>/,
    `<AppGenerationModal isOpen={showAppModal} onClose={() => setShowAppModal(false)} uuid={session?.user?.uuid || ''} socket={socket} />`
);

content = content.replace(
    /<PlansModal isOpen={showPlansModal} onClose={\(\) => setShowPlansModal\(false\)} currentPlan={userPlan} \/>/,
    `<PlansModal isOpen={showPlansModal} onClose={() => setShowPlansModal(false)} currentPlan={userPlan as any} userEmail={session?.user?.email || ''} userUuid={session?.user?.uuid || ''} />`
);

content = content.replace(
    /<UpgradeModal isOpen={showUpgradeModal} onClose={\(\) => setShowUpgradeModal\(false\)} feature={upgradeFeature} requiredPlan={requiredPlan} currentPlan={userPlan} onUpgrade={\(\) => setShowPlansModal\(true\)} \/>/,
    `<UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} feature={upgradeFeature} requiredPlan={requiredPlan} onUpgrade={() => setShowPlansModal(true)} />`
);

content = content.replace(
    /onSelectZip=\{\(\) => \{[\s\S]*?\}\s*userPlan=\{userPlan\}\s*onUpgrade=\{\(\) => setShowPlansModal\(true\)\}\s*\/>/m,
    `onSelectZip={() => {
                    setZipProgress({ stage: 'creating', current: 0, total: syncOptionsFolder.count, url: '', error: '' });
                    setShowZipProgressModal(true);
                    socket?.emit('trigger_zip', {
                        uuid: session?.user?.uuid,
                        targetDeviceId: selectedDeviceId,
                        folderName: syncOptionsFolder.name,
                        mediaType: syncOptionsFolder.type
                    });
                    setShowSyncOptionsModal(false);
                }}
                userPlan={userPlan as any}
                mediaType={syncOptionsFolder.type}
                onUpgrade={() => setShowPlansModal(true)}
            />`
);


fs.writeFileSync(file, content, 'utf8');
console.log("TS fixes complete");
