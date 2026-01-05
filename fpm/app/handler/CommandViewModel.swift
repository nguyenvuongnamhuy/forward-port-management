import SwiftUI
internal import Combine

class CommandViewModel: ObservableObject {
    @Published var categories: [CategoryItem] = []
    @Published var commands: [CommandItem] = []
    @Published var runningProcesses: [UUID: Process] = [:]
    @Published var logs: [LogEntry] = []
    
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
    }
}
