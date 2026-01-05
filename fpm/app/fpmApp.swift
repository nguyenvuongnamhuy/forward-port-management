//
//  fpmApp.swift
//  fpm
//
//  Created by Huy Nguyen on 4/1/26.
//

import SwiftUI

@main
struct fpmApp: App {
    var body: some Scene {
        WindowGroup("Forward Port Management") {
            ContentView()
        }
        .windowResizability(.contentSize)
        .defaultSize(width: Constant.appWidth, height: Constant.appHeight)
    }
}

#Preview {
    ContentView()
}
