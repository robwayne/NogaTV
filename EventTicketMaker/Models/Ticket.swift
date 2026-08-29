import Foundation

/// A single admission ticket. Every ticket carries its own code and QR payload,
/// even when several are created for the same person in one session.
struct Ticket: Identifiable, Codable, Hashable {
    var id: UUID
    var eventID: UUID
    /// Tickets created together in one "Create tickets" session share a batch ID.
    var batchID: UUID
    var fullName: String
    var phone: String
    var email: String
    var price: Decimal
    /// 1-based position within its batch, e.g. ticket 2 of 3.
    var indexInBatch: Int
    var batchSize: Int
    var code: String
    var createdAt: Date
    var isCheckedIn: Bool

    init(
        id: UUID = UUID(),
        eventID: UUID,
        batchID: UUID,
        fullName: String,
        phone: String,
        email: String,
        price: Decimal,
        indexInBatch: Int,
        batchSize: Int,
        code: String,
        createdAt: Date = Date(),
        isCheckedIn: Bool = false
    ) {
        self.id = id
        self.eventID = eventID
        self.batchID = batchID
        self.fullName = fullName
        self.phone = phone
        self.email = email
        self.price = price
        self.indexInBatch = indexInBatch
        self.batchSize = batchSize
        self.code = code
        self.createdAt = createdAt
        self.isCheckedIn = isCheckedIn
    }

    /// What actually gets encoded in the QR code. Scanning it at the door yields
    /// everything needed to validate the ticket offline.
    var qrPayload: String {
        [
            "ETM1",
            code,
            id.uuidString,
            eventID.uuidString,
            fullName
        ].joined(separator: "|")
    }

    var priceLabel: String { CurrencyFormat.string(from: price) }

    var seatLabel: String { "Ticket \(indexInBatch) of \(batchSize)" }

    /// Generates a human-readable ticket code such as "ETM-4F2A-9K3Q".
    static func makeCode() -> String {
        // Ambiguous characters (0/O, 1/I) are left out so codes are easy to read aloud.
        let alphabet = Array("ABCDEFGHJKLMNPQRSTUVWXYZ23456789")
        func block() -> String { String((0..<4).map { _ in alphabet.randomElement()! }) }
        return "ETM-\(block())-\(block())"
    }
}

enum CurrencyFormat {
    static var currencyCode: String { Locale.current.currency?.identifier ?? "USD" }

    static func string(from amount: Decimal) -> String {
        amount.formatted(.currency(code: currencyCode).precision(.fractionLength(2)))
    }
}
