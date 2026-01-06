import SwiftUI
import UniformTypeIdentifiers

struct SettingTabView: View {
    @ObservedObject var vm: CommandViewModel
    @Binding var currentTab: Int
    @State private var showingFilePicker = false
    @State private var showingExportPicker = false
    @State private var hasAttemptedImport = false
    @State private var exportSuccess = false
    @State private var isImporting = false
    
    var importFailed: Bool {
        hasAttemptedImport && (!vm.importCatsSuccess || !vm.importCmdsSuccess)
    }
    
    var body: some View {
        VStack {
            Text("Setting").font(.headline).padding()
            VStack(alignment: .leading, spacing: 16) {
                // Dark Mode Toggle
                HStack {
                    HStack(spacing: 8) {
                        Image(systemName: vm.isDarkMode ? "moon.fill" : "sun.max.fill")
                            .foregroundColor(vm.isDarkMode ? .yellow : .orange)
                        Text("Appearance")
                    }
                    Spacer()
                    Picker("", selection: $vm.isDarkMode) {
                        Text("Light").tag(false)
                        Text("Dark").tag(true)
                    }
                    .pickerStyle(.segmented)
                    .frame(width: 160)
                    .onChange(of: vm.isDarkMode) { _, _ in
                        vm.saveSettings()
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(Color(NSColor.windowBackgroundColor).opacity(0.5))
                .cornerRadius(8)
                
                // Import Config
                VStack(alignment: .leading, spacing: 12) {
                    Text("Import Configuration").font(.subheadline).bold()
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Select a folder containing categories.json and commands.json files to import.").font(.caption).foregroundColor(.secondary).italic()
                        Text("Or add categories and commands manually in the Category and Command tabs.").font(.caption).foregroundColor(.secondary).italic().padding(.top, 4)
                    }
                    Button(action: { 
                        isImporting = true
                        showingFilePicker = true 
                    }) {
                        HStack {
                            Image(systemName: "arrow.down.doc")
                            Text("Select Folder & Import")
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                    }
                    .buttonStyle(.borderedProminent)
                    
                    if importFailed {
                        HStack(spacing: 4) {
                            Image(systemName: "exclamationmark.circle.fill")
                                .foregroundColor(.red)
                            Text("Import failed. Check the log view for details.")
                                .font(.caption)
                                .foregroundColor(.red)
                        }
                        .padding(.top, 4)
                    }
                }
                .padding(16)
                .background(Color(NSColor.windowBackgroundColor).opacity(0.5))
                .cornerRadius(8)
                
                // Export Config
                VStack(alignment: .leading, spacing: 12) {
                    Text("Backup Configuration").font(.subheadline).bold()
                    VStack(alignment: .leading, spacing: 6) {
                        Text("A backup folder will be created in the selected location.").font(.caption).foregroundColor(.secondary).italic()
                    }
                    Button(action: { 
                        isImporting = false
                        showingExportPicker = true 
                    }) {
                        HStack {
                            Image(systemName: "arrow.up.doc")
                            Text("Select Folder & Backup")
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                    }
                    .buttonStyle(.borderedProminent)
                    
                    if exportSuccess {
                        HStack(spacing: 4) {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.green)
                            Text("Backup successful!")
                                .font(.caption)
                                .foregroundColor(.green)
                        }
                        .padding(.top, 4)
                        .onAppear {
                            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                exportSuccess = false
                            }
                        }
                    }
                }
                .padding(16)
                .background(Color(NSColor.windowBackgroundColor).opacity(0.5))
                .cornerRadius(8)
            }
            .padding()
            
            Spacer()
        }
        .textSelection(.enabled)
        .fileImporter(
            isPresented: Binding(
                get: { showingFilePicker || showingExportPicker },
                set: { 
                    if !$0 {
                        showingFilePicker = false
                        showingExportPicker = false
                    }
                }
            ),
            allowedContentTypes: [.folder],
            onCompletion: { result in
                if case .success(let url) = result {
                    DispatchQueue.main.async {
                        if isImporting {
                            hasAttemptedImport = true
                            vm.importConfig(from: url)
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                                if vm.importCatsSuccess && vm.importCmdsSuccess {
                                    withAnimation(.easeInOut(duration: 0.2)) {
                                        currentTab = 1
                                    }
                                }
                            }
                        } else {
                            vm.exportConfig(to: url)
                            exportSuccess = true
                        }
                        showingFilePicker = false
                        showingExportPicker = false
                    }
                }
            }
        )
    }
}
