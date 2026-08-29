import Foundation
import Observation

/// Describes one "create tickets" session before the tickets actually exist.
struct TicketDraft {
    var eventID: UUID?
    var fullName: String = ""
    var phone: String = ""
    var email: String = ""
    var priceText: String = ""
    var quantity: Int = 1

    var price: Decimal {
        let cleaned = priceText.filter { $0.isNumber || $0 == "." || $0 == "," }
            .replacingOccurrences(of: ",", with: ".")
        return Decimal(string: cleaned) ?? .zero
    }

    var total: Decimal { price * Decimal(quantity) }

    /// Field-level problems, surfaced inline in the form.
    var validationIssues: [String] {
        var issues: [String] = []
        if eventID == nil { issues.append("Choose an event") }
        if fullName.trimmed.isBlank { issues.append("Enter a full name") }
        if phone.trimmed.isBlank {
            issues.append("Enter a phone number")
        } else if !PhoneFormat.isPlausible(phone) {
            issues.append("That phone number doesn't look right")
        }
        if email.trimmed.isBlank {
            issues.append("Enter an email address")
        } else if !email.trimmed.looksLikeEmail {
            issues.append("That email address doesn't look right")
        }
        if priceText.trimmed.isBlank { issues.append("Enter a price") }
        return issues
    }

    var isValid: Bool { validationIssues.isEmpty }
}

@Observable
@MainActor
final class AppStore {
    private(set) var events: [Event] = []
    private(set) var tickets: [Ticket] = []
    private(set) var conversations: [Conversation] = []

    private let persistence: PersistenceController

    init(persistence: PersistenceController = PersistenceController(), seedIfEmpty: Bool = true) {
        self.persistence = persistence
        if let data = persistence.load() {
            events = data.events
            tickets = data.tickets
            conversations = data.conversations
        } else if seedIfEmpty {
            let sample = SampleData.make()
            events = sample.events
            tickets = sample.tickets
            conversations = sample.conversations
            save()
        }
    }

    // MARK: - Derived state

    var sortedEvents: [Event] {
        events.sorted { $0.date < $1.date }
    }

    var upcomingEvents: [Event] {
        sortedEvents.filter(\.isUpcoming)
    }

    var pastEvents: [Event] {
        sortedEvents.filter { !$0.isUpcoming }.reversed()
    }

    var sortedConversations: [Conversation] {
        conversations.sorted {
            if $0.isPinned != $1.isPinned { return $0.isPinned }
            return $0.sortDate > $1.sortDate
        }
    }

    var unreadCount: Int {
        conversations.filter(\.isUnread).count
    }

    func event(id: UUID?) -> Event? {
        guard let id else { return nil }
        return events.first { $0.id == id }
    }

    func ticket(id: UUID) -> Ticket? {
        tickets.first { $0.id == id }
    }

    func resolveTickets(ids: [UUID]) -> [Ticket] {
        ids.compactMap { id in tickets.first { $0.id == id } }
    }

    func ticketsIssued(for eventID: UUID) -> [Ticket] {
        tickets.filter { $0.eventID == eventID }
    }

    /// Tickets grouped by the session that created them, newest batch first.
    func ticketBatches(matching query: String = "") -> [TicketBatch] {
        let filtered = query.trimmed.isBlank ? tickets : tickets.filter { ticket in
            let haystack = [ticket.fullName, ticket.email, ticket.phone, ticket.code,
                            event(id: ticket.eventID)?.name ?? ""].joined(separator: " ")
            return haystack.localizedCaseInsensitiveContains(query.trimmed)
        }

        return Dictionary(grouping: filtered, by: \.batchID)
            .values
            .compactMap { group -> TicketBatch? in
                let ordered = group.sorted { $0.indexInBatch < $1.indexInBatch }
                guard let first = ordered.first else { return nil }
                return TicketBatch(id: first.batchID, tickets: ordered)
            }
            .sorted { $0.createdAt > $1.createdAt }
    }

    var revenue: Decimal {
        tickets.reduce(Decimal.zero) { $0 + $1.price }
    }

    // MARK: - Events

    func addEvent(_ event: Event) {
        events.append(event)
        save()
    }

    func updateEvent(_ event: Event) {
        guard let index = events.firstIndex(where: { $0.id == event.id }) else { return }
        events[index] = event
        save()
    }

