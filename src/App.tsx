import React, { useEffect, useCallback } from 'react';
import { SystemNavigationSidebar as Sidebar } from './components/SystemNavigationSidebar';
import { CloudInfrastructureHeader as Header } from './components/CloudInfrastructureHeader';
import { ServerCluster as VirtualCloudServer } from './components/ServerCluster';
import { FilePreviewModal } from './components/FilePreviewModal';
import { UploadModal } from './components/UploadModal';
import { CreateFolderModal } from './components/CreateFolderModal';
import { FileList } from './components/FileList';
import { FileGrid } from './components/FileGrid';
import { TrashBin } from './components/TrashBin';
import { MasterIndex } from './components/MasterIndex';
import { StorageAnalyzer } from './components/StorageAnalyzer';
import { Html5AppHub } from './components/Html5AppHub';
import { Html5AppRunner } from './components/Html5AppRunner';
import { KexMicrokernelVfsBootchain } from './components/KexMicrokernelVfsBootchain';
import { CommercialPricingLicensing } from './components/commercial/CommercialPricingLicensing';
import { CommercialShowcase } from './components/commercial/CommercialShowcase';
import { LegalDocumentsView } from './components/LegalDocumentsView';
import { DocumentEditorModal } from './components/home/DocumentEditorModal';
import { BitcoinMiningLab } from './components/substrate/BitcoinMiningLab';
import { KeraDualRuntimeWorkstation } from './components/substrate/KeraDualRuntimeWorkstation';
import { SystemActivationModal } from './components/SystemActivationModal';
import { AetherDesktop } from './components/os/AetherDesktop';
import { RegistrySubstrate } from './components/substrate/RegistrySubstrate';
import { DEFAULT_STORAGE_PLAN } from './data/InfrastructureNodeMetadata';
import { useSystem } from './context/SystemContext';
import { useVfs } from './context/VfsContext';
import { GLOBAL_KERNEL_SERVICE } from './services/KernelService';
import {
  initGoogleConnectivity,
  connectGoogleSubstrate,
  disconnectGoogleSubstrate,
  isGoogleDriveConnected
} from './services/GoogleIdentityAccessManagement';
import {
  getDriveAbout,
  listDriveItems,
  uploadDriveFile,
} from './services/GoogleCloudStorageInterface';
import { Layers, Server, Zap } from 'lucide-react';
import { FileItem, FolderItem } from './types';
import { EngineeringDesktopEnvironment } from './components/desktop/EngineeringDesktopEnvironment';
import { DecoupledPlanesWorkstation } from './components/substrate/DecoupledPlanesWorkstation';
import { TechnologyAndDeploymentViewer } from './components/documents/TechnologyAndDeploymentViewer';

