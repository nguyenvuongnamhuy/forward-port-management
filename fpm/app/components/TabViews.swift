import SwiftUI
import UniformTypeIdentifiers

// --- TAB 0 ---
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

// --- TAB 1 ---
struct CategoryTabView: View {
    @ObservedObject var vm: CommandViewModel
    @State private var newCatName = ""
    @FocusState.Binding var focusedField: Int?
    
    var body: some View {
        VStack {
            Text("Category Management").font(.headline).padding()
            HStack {
                TextField("Category name", text: $newCatName).textFieldStyle(.roundedBorder).focused($focusedField, equals: 1)
                Button("Add") { vm.addCategory(name: newCatName); newCatName = "" }.buttonStyle(.borderedProminent)
            }.padding()
            List {
                ForEach(vm.categories) { cat in
                    HStack {
                        Text(cat.name); Spacer()
                        Button(action: { vm.moveCategory(cat, direction: -1) }) { Image(systemName: "arrow.up") }
                        Button(action: { vm.moveCategory(cat, direction: 1) }) { Image(systemName: "arrow.down") }
                        Button(action: { vm.deleteCategory(cat) }) { Image(systemName: "trash").foregroundColor(.red) }
                    }
                }
            }
        }.textSelection(.enabled)
    }
}

// --- TAB 2 ---
struct CommandTabView: View {
    @ObservedObject var vm: CommandViewModel
    @State private var newCmdName = ""
    @State private var newCmdText = ""
    @State private var selectedCatId: UUID?
    @FocusState.Binding var focusedField: Int?
    
    var body: some View {
        VStack {
            Text("Command Management").font(.headline).padding()
            VStack(spacing: 12) {
                Picker("Select category:", selection: $selectedCatId) {
                    Text("--- Select one ---").tag(UUID?.none)
                    ForEach(vm.categories) { cat in Text(cat.name).tag(cat.id as UUID?) }
                }
                HStack {
                    TextField("Display name", text: $newCmdName).textFieldStyle(.roundedBorder).focused($focusedField, equals: 2)
                    TextField("Command", text: $newCmdText).textFieldStyle(.roundedBorder).focused($focusedField, equals: 3)
                    Button("Add") {
                        vm.addCommand(name: newCmdName, text: newCmdText, catId: selectedCatId)
                        newCmdName = ""; newCmdText = ""
                    }.buttonStyle(.borderedProminent)
                }
            }.padding()
            List {
                ForEach(vm.categories) { cat in
                    Section(header: Text(cat.name).font(.subheadline).bold().foregroundColor(.blue)) {
                        ForEach(vm.commands.filter { $0.categoryId == cat.id }) { cmd in
                            HStack {
                                VStack(alignment: .leading) { Text(cmd.name).bold(); Text(cmd.command).font(.caption).foregroundColor(.secondary) }
                                Spacer()
                                Button(action: { vm.moveCommand(cmd, direction: -1) }) { Image(systemName: "arrow.up") }
                                Button(action: { vm.moveCommand(cmd, direction: 1) }) { Image(systemName: "arrow.down") }
                                Button(action: { vm.deleteCommand(cmd) }) { Image(systemName: "trash").foregroundColor(.red) }
                            }
                        }
                    }
                }
            }
        }.textSelection(.enabled)
    }
}

// --- TAB 3 ---
struct ControlPanelTabView: View {
    @ObservedObject var vm: CommandViewModel
    @State private var forceKillAll = false
    
