import Foundation

struct CategoryItem: Identifiable, Codable, Equatable {
    var id = UUID()
    var name: String
}

struct CommandItem: Identifiable, Codable {
    var id = UUID()
    var name: String
    var command: String
    var categoryId: UUID
    var forceKill: Bool = false
}

struct LogEntry: Identifiable {
    let id = UUID()
    let timestamp = Date()
    let categoryName: String
    let serverName: String
    let message: String
    let isError: Bool
}
