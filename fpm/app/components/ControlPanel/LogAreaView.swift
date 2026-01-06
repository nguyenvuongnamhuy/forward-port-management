import SwiftUI

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
                    VStack(alignment: .leading, spacing: 8) {
                        ForEach(vm.logs) { log in
                            VStack(alignment: .leading, spacing: 2) {
                                HStack(spacing: 6) {
                                    Text(log.timestamp, style: .time).foregroundColor(.secondary).frame(width: 50, alignment: .leading)
                                    Text("[\(log.categoryName)]").bold().foregroundColor(.blue)
                                    Text("[\(log.serverName)]").bold().foregroundColor(log.isError ? .red : .green)
                                    Spacer()
                                }
                                Text(log.message).foregroundColor(log.isError ? .red : .primary).fixedSize(horizontal: false, vertical: true)
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