    var body: some View {
        VStack(spacing: 0) {
            // Sticky header
            Text("Controller").font(.headline).padding()
            VStack(spacing: 12) {
                HStack(spacing: 4) {
                    Toggle(isOn: $forceKillAll) {
                        Text("Force Kill")
                    }
                    .toggleStyle(CheckboxToggleStyle())
                    .font(.system(size: 12))
                    
                    Image(systemName: "questionmark.circle")
                        .foregroundColor(.secondary)
                        .font(.system(size: 18))
                        .help("When enabled, the app will forcefully terminate any existing process using the specified port before starting the new connection.\nNote: Only enable this if you encounter a port conflict, this avoids unnecessary checks and prevents potential lag or delays.")
                }
            }.padding(.horizontal)
                .padding(.vertical, 12)
                .padding(.bottom, 8)
            Divider()
            
            // Scrollable content
            ScrollView {
                VStack(spacing: 20) {
                    ForEach(vm.categories) { cat in
                        VStack(alignment: .leading, spacing: 8) {
                            Text(cat.name.uppercased()).font(.caption2).bold().foregroundColor(.secondary).padding(.leading, 5)
                            VStack(spacing: 0) {
                                let filteredCmds = vm.commands.filter { $0.categoryId == cat.id }
                                if filteredCmds.isEmpty {
                                    HStack { Text("Not any command yet").font(.caption).foregroundColor(.gray).padding(); Spacer() }
                                } else {
                                    let lastId = filteredCmds.last?.id
                                    ForEach(filteredCmds) { item in
                                        let isLast = item.id == lastId
                                        ControlRowView(item: item, vm: vm, forceKillAll: forceKillAll, isLast: isLast)
                                    }
                                }
                            }
                            .background(Color(NSColor.windowBackgroundColor).opacity(0.5)).cornerRadius(10)
                        }.padding(.horizontal)
                    }
                }.padding(.bottom)
            }
            Divider()
            LogAreaView(vm: vm)
        }.textSelection(.enabled)
    }
}

struct ControlRowView: View {
    let item: CommandItem
    @ObservedObject var vm: CommandViewModel
    let forceKillAll: Bool
    let isLast: Bool
    
    var body: some View {
        VStack(spacing: 0) {
            HStack {
                VStack(alignment: .leading) {
                    Text(item.name).font(.system(size: 14, weight: .medium))
                    Text(item.command).font(.system(size: 10)).foregroundColor(.secondary).lineLimit(1)
                }
                Spacer()
                Toggle("", isOn: Binding(
                    get: { vm.runningProcesses[item.id] != nil },
                    set: { vm.handleToggle(item: item, isOn: $0, forceKill: forceKillAll) }
                )).toggleStyle(SwitchToggleStyle(tint: .green)).labelsHidden()
            }
            .padding(.horizontal).padding(.vertical, 10)
            if !isLast { Divider().padding(.horizontal) }
        }
    }
}

struct LogAreaView: View {
    @ObservedObject var vm: CommandViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Label("LOG VIEW", systemImage: "terminal.fill").font(.system(size: 10, weight: .bold))
                Spacer()
                Button(action: { vm.logs.removeAll() }) {
                    Image(systemName: "trash").font(.system(size: 10))
                }.buttonStyle(.plain)
            }
            .padding(.horizontal).padding(.vertical, 8)
            .background(Color(NSColor.windowBackgroundColor))
            Divider()
            ScrollViewReader { proxy in
                ScrollView {
                    VStack(alignment: .leading, spacing: 4) {
                        ForEach(vm.logs) { log in
                            HStack(alignment: .top, spacing: 6) {
                                Text(log.timestamp, style: .time).foregroundColor(.secondary).frame(width: 50, alignment: .leading)
                                Text("[\(log.serverName)]").bold().foregroundColor(log.isError ? .red : .blue)
                                Text(log.message).foregroundColor(log.isError ? .red : .primary).fixedSize(horizontal: false, vertical: true)
                                Spacer()
                            }
                            .font(.system(size: 11, design: .monospaced)).padding(.horizontal, 8).id(log.id)
                        }
                    }.padding(.vertical, 8)
                }
                .background(Color.black.opacity(0.03))
                .frame(height: Constant.logViewHeight)
                .onChange(of: vm.logs.count) { oldValue, newValue in
                    if let last = vm.logs.last {
                        withAnimation { proxy.scrollTo(last.id, anchor: .bottom) }
                    }
                }
            }
        }
    }
}

struct CheckboxToggleStyle: ToggleStyle {
    func makeBody(configuration: Configuration) -> some View {
        HStack(spacing: 4) {
            Image(systemName: configuration.isOn ? "checkmark.square.fill" : "square")
                .foregroundColor(configuration.isOn ? .blue : .gray)
                .font(.system(size: 18))
            configuration.label
        }
        .contentShape(Rectangle())
        .onTapGesture {
            configuration.isOn.toggle()
        }
    }
}
