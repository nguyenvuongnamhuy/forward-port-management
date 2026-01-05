import SwiftUI

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