export default function App() {
  const [desktopMode, setDesktopMode] = React.useState(false);
  const [docWorkspaceMode, setDocWorkspaceMode] = React.useState<'files' | 'blueprint'>('files');
  const {
    activeTab, setActiveTab,
    serverSubTab, setServerSubTab,
    bootingSystem, setBootingSystem,
    isSystemOnline, setIsSystemOnline,
    currentLicense, setCurrentLicense
  } = useSystem();

  const {
    files, setFiles,
    folders, setFolders,
    toggleStarFile, toggleStarFolder,
    trashFile, trashFolder,
    restoreItem, deleteForever,
    createFolder, addFiles,
    getFolderStats, usedBytes,
    starredCount, trashCount,
    trashBytes, emptyTrash
  } = useVfs();

  // Initialize Microkernel
  useEffect(() => {
    GLOBAL_KERNEL_SERVICE.init();
  }, []);

  // Local UI State
  const [activeSource, setActiveSource] = React.useState<'drive' | 'local'>('local');
  const [isDriveConnected, setIsDriveConnected] = React.useState(false);
  const [isDriveLoading, setIsDriveLoading] = React.useState(false);
  const [driveUser, setDriveUser] = React.useState<any>(null);
  const [driveQuota, setDriveQuota] = React.useState<any>(null);
  const [driveFiles, setDriveFiles] = React.useState<FileItem[]>([]);
  const [driveFolders, setDriveFolders] = React.useState<FolderItem[]>([]);
  
  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<any>('all');
  const [viewMode, setViewMode] = React.useState<any>('grid');
  const [sortOption, setSortOption] = React.useState<any>('updatedAt');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [activeFileId, setActiveFileId] = React.useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = React.useState<string | null>(null);
  const [previewFile, setPreviewFile] = React.useState<FileItem | null>(null);
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = React.useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = React.useState(false);
  const [isDocEditorOpen, setIsDocEditorOpen] = React.useState(false);
  const [editingFile, setEditingFile] = React.useState<FileItem | null>(null);
  const [isActivationOpen, setIsActivationOpen] = React.useState(false);

  const currentFiles = React.useMemo(() => activeSource === 'drive' ? driveFiles : files, [activeSource, driveFiles, files]);
  const currentFolders = React.useMemo(() => activeSource === 'drive' ? driveFolders : folders, [activeSource, driveFolders, folders]);

  const loadDriveData = useCallback(async () => {
    if (!isGoogleDriveConnected()) return;
    try {
      const [about, items] = await Promise.all([
        getDriveAbout(),
        listDriveItems({ mode: 'files' })
      ]);
      if (about) {
        setDriveUser(about.user);
        setDriveQuota(about.quota);
      }
      setDriveFiles(items.files);
      setDriveFolders(items.folders);
      setIsDriveConnected(true);
    } catch (err) {
      console.error('Failed to load Drive data:', err);
    }
  }, []);

  useEffect(() => {
    const unsub = initGoogleConnectivity((user) => {
      setIsDriveConnected(true);
      setDriveUser({
        displayName: user.displayName || 'Google User',
        emailAddress: user.email || '',
        photoLink: user.photoURL || undefined
      });
      loadDriveData();
    }, () => {
      setIsDriveConnected(false);
    });
    return () => unsub();
  }, [loadDriveData]);

  const handleConnectDrive = async () => {
    try {
      setIsDriveLoading(true);
      const result = await connectGoogleSubstrate();
      if (result) {
        setActiveSource('drive');
        loadDriveData();
      }
    } catch (err) {
      console.error('Connection error:', err);
    } finally {
      setIsDriveLoading(false);
    }
  };

  const handleDisconnectDrive = async () => {
    await disconnectGoogleSubstrate();
    setIsDriveConnected(false);
    setActiveSource('local');
  };

  const handleOpenFile = (file: FileItem) => {
    if (file.category === 'documents' || file.mimeType === 'text/markdown' || file.mimeType === 'text/plain') {
      setEditingFile(file);
      setIsDocEditorOpen(true);
    } else {
      setPreviewFile(file);
    }
  };

  const folderBreadcrumbs = React.useMemo(() => {
    const breadcrumbs: FolderItem[] = [];
    let currentId = currentFolderId;
    while (currentId) {
      const folder = currentFolders.find(f => f.id === currentId);
      if (folder) {
        breadcrumbs.unshift(folder);
        currentId = folder.parentId;
      } else {
        break;
      }
    }
    return breadcrumbs;
  }, [currentFolderId, currentFolders]);

  if (desktopMode) {
    return (
      <div className="relative w-screen h-screen bg-slate-950 overflow-hidden">
        <EngineeringDesktopEnvironment />
        <div className="absolute top-2 right-4 z-50">
          <button
            onClick={() => setDesktopMode(false)}
            className="px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-mono transition-colors cursor-pointer shadow-xl flex items-center gap-1.5"
            title="Return to Full Workspace"
          >
            <span>Exit Floating Workspace</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden antialiased select-none">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'server' && !serverSubTab) setServerSubTab('mining');
        }}
        onOpenFloatingDesktop={() => setDesktopMode(true)}
        isDriveConnected={isDriveConnected}
        isDriveLoading={isDriveLoading}
        driveUser={driveUser}
        driveQuota={driveQuota}
        onConnectDrive={handleConnectDrive}
        onDisconnectDrive={handleDisconnectDrive}
        onRefreshDrive={loadDriveData}
        isSyncing={isDriveLoading}
        onNavigateServerSub={(sub) => {
          setActiveTab('server');
          setServerSubTab(sub);
        }}
        usedBytes={usedBytes}
        currentPlan={DEFAULT_STORAGE_PLAN}
        starredCount={starredCount}
        trashCount={trashCount}
        activeSource={activeSource}
        setActiveSource={setActiveSource}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenCreateFolder={() => setIsCreateFolderOpen(true)}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
        onConnectKex={() => setBootingSystem('kex')}
        onConnectKexSubstrate={() => setBootingSystem('kexlinux')}
        onConnectOs={() => setBootingSystem('aether')}
        onConnectMiningOs={() => {
          setActiveTab('server');
          setServerSubTab('mining');
        }}
        currentLicense={currentLicense}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header 
          currentFolder={currentFolders.find(f => f.id === currentFolderId) || null}
          folderBreadcrumbs={folderBreadcrumbs}
          onNavigateFolder={setCurrentFolderId}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          viewMode={viewMode}
          setViewMode={setViewMode}
          sortOption={sortOption}
          setSortOption={setSortOption}
          selectedIds={selectedIds}
          onClearSelection={() => setSelectedIds([])}
          onBatchStar={() => {
            selectedIds.forEach(toggleStarFile);
            setSelectedIds([]);
          }}
          onBatchTrash={() => {
            selectedIds.forEach(trashFile);
            setSelectedIds([]);
          }}
          onSelectAll={() => setSelectedIds(currentFiles.filter(f => f.folderId === currentFolderId && !f.inTrash).map(f => f.id))}
          isAllSelected={selectedIds.length > 0 && selectedIds.length === currentFiles.filter(f => f.folderId === currentFolderId && !f.inTrash).length}
          totalCount={currentFiles.filter(f => !f.inTrash).length}
          isDriveConnected={isDriveConnected}
          activeSource={activeSource}
          onConnectDrive={handleConnectDrive}
          onRefreshDrive={loadDriveData}
          onOpenPricing={() => setActiveTab('pricing')}
          currentLicense={currentLicense}
          isSystemOnline={isSystemOnline}
          onConnectOs={() => setBootingSystem('aether')}
          onOpenFloatingDesktop={() => setDesktopMode(true)}
        />

        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {activeTab === 'planes' && (
            <DecoupledPlanesWorkstation />
          )}
          {activeTab === 'server' && (
            <VirtualCloudServer 
              files={currentFiles}
              onLaunchApp={handleOpenFile}
              onConnectKexLinux={() => setBootingSystem('kex')}
              onConnectOs={() => setBootingSystem('aether')}
              isDriveConnected={isDriveConnected}
              initialSubTab={serverSubTab}
            />
          )}
          {activeTab === 'files' && (
            <FileGrid 
              files={currentFiles.filter(f => !f.inTrash && f.folderId === currentFolderId)}
              folders={currentFolders.filter(f => !f.inTrash && f.parentId === currentFolderId)}
              selectedIds={selectedIds}
              activeFileId={activeFileId}
              onSelectFolder={setCurrentFolderId}
              onSelectFile={(f) => setActiveFileId(f.id)}
              onToggleSelectId={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
              onToggleStarFile={toggleStarFile}
              onToggleStarFolder={toggleStarFolder}
              onTrashFile={trashFile}
              onTrashFolder={trashFolder}
              onPreviewFile={handleOpenFile}
              onShareFile={() => {}}
              getFolderStats={getFolderStats}
              onLaunchApp={handleOpenFile}
            />
          )}
          {activeTab === 'trash' && (
            <TrashBin 
              trashedFiles={currentFiles.filter(f => f.inTrash)}
              trashedFolders={currentFolders.filter(f => f.inTrash)}
              onRestoreFile={restoreItem}
              onRestoreFolder={restoreItem}
              onPermanentDeleteFile={deleteForever}
              onPermanentDeleteFolder={deleteForever}
              onEmptyTrash={emptyTrash}
            />
          )}
          {activeTab === 'index' && (
            <MasterIndex 
              files={currentFiles}
              folders={currentFolders}
              activeSource={activeSource}
              currentPlan={DEFAULT_STORAGE_PLAN}
              isDriveConnected={isDriveConnected}
              onPreviewFile={setPreviewFile}
              onLaunchApp={handleOpenFile}
              onToggleStar={toggleStarFile}
              onNavigateFolder={(id) => {
                setCurrentFolderId(id);
                setActiveTab('files');
              }}
            />
          )}
          {activeTab === 'analytics' && (
            <StorageAnalyzer 
              files={currentFiles} 
              usedBytes={usedBytes}
              currentPlan={DEFAULT_STORAGE_PLAN}
              onDeleteFile={deleteForever}
              onEmptyTrash={emptyTrash}
              trashCount={trashCount}
              trashBytes={trashBytes}
              onOpenUpgrade={() => setIsUpgradeOpen(true)}
            />
          )}
          {activeTab === 'ai' && (
            <BitcoinMiningLab 
              files={currentFiles}
              onOpenFilePreview={handleOpenFile}
              isDriveConnected={isDriveConnected}
              isSystemOnline={isSystemOnline}
            />
          )}
          {activeTab === 'documents' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="px-6 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">DOCUMENT REPOSITORY:</span>
                  <span className="text-white font-bold">{currentFiles.filter(f => !f.inTrash && f.category === 'documents').length} Files</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setDocWorkspaceMode('files')}
                    className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                      docWorkspaceMode === 'files' 
                        ? 'bg-blue-600 text-white font-bold' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    File Directory
                  </button>
                  <button
                    onClick={() => setDocWorkspaceMode('blueprint')}
                    className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
                      docWorkspaceMode === 'blueprint' 
                        ? 'bg-cyan-600 text-black font-bold' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>V50 Architecture Blueprint</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </button>
                </div>
              </div>
              {docWorkspaceMode === 'files' ? (
                <FileList 
                  files={currentFiles.filter(f => !f.inTrash && f.category === 'documents')}
                  onPreviewFile={handleOpenFile}
                />
              ) : (
                <TechnologyAndDeploymentViewer />
              )}
            </div>
          )}
          {activeTab === 'legal' && (
            <LegalDocumentsView 
              files={currentFiles}
              onPreviewFile={handleOpenFile}
            />
          )}
          {activeTab === 'starred' && (
            <FileGrid 
              files={currentFiles.filter(f => f.starred && !f.inTrash)}
              folders={currentFolders.filter(f => f.starred && !f.inTrash)}
              selectedIds={selectedIds}
              activeFileId={activeFileId}
              onSelectFolder={setCurrentFolderId}
              onSelectFile={(f) => setActiveFileId(f.id)}
              onToggleSelectId={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
              onToggleStarFile={toggleStarFile}
              onToggleStarFolder={toggleStarFolder}
              onTrashFile={trashFile}
              onTrashFolder={trashFolder}
              onPreviewFile={handleOpenFile}
              onShareFile={() => {}}
              getFolderStats={getFolderStats}
              onLaunchApp={handleOpenFile}
            />
          )}
          {activeTab === 'showcase' && (
            <CommercialShowcase 
              onNavigateTab={setActiveTab}
              onNavigateServerSubTab={setServerSubTab}
              onOpenDeployCenter={() => setActiveTab('server')}
              onOpenPricing={() => setActiveTab('pricing')}
              onConnectOs={() => setBootingSystem('aether')}
              onConnectKex={() => setBootingSystem('kex')}
            />
          )}
          {activeTab === 'apps' && (
            <Html5AppHub 
              files={currentFiles}
              onLaunchApp={handleOpenFile}
              onInspectCode={(file) => {
                setEditingFile(file);
                setIsDocEditorOpen(true);
              }}
              isDriveMode={activeSource === 'drive'}
              onRefresh={loadDriveData}
              isSyncing={isDriveLoading}
              onDeployTemplate={async (name, code) => {
                const newFile: FileItem = {
                  id: `file-deploy-${Date.now()}`,
                  name,
                  folderId: currentFolderId || 'root',
                  category: 'code',
                  size: code.length,
                  mimeType: 'text/html',
                  updatedAt: new Date().toISOString(),
                  createdAt: new Date().toISOString(),
                  starred: false,
                  inTrash: false,
                  rawContent: code,
                  isHtml5App: true,
                  tags: ['Deployed', 'HTML5 App']
                };
                if (activeSource === 'drive') {
                  await uploadDriveFile(new File([code], name, { type: 'text/html' }));
                  loadDriveData();
                } else {
                  addFiles([newFile]);
                }
              }}
            />
          )}
          {activeTab === 'software' && (
            <RegistrySubstrate />
          )}
          {activeTab === 'pricing' && (
            <CommercialPricingLicensing 
              currentLicense={currentLicense}
              onUpdateLicense={setCurrentLicense}
            />
          )}
          {activeTab === 'home' && (
            <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden relative">
              <KeraDualRuntimeWorkstation onSwitchToOverview={() => setActiveTab('files')} />
            </div>
          )}
        </main>
      </div>

      {isDocEditorOpen && editingFile && (
        <DocumentEditorModal
          isOpen={true}
          document={editingFile}
          onClose={() => {
            setIsDocEditorOpen(false);
            setEditingFile(null);
          }}
          onSave={(updatedFile) => {
             setFiles(prev => prev.map(f => f.id === updatedFile.id ? updatedFile : f));
          }}
        />
      )}

      {bootingSystem === 'kex' && (
        <div className="fixed inset-0 z-[60] bg-black">
          <KexMicrokernelVfsBootchain onClose={() => setBootingSystem(null)} />
        </div>
      )}

      {bootingSystem === 'aether' && (
        <div className="fixed inset-0 z-[60]">
           <AetherDesktop />
        </div>
      )}

      {bootingSystem === 'kexlinux' && (
        <Html5AppRunner 
          file={{
            id: 'file-html5-kex-linux-substrate',
            name: 'Kex_Linux_Universal_Substrate.html',
            folderId: null,
            category: 'code',
            size: 0,
            mimeType: 'text/html',
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            starred: true,
            inTrash: false,
            tags: ['OS', 'KexLinux', 'EpicGames'],
            isHtml5App: true
          }}
          onClose={() => setBootingSystem(null)}
        />
      )}

      {previewFile && (
        <FilePreviewModal 
          file={previewFile} 
          onClose={() => setPreviewFile(null)} 
        />
      )}
      
      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={(newFiles) => activeSource === 'drive' ? setDriveFiles([...newFiles, ...driveFiles]) : addFiles(newFiles)}
        isDriveMode={activeSource === 'drive'}
        uploadDriveFile={uploadDriveFile}
      />

      <CreateFolderModal
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        onCreateFolder={(name, color) => createFolder(name, color, currentFolderId)}
      />
      <SystemActivationModal
        isOpen={isActivationOpen}
        onClose={() => setIsActivationOpen(false)}
        onComplete={() => {
          setIsSystemOnline(true);
          setIsActivationOpen(false);
        }}
      />
    </div>
  );
}
