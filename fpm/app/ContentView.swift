import SwiftUI

struct ContentView: View {
    @StateObject private var vm = CommandViewModel()
    @State private var currentTab: Int = 0
    @FocusState private var focusedField: Int?
    
    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 0) {
                Spacer()
                HStack(spacing: 20) {
                    TabButton(title: "Category", icon: "folder.badge.plus", index: 0, currentTab: $currentTab)
                    TabButton(title: "Setting", icon: "gearshape", index: 1, currentTab: $currentTab)
                    TabButton(title: "Control Panel", icon: "slider.horizontal.3", index: 2, currentTab: $currentTab)
                }
                Spacer()
            }
            .background(Color(NSColor.windowBackgroundColor)).frame(height: 60)
            Divider()
            ZStack {
                if currentTab == 0 { CategoryTabView(vm: vm, focusedField: $focusedField) }
                else if currentTab == 1 { CommandTabView(vm: vm, focusedField: $focusedField) }
                else { ControlPanelTabView(vm: vm) }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .contentShape(Rectangle())
            .onTapGesture { focusedField = nil; NSApp.keyWindow?.makeFirstResponder(nil) }
        }
        .frame(width: Constant.appWidth, height: Constant.appHeight)
        .onAppear { vm.loadAllData() }
    }
}

struct TabButton: View {
    let title: String; let icon: String; let index: Int
    @Binding var currentTab: Int
    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon).font(.system(size: 18))
            Text(title).font(.system(size: 10))
        }
        .foregroundColor(currentTab == index ? .blue : .secondary)
        .frame(width: 100, height: 50)
        .background(currentTab == index ? Color.blue.opacity(0.1) : Color.clear)
        .cornerRadius(8)
        .contentShape(Rectangle())
        .onTapGesture { withAnimation(.easeInOut(duration: 0.1)) { currentTab = index } }
    }
}
