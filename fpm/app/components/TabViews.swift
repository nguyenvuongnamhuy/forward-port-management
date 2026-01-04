import SwiftUI

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
    var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(spacing: 20) {
                    Text("Controller").font(.headline).padding()
                    ForEach(vm.categories) { cat in
                        VStack(alignment: .leading, spacing: 8) {
                            Text(cat.name.uppercased()).font(.caption2).bold().foregroundColor(.secondary).padding(.leading, 5)
                            VStack(spacing: 0) {
                                let filteredCmds = vm.commands.filter { $0.categoryId == cat.id }
                                if filteredCmds.isEmpty {
                                    HStack { Text("Not any command yet").font(.caption).foregroundColor(.gray).padding(); Spacer() }
                                } else {
                                    ForEach(filteredCmds) { item in
                                        ControlRowView(item: item, vm: vm, isLast: item.id == filteredCmds.last?.id)
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
                    set: { vm.handleToggle(item: item, isOn: $0) }
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
