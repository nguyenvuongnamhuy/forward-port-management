import SwiftUI
internal import Combine

class CommandViewModel: ObservableObject {
    @Published var categories: [CategoryItem] = []
    @Published var commands: [CommandItem] = []
    @Published var runningProcesses: [UUID: Process] = [:]
    @Published var logs: [LogEntry] = []
    
    func addCategory(name: String) { if !name.isEmpty { categories.append(CategoryItem(name: name)); saveAllData() } }
    func deleteCategory(_ cat: CategoryItem) { categories.removeAll { $0.id == cat.id }; commands.removeAll { $0.categoryId == cat.id }; saveAllData() }
    func moveCategory(_ cat: CategoryItem, direction: Int) {
        guard let index = categories.firstIndex(of: cat) else { return }
        let newIndex = index + direction
        if newIndex >= 0 && newIndex < categories.count { categories.swapAt(index, newIndex); saveAllData() }
    }
    
    func addCommand(name: String, text: String, catId: UUID?) {
        if let catId = catId, !name.isEmpty, !text.isEmpty { commands.append(CommandItem(name: name, command: text, categoryId: catId)); saveAllData() }
    }
    func deleteCommand(_ cmd: CommandItem) { commands.removeAll { $0.id == cmd.id }; runningProcesses[cmd.id]?.terminate(); saveAllData() }
    
    
    func handleToggle(item: CommandItem, isOn: Bool) {
        if isOn {
            if runningProcesses[item.id] != nil { return }
            
            let task = Process()
            task.executableURL = URL(fileURLWithPath: "/bin/zsh")
            
            var env = ProcessInfo.processInfo.environment
            env["PATH"] = Constant.systemPath
            task.environment = env
            
            // 2>&1: catch any error
            task.arguments = ["-c", "\(item.command) 2>&1"]
            
            let pipe = Pipe()
            task.standardOutput = pipe
            task.standardError = pipe
            
            runningProcesses[item.id] = task
            appendLog(name: item.name, msg: "🌐 Creating Tunnel Port...")
            
            let outHandle = pipe.fileHandleForReading
            outHandle.readabilityHandler = { handle in
                let data = handle.availableData
                if let str = String(data: data, encoding: .utf8), !str.isEmpty {
                    self.appendLog(name: item.name, msg: str.trimmingCharacters(in: .newlines))
                }
            }
            
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
            
            do {
                try task.run()
            } catch {
                appendLog(name: item.name, msg: "❌ Running error: \(error.localizedDescription)")
                runningProcesses.removeValue(forKey: item.id)
            }
            
        } else {
            // 1. Shutdown main process
            if let task = runningProcesses[item.id] {
                task.terminate()
                appendLog(name: item.name, msg: "🛑 Request cancelled.")
            }
            
            // 2. Shutdown sub-process
            let taskToKill = Process()
            taskToKill.executableURL = URL(fileURLWithPath: "/usr/bin/pkill")
            
            taskToKill.arguments = ["-f", item.command]
            
            try? taskToKill.run()
            
            // 3. Remove from list
            runningProcesses.removeValue(forKey: item.id)
        }
    }
    
    func appendLog(name: String, msg: String, isErr: Bool = false) { DispatchQueue.main.async { self.logs.append(LogEntry(serverName: name, message: msg, isError: isErr)) } }
    private func getURL() -> URL { let f = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0].appendingPathComponent("GCloudToggleApp"); try? FileManager.default.createDirectory(at: f, withIntermediateDirectories: true); return f }
    func saveAllData() { if let d = try? JSONEncoder().encode(categories) { try? d.write(to: getURL().appendingPathComponent("cats.json")) }; if let d = try? JSONEncoder().encode(commands) { try? d.write(to: getURL().appendingPathComponent("cmds.json")) } }
    func loadAllData() { if let d = try? Data(contentsOf: getURL().appendingPathComponent("cats.json")), let dec = try? JSONDecoder().decode([CategoryItem].self, from: d) { categories = dec }; if let d = try? Data(contentsOf: getURL().appendingPathComponent("cmds.json")), let dec = try? JSONDecoder().decode([CommandItem].self, from: d) { commands = dec } }
}
