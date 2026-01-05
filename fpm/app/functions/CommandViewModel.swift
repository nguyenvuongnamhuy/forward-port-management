import SwiftUI
internal import Combine

class CommandViewModel: ObservableObject {
    @Published var categories: [CategoryItem] = []
    @Published var commands: [CommandItem] = []
    @Published var runningProcesses: [UUID: Process] = [:]
    @Published var logs: [LogEntry] = []
    @Published var isDarkMode: Bool = false
    @Published var importCatsSuccess: Bool = false
    @Published var importCmdsSuccess: Bool = false
    
    func addCategory(name: String) {
        guard !name.isEmpty else { return }
        
        let newCategory = CategoryItem(name: name)
        categories.append(newCategory)
        saveAllData()
    }
    
    func deleteCategory(_ cat: CategoryItem) {
        categories.removeAll { $0.id == cat.id }
        commands.removeAll { $0.categoryId == cat.id }
        
        saveAllData()
    }
    
    func moveCategory(_ cat: CategoryItem, direction: Int) {
        guard let index = categories.firstIndex(of: cat) else { return }
        
        let newIndex = index + direction
        if newIndex >= 0 && newIndex < categories.count {
            categories.swapAt(index, newIndex)
            saveAllData()
        }
    }
    
    func addCommand(name: String, text: String, catId: UUID?) {
        if let catId = catId, !name.isEmpty, !text.isEmpty {
            let newCommand = CommandItem(
                name: name,
                command: text,
                categoryId: catId
            )
            commands.append(newCommand)
            saveAllData()
        }
    }
    
    func deleteCommand(_ cmd: CommandItem) {
        runningProcesses[cmd.id]?.terminate()
        commands.removeAll { $0.id == cmd.id }
        saveAllData()
    }
    
    func moveCommand(_ cmd: CommandItem, direction: Int) {
        let filteredCmds = commands.filter { $0.categoryId == cmd.categoryId }
        guard let currentIndex = filteredCmds.firstIndex(where: { $0.id == cmd.id }) else { return }
        
        let newIndex = currentIndex + direction
        if newIndex >= 0 && newIndex < filteredCmds.count {
            if let oldIndex = commands.firstIndex(where: { $0.id == cmd.id }),
               let swapIndex = commands.firstIndex(where: { $0.id == filteredCmds[newIndex].id }) {
                commands.swapAt(oldIndex, swapIndex)
                saveAllData()
            }
        }
    }
    
    func handleToggle(item: CommandItem, isOn: Bool, forceKill: Bool = false) {
        if isOn {
            if forceKill {
                killExistingPort(for: item)
            }
            
            // Check status
            if runningProcesses[item.id] != nil { return }
            
            // Init task
            let task = Process()
            task.executableURL = URL(fileURLWithPath: "/bin/zsh")
            
            // Config path env
            var env = ProcessInfo.processInfo.environment
            env["PATH"] = Constant.systemPath
            task.environment = env
            
            // 2>&1: catch all error
            task.arguments = ["-c", "\(item.command) 2>&1"]
            
            // Config pipeline logging
            let pipe = Pipe()
            task.standardOutput = pipe
            task.standardError = pipe
            
            let outHandle = pipe.fileHandleForReading
            outHandle.readabilityHandler = { handle in
                let data = handle.availableData
                if let str = String(data: data, encoding: .utf8), !str.isEmpty {
                    self.appendLog(
                        name: item.name,
                        msg: str.trimmingCharacters(in: .newlines)
                    )
                }
            }
            
            // Handle when finish
            task.terminationHandler = { p in
                DispatchQueue.main.async {
                    let status = p.terminationStatus
                    if status != 0 && self.runningProcesses[item.id] != nil {
                        self.appendLog(name: item.name, msg: "⚠️ Something went wrong (Code: \(status))")
                    } else {
                        self.appendLog(name: item.name, msg: "✅ Stopped connection.")
                    }
                    
                    self.runningProcesses.removeValue(forKey: item.id)
                    try? outHandle.close()
                }
            }
            
            // Execute
            runningProcesses[item.id] = task
            appendLog(name: item.name, msg: "🌐 Creating Tunnel Port...")
            
            do {
                try task.run()
            } catch {
                appendLog(name: item.name, msg: "❌ Running error: \(error.localizedDescription)")
                runningProcesses.removeValue(forKey: item.id)
            }
            
        } else {
            // Stop main process
            if let task = runningProcesses[item.id] {
                task.terminate()
                appendLog(name: item.name, msg: "🛑 Request cancelled.")
            }
            
            // stop sub-process
            let taskToKill = Process()
            taskToKill.executableURL = URL(fileURLWithPath: "/usr/bin/pkill")
            taskToKill.arguments = ["-f", item.command]
            
            try? taskToKill.run()
            
            // Remove process
            runningProcesses.removeValue(forKey: item.id)
        }
    }
    
    private func killExistingPort(for item: CommandItem) {
        appendLog(name: item.name, msg: "🔧 Force killing existing processes...")
        
        let taskToKill = Process()
        taskToKill.executableURL = URL(fileURLWithPath: "/usr/bin/pkill")
        taskToKill.arguments = ["-9", "-f", item.command]
        
        try? taskToKill.run()
        taskToKill.waitUntilExit()
        
        // Wait a moment to ensure the port is released
        Thread.sleep(forTimeInterval: 0.5)
        
        appendLog(name: item.name, msg: "✅ Existing processes killed.")
    }
    
