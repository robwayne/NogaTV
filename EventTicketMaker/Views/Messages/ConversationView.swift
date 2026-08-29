import SwiftUI

/// A single thread. Confirmation texts appear as outgoing bubbles with the
/// generated tickets attached underneath.
struct ConversationView: View {
    @Environment(AppStore.self) private var store
    let conversationID: UUID

    @State private var draftText = ""
    @State private var selectedBatch: TicketBatch?
    @FocusState private var isComposerFocused: Bool

    private var conversation: Conversation? {
        store.conversations.first { $0.id == conversationID }
    }

    var body: some View {
        Group {
            if let conversation {
                VStack(spacing: 0) {
                    transcript(conversation)
                    composer(conversation)
                }
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .principal) {
                        header(conversation)
                    }
                }
                .onAppear { store.markRead(conversation) }
            } else {
                EmptyStateView(
                    icon: "message.badge.waveform",
                    title: "Conversation deleted",
                    message: "This thread is no longer available."
                )
            }
        }
        .navigationDestination(item: $selectedBatch) { batch in
            TicketBatchView(batch: batch)
        }
    }

    // MARK: - Pieces

    private func header(_ conversation: Conversation) -> some View {
        VStack(spacing: 2) {
            Avatar(initials: conversation.initials, seed: conversation.matchKey, size: 32)
            Text(conversation.contactName)
                .font(.system(size: 12, weight: .medium))
        }
        .padding(.bottom, 2)
    }

    private func transcript(_ conversation: Conversation) -> some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 3) {
                    ForEach(Array(conversation.messages.enumerated()), id: \.element.id) { index, message in
                        if showsSeparator(at: index, in: conversation) {
                            Text(RelativeDate.separator(for: message.date))
                                .font(.system(size: 12, weight: .medium))
                                .foregroundStyle(.secondary)
                                .frame(maxWidth: .infinity)
                                .padding(.top, index == 0 ? 12 : 20)
                                .padding(.bottom, 6)
                        }

                        MessageBubble(
                            message: message,
                            hasTail: hasTail(at: index, in: conversation),
                            event: store.event(id: message.eventID),
                            tickets: store.resolveTickets(ids: message.ticketIDs),
                            onOpenTickets: { openTickets(for: message) }
                        )
                        .padding(.horizontal, 14)
                        .padding(.top, isStartOfRun(at: index, in: conversation) ? 8 : 0)
                        .id(message.id)
                    }

                    Color.clear.frame(height: 8).id(bottomAnchor)
                }
            }
            .defaultScrollAnchor(.bottom)
            .scrollDismissesKeyboard(.interactively)
            .onChange(of: conversation.messages.count) {
                withAnimation(.easeOut(duration: 0.25)) {
                    proxy.scrollTo(bottomAnchor, anchor: .bottom)
                }
            }
        }
    }

    private func composer(_ conversation: Conversation) -> some View {
        GlassEffectContainer(spacing: 10) {
            HStack(spacing: 10) {
                Button {
                    // Placeholder for attachments, matching the Messages layout.
                } label: {
                    Image(systemName: "plus")
                        .font(.system(size: 18, weight: .medium))
                        .frame(width: 34, height: 34)
                }
                .buttonStyle(.glass)
                .clipShape(Circle())

                HStack(spacing: 6) {
                    TextField("Message", text: $draftText, axis: .vertical)
                        .lineLimit(1...5)
                        .focused($isComposerFocused)
                        .padding(.leading, 14)
                        .padding(.vertical, 8)

                    Button {
                        send(in: conversation)
                    } label: {
                        Image(systemName: "arrow.up")
                            .font(.system(size: 15, weight: .bold))
                            .foregroundStyle(.white)
                            .frame(width: 28, height: 28)
                            .background(Color.accentColor, in: Circle())
                    }
                    .disabled(draftText.trimmed.isBlank)
                    .opacity(draftText.trimmed.isBlank ? 0.35 : 1)
                    .padding(.trailing, 5)
                    .padding(.vertical, 4)
                }
                .glassEffect(.regular, in: .capsule)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
        }
    }

    private let bottomAnchor = "conversation-bottom"

    // MARK: - Grouping helpers

    private func isStartOfRun(at index: Int, in conversation: Conversation) -> Bool {
        guard index > 0 else { return true }
        return conversation.messages[index - 1].isFromMe != conversation.messages[index].isFromMe
    }

    /// Only the last message of a run gets a tail, as in Messages.
    private func hasTail(at index: Int, in conversation: Conversation) -> Bool {
        let messages = conversation.messages
        guard index < messages.count - 1 else { return true }
        return messages[index + 1].isFromMe != messages[index].isFromMe
    }

    private func showsSeparator(at index: Int, in conversation: Conversation) -> Bool {
        guard index > 0 else { return true }
        let previous = conversation.messages[index - 1].date
        let current = conversation.messages[index].date
        // New day, or a gap of more than an hour.
        return !Calendar.current.isDate(previous, inSameDayAs: current)
            || current.timeIntervalSince(previous) > 3600
    }

    // MARK: - Actions

    private func openTickets(for message: ChatMessage) {
        let tickets = store.resolveTickets(ids: message.ticketIDs)
        guard let first = tickets.first else { return }
        selectedBatch = TicketBatch(id: first.batchID, tickets: tickets)
    }

    private func send(in conversation: Conversation) {
        store.sendMessage(draftText, in: conversation)
        draftText = ""
    }
}
