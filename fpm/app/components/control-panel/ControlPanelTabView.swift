import SwiftUI

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