    func appendLog(name: String, msg: String, isErr: Bool = false) {
        DispatchQueue.main.async {
            let newEntry = LogEntry(
                serverName: name,
                message: msg,
                isError: isErr
            )
            self.logs.append(newEntry)
        }
    }
    
    private func getURL() -> URL {
        let fileManager = FileManager.default
        let appSupportURL = fileManager.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        let folderURL = appSupportURL.appendingPathComponent("forwardPortManagementApp")
        
        if !fileManager.fileExists(atPath: folderURL.path) {
            try? fileManager.createDirectory(
                at: folderURL,
                withIntermediateDirectories: true,
                attributes: nil
            )
        }
        
        return folderURL
    }
    
    func saveAllData() {
        let folderURL = getURL()
        let encoder = JSONEncoder()
        
        if let encodedCats = try? encoder.encode(categories) {
            let catsURL = folderURL.appendingPathComponent("categories.json")
            try? encodedCats.write(to: catsURL)
        }
        
        if let encodedCmds = try? encoder.encode(commands) {
            let cmdsURL = folderURL.appendingPathComponent("commands.json")
            try? encodedCmds.write(to: cmdsURL)
        }
    }
    
    func loadAllData() {
        let folderURL = getURL()
        let decoder = JSONDecoder()
        
        let catsURL = folderURL.appendingPathComponent("categories.json")
        if let catsData = try? Data(contentsOf: catsURL),
           let decodedCats = try? decoder.decode([CategoryItem].self, from: catsData) {
            categories = decodedCats
        }
        
        let cmdsURL = folderURL.appendingPathComponent("commands.json")
        if let cmdsData = try? Data(contentsOf: cmdsURL),
           let decodedCmds = try? decoder.decode([CommandItem].self, from: cmdsData) {
            commands = decodedCmds
        }
        
        // Load settings
        loadSettings()
    }
    
    func importConfig(from folderURL: URL) {
        let decoder = JSONDecoder()
        
        importCatsSuccess = false
        importCmdsSuccess = false
        
        let catsURL = folderURL.appendingPathComponent("categories.json")
        do {
            if let catsData = try? Data(contentsOf: catsURL) {
                let decodedCats = try decoder.decode([CategoryItem].self, from: catsData)
                categories = decodedCats
                appendLog(name: "Import", msg: "✅ Categories imported successfully.", isErr: false)
                importCatsSuccess = true
            } else {
                appendLog(name: "Import", msg: "⚠️ categories.json not found", isErr: true)
                importCatsSuccess = false
            }
        } catch {
            appendLog(name: "Import", msg: "❌ Categories import failed: \(error.localizedDescription)", isErr: true)
            importCatsSuccess = false
        }
        
        let cmdsURL = folderURL.appendingPathComponent("commands.json")
        do {
            if let cmdsData = try? Data(contentsOf: cmdsURL) {
                let decodedCmds = try decoder.decode([CommandItem].self, from: cmdsData)
                commands = decodedCmds
                appendLog(name: "Import", msg: "✅ Commands imported successfully.", isErr: false)
                importCmdsSuccess = true
            } else {
                appendLog(name: "Import", msg: "⚠️ commands.json not found", isErr: true)
                importCmdsSuccess = false
            }
        } catch {
            appendLog(name: "Import", msg: "❌ Commands import failed: \(error.localizedDescription)", isErr: true)
            importCmdsSuccess = false
        }
        
        if importCatsSuccess && importCmdsSuccess {
            saveAllData()
        }
    }
    
    func exportConfig(to folderURL: URL) {
        let encoder = JSONEncoder()
        encoder.outputFormatting = .prettyPrinted
        
        // Create backup folder
        let backupFolderURL = folderURL.appendingPathComponent("backup")
        do {
            try FileManager.default.createDirectory(at: backupFolderURL, withIntermediateDirectories: true)
        } catch {
            appendLog(name: "Export", msg: "❌ Failed to create backup folder: \(error.localizedDescription)", isErr: true)
            return
        }
        
        // Export categories.json
        do {
            let catsData = try encoder.encode(categories)
            let catsURL = backupFolderURL.appendingPathComponent("categories.json")
            try catsData.write(to: catsURL)
            appendLog(name: "Export", msg: "✅ Categories exported successfully.", isErr: false)
        } catch {
            appendLog(name: "Export", msg: "❌ Categories export failed: \(error.localizedDescription)", isErr: true)
        }
        
        // Export commands.json
        do {
            let cmdsData = try encoder.encode(commands)
            let cmdsURL = backupFolderURL.appendingPathComponent("commands.json")
            try cmdsData.write(to: cmdsURL)
            appendLog(name: "Export", msg: "✅ Commands exported successfully.", isErr: false)
        } catch {
            appendLog(name: "Export", msg: "❌ Commands export failed: \(error.localizedDescription)", isErr: true)
        }
    }
    
    func saveSettings() {
        let folderURL = getURL()
        let settingsURL = folderURL.appendingPathComponent("settings.json")
        
        let settings = ["isDarkMode": isDarkMode]
        if let encoded = try? JSONSerialization.data(withJSONObject: settings) {
            try? encoded.write(to: settingsURL)
        }
    }
    
    private func loadSettings() {
        let folderURL = getURL()
        let settingsURL = folderURL.appendingPathComponent("settings.json")
        
        if let data = try? Data(contentsOf: settingsURL),
           let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let darkMode = json["isDarkMode"] as? Bool {
            isDarkMode = darkMode
        }
    }
}