    /// Deletes an event and every ticket issued for it. Conversations are kept —
    /// the confirmation history stays readable even after an event is removed.
    func deleteEvent(_ event: Event) {
        events.removeAll { $0.id == event.id }
        tickets.removeAll { $0.eventID == event.id }
        save()
    }

    // MARK: - Tickets

    /// Creates the tickets described by `draft` and posts the confirmation text
    /// into the recipient's thread in the Messages tab.
    @discardableResult
    func createTickets(from draft: TicketDraft) -> TicketBatch? {
        guard draft.isValid, let event = event(id: draft.eventID) else { return nil }

        let batchID = UUID()
        let quantity = max(1, draft.quantity)
        let created = (1...quantity).map { index in
            Ticket(
                eventID: event.id,
                batchID: batchID,
                fullName: draft.fullName.trimmed,
                phone: draft.phone.trimmed,
                email: draft.email.trimmed,
                price: draft.price,
                indexInBatch: index,
                batchSize: quantity,
                code: Ticket.makeCode()
            )
        }

        tickets.append(contentsOf: created)
        postConfirmation(for: created, event: event)
        save()

        return TicketBatch(id: batchID, tickets: created)
    }

    func deleteTickets(_ toDelete: [Ticket]) {
        let ids = Set(toDelete.map(\.id))
        tickets.removeAll { ids.contains($0.id) }
        save()
    }

    func toggleCheckIn(_ ticket: Ticket) {
        guard let index = tickets.firstIndex(where: { $0.id == ticket.id }) else { return }
        tickets[index].isCheckedIn.toggle()
        save()
    }

    // MARK: - Messages

    /// Appends the confirmation to the recipient's existing thread, or starts a
    /// new one if this is the first time they've been issued a ticket.
    private func postConfirmation(for tickets: [Ticket], event: Event) {
        guard let first = tickets.first else { return }

        let message = ChatMessage(
            text: ConfirmationMessageBuilder.text(for: tickets, event: event),
            isFromMe: true,
            ticketIDs: tickets.map(\.id),
            eventID: event.id,
            deliveryNote: ConfirmationMessageBuilder.deliveryNote(ticketCount: tickets.count)
        )

        let candidate = Conversation(
            contactName: first.fullName,
            phone: first.phone,
            email: first.email
        )

        if let index = conversations.firstIndex(where: { $0.matchKey == candidate.matchKey }) {
            conversations[index].messages.append(message)
            conversations[index].contactName = first.fullName
            if conversations[index].email.isBlank { conversations[index].email = first.email }
            conversations[index].isUnread = true
        } else {
            var conversation = candidate
            conversation.messages = [message]
            conversation.isUnread = true
            conversations.append(conversation)
        }
    }

    func sendMessage(_ text: String, in conversation: Conversation) {
        guard !text.trimmed.isBlank,
              let index = conversations.firstIndex(where: { $0.id == conversation.id }) else { return }
        conversations[index].messages.append(ChatMessage(text: text.trimmed, isFromMe: true))
        save()
    }

    func markRead(_ conversation: Conversation) {
        guard let index = conversations.firstIndex(where: { $0.id == conversation.id }),
              conversations[index].isUnread else { return }
        conversations[index].isUnread = false
        save()
    }

    func togglePinned(_ conversation: Conversation) {
        guard let index = conversations.firstIndex(where: { $0.id == conversation.id }) else { return }
        conversations[index].isPinned.toggle()
        save()
    }

    func deleteConversation(_ conversation: Conversation) {
        conversations.removeAll { $0.id == conversation.id }
        save()
    }

    // MARK: - Persistence

    private func save() {
        persistence.save(AppData(events: events, tickets: tickets, conversations: conversations))
    }
}

/// A group of tickets created together in one session.
struct TicketBatch: Identifiable, Hashable {
    var id: UUID
    var tickets: [Ticket]

    var first: Ticket { tickets[0] }
    var createdAt: Date { first.createdAt }
    var eventID: UUID { first.eventID }
    var fullName: String { first.fullName }
    var count: Int { tickets.count }
    var total: Decimal { tickets.reduce(Decimal.zero) { $0 + $1.price } }
    var totalLabel: String { CurrencyFormat.string(from: total) }
}
