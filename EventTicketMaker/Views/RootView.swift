import SwiftUI

enum AppTab: Hashable {
    case tickets, events, messages
}

struct RootView: View {
    @Environment(AppStore.self) private var store
    @State private var selection: AppTab = .tickets

    var body: some View {
        TabView(selection: $selection) {
            Tab("Tickets", systemImage: "ticket.fill", value: AppTab.tickets) {
                TicketsView()
            }

            Tab("Events", systemImage: "calendar", value: AppTab.events) {
                EventsView()
            }

            Tab("Messages", systemImage: "message.fill", value: AppTab.messages) {
                MessagesView()
            }
            .badge(store.unreadCount)
        }
        // Liquid Glass tab bar shrinks out of the way while you scroll a list.
        .tabBarMinimizeBehavior(.onScrollDown)
    }
}

#Preview {
    RootView()
        .environment(AppStore(persistence: PersistenceController(filename: "preview.json")))
}
