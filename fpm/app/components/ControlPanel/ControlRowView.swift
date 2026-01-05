import SwiftUI

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
