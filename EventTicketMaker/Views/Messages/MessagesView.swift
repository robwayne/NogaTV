import SwiftUI

/// Conversation list, modeled on the Messages app: search, pinned threads,
/// unread dots, swipe actions, and a glass compose button.
struct MessagesView: View {
    @Environment(AppStore.self) private var store
    @State private var searchText = ""

    private var conversations: [Conversation] {
        let all = store.sortedConversations
        guard !searchText.trimmed.isBlank else { return all }
        return all.filter { conversation in
            let haystack = ([conversation.contactName, conversation.phone, conversation.email]
                + conversation.messages.map(\.text)).joined(separator: " ")
            return haystack.localizedCaseInsensitiveContains(searchText.trimmed)
        }
    }

    var body: some View {
        NavigationStack {
            Group {
                if store.conversations.isEmpty {
                    ScrollView {
                        EmptyStateView(
                            icon: "message",
                            title: "No messages yet",
                            message: "Every time you create tickets, the confirmation text lands here."
                        )
                    }
                } else if conversations.isEmpty {
                    ContentUnavailableView.search(text: searchText)
                } else {
                    list
                }
            }
            .navigationTitle("Messages")
            .searchable(text: $searchText, prompt: "Search")
            .navigationDestination(for: Conversation.self) { conversation in
                ConversationView(conversationID: conversation.id)
            }
        }
    }

    private var list: some View {
        List {
            ForEach(conversations) { conversation in
                NavigationLink(value: conversation) {
                    ConversationRow(conversation: conversation)
                }
                .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 12))
                .swipeActions(edge: .leading) {
                    Button {
                        store.togglePinned(conversation)
                    } label: {
                        Label(conversation.isPinned ? "Unpin" : "Pin",
                              systemImage: conversation.isPinned ? "pin.slash.fill" : "pin.fill")
                    }
                    .tint(.orange)
                }
                .swipeActions(edge: .trailing) {
                    Button(role: .destructive) {
                        store.deleteConversation(conversation)
                    } label: {
                        Label("Delete", systemImage: "trash")
                    }
                }
            }
        }
        .listStyle(.plain)
    }
}

struct ConversationRow: View {
    let conversation: Conversation

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            unreadDot

            Avatar(initials: conversation.initials, seed: conversation.matchKey)

            VStack(alignment: .leading, spacing: 2) {
                HStack(alignment: .firstTextBaseline) {
                    Text(conversation.contactName)
                        .font(.system(size: 17, weight: .semibold))
                        .lineLimit(1)
                    Spacer(minLength: 8)
                    if conversation.isPinned {
                        Image(systemName: "pin.fill")
                            .font(.system(size: 10))
                            .foregroundStyle(.tertiary)
                    }
                    Text(RelativeDate.label(for: conversation.sortDate))
                        .font(.system(size: 13))
                        .foregroundStyle(.secondary)
                }

                Text(previewText)
                    .font(.system(size: 15))
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)
            }
        }
        .padding(.vertical, 2)
    }

    private var previewText: String {
        guard let last = conversation.lastMessage else { return "No messages" }
        // Confirmation texts are multi-line; flatten them for the preview row.
        let flattened = last.text
            .replacingOccurrences(of: "\n", with: " ")
            .replacingOccurrences(of: "  ", with: " ")
        return flattened.trimmed
    }

    @ViewBuilder
    private var unreadDot: some View {
        Circle()
            .fill(Color.accentColor)
            .frame(width: 9, height: 9)
            .opacity(conversation.isUnread ? 1 : 0)
            .padding(.top, 16)
    }
}

/// Circular monogram avatar with a stable per-contact color.
struct Avatar: View {
    let initials: String
    let seed: String
    var size: CGFloat = 50

    private var gradient: LinearGradient {
        let index = abs(seed.hashValue) % EventTheme.palette.count
        return EventTheme.palette[index].gradient
    }

    var body: some View {
        Circle()
            .fill(gradient)
            .frame(width: size, height: size)
            .overlay {
                Text(initials)
                    .font(.system(size: size * 0.38, weight: .semibold, design: .rounded))
                    .foregroundStyle(.white)
            }
    }
}

enum RelativeDate {
    /// Messages-style timestamps: time today, "Yesterday", weekday this week,
    /// then a short date.
    static func label(for date: Date) -> String {
        let calendar = Calendar.current
        if calendar.isDateInToday(date) {
            return date.formatted(date: .omitted, time: .shortened)
        }
        if calendar.isDateInYesterday(date) {
            return "Yesterday"
        }
        if let days = calendar.dateComponents([.day], from: date, to: Date()).day, days < 7 {
            return date.formatted(.dateTime.weekday(.abbreviated))
        }
        return date.formatted(.dateTime.month(.defaultDigits).day().year(.twoDigits))
    }

    /// Header shown above a run of messages from the same day.
    static func separator(for date: Date) -> String {
        let calendar = Calendar.current
        let time = date.formatted(date: .omitted, time: .shortened)
        if calendar.isDateInToday(date) { return "Today  \(time)" }
        if calendar.isDateInYesterday(date) { return "Yesterday  \(time)" }
        return date.formatted(.dateTime.weekday(.abbreviated).month(.abbreviated).day()) + "  " + time
    }
}
