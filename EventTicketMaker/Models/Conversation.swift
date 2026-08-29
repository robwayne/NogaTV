import Foundation

/// One thread in the Messages tab. Threads are keyed by recipient, so every
/// batch of tickets sent to the same person lands in the same conversation.
struct Conversation: Identifiable, Codable, Hashable {
    var id: UUID
    var contactName: String
    var phone: String
    var email: String
    var messages: [ChatMessage]
    var isUnread: Bool
    var isPinned: Bool

    init(
        id: UUID = UUID(),
        contactName: String,
        phone: String,
        email: String = "",
        messages: [ChatMessage] = [],
        isUnread: Bool = false,
        isPinned: Bool = false
    ) {
        self.id = id
        self.contactName = contactName
        self.phone = phone
        self.email = email
        self.messages = messages
        self.isUnread = isUnread
        self.isPinned = isPinned
    }

    /// Recipients are matched on digits only, so "(555) 123-4567" and
    /// "5551234567" are treated as the same person.
    var matchKey: String {
        let digits = phone.filter(\.isNumber)
        if !digits.isEmpty { return "tel:\(digits)" }
        if !email.isEmpty { return "mail:\(email.lowercased())" }
        return "name:\(contactName.lowercased())"
    }

    var lastMessage: ChatMessage? { messages.last }

    var sortDate: Date { lastMessage?.date ?? .distantPast }

    var initials: String {
        let parts = contactName
            .split(separator: " ")
            .prefix(2)
            .compactMap { $0.first }
        let value = String(parts).uppercased()
        return value.isEmpty ? "#" : value
    }
}

/// A message inside a conversation.
struct ChatMessage: Identifiable, Codable, Hashable {
    var id: UUID
    var text: String
    var date: Date
    var isFromMe: Bool
    /// Tickets referenced by this message — lets the bubble show a tappable
    /// ticket attachment underneath the text.
    var ticketIDs: [UUID]
    var eventID: UUID?
    var deliveryNote: String?

    init(
        id: UUID = UUID(),
        text: String,
        date: Date = Date(),
        isFromMe: Bool = true,
        ticketIDs: [UUID] = [],
        eventID: UUID? = nil,
        deliveryNote: String? = nil
    ) {
        self.id = id
        self.text = text
        self.date = date
        self.isFromMe = isFromMe
        self.ticketIDs = ticketIDs
        self.eventID = eventID
        self.deliveryNote = deliveryNote
    }

    var hasTickets: Bool { !ticketIDs.isEmpty }
}
