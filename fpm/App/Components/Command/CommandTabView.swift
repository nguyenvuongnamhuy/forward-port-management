import SwiftUI

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
