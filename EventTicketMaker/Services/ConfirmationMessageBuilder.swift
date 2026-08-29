import Foundation

/// Builds the confirmation text that gets dropped into the Messages tab after a
/// batch of tickets is created.
///
/// This is the single place the wording lives. When you have the exact copy you
/// want, edit `text(for:event:)` below and every future confirmation picks it up
/// — nothing else in the app needs to change.
enum ConfirmationMessageBuilder {

    static func text(for tickets: [Ticket], event: Event) -> String {
        guard let first = tickets.first else { return "" }

        let total = tickets.reduce(Decimal.zero) { $0 + $1.price }
        let firstName = first.fullName.split(separator: " ").first.map(String.init) ?? first.fullName
        let codes = tickets.map { "• \($0.code)" }.joined(separator: "\n")

        var lines: [String] = []
        lines.append("🎟️ TICKET CONFIRMATION")
        lines.append("")
        lines.append("Hi \(firstName), you're all set!")
        lines.append("")
        lines.append("EVENT: \(event.name)")
        lines.append("WHEN: \(event.fullDateLabel)")
        lines.append("WHERE: \(event.location)")
        lines.append("")
        lines.append("NAME: \(first.fullName)")
        if !first.phone.isEmpty { lines.append("PHONE: \(PhoneFormat.display(first.phone))") }
        if !first.email.isEmpty { lines.append("EMAIL: \(first.email)") }
        lines.append("TICKETS: \(tickets.count)")
        lines.append("TOTAL: \(CurrencyFormat.string(from: total))")
        lines.append("")
        lines.append(tickets.count == 1 ? "TICKET CODE:" : "TICKET CODES:")
        lines.append(codes)
        lines.append("")
        lines.append("Show the QR code at the door for entry. See you there!")

        return lines.joined(separator: "\n")
    }

    /// Short line shown under the bubble, mirroring iMessage's delivery status.
    static func deliveryNote(ticketCount: Int) -> String {
        ticketCount == 1 ? "1 ticket attached" : "\(ticketCount) tickets attached"
    }
}

enum PhoneFormat {
    /// Formats 10-digit US numbers as (555) 123-4567 and 11-digit numbers
    /// starting with 1 as +1 (555) 123-4567. Anything else is left untouched.
    static func display(_ raw: String) -> String {
        let digits = raw.filter(\.isNumber)
        switch digits.count {
        case 10:
            return format10(Array(digits))
        case 11 where digits.hasPrefix("1"):
            return "+1 " + format10(Array(digits.dropFirst()))
        default:
            return raw
        }
    }

    private static func format10(_ d: [Character]) -> String {
        "(\(String(d[0..<3]))) \(String(d[3..<6]))-\(String(d[6..<10]))"
    }

    static func isPlausible(_ raw: String) -> Bool {
        (7...15).contains(raw.filter(\.isNumber).count)
    }
}

extension String {
    var isBlank: Bool { trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }
    var trimmed: String { trimmingCharacters(in: .whitespacesAndNewlines) }

    var looksLikeEmail: Bool {
        let parts = split(separator: "@", omittingEmptySubsequences: false)
        guard parts.count == 2, !parts[0].isEmpty else { return false }
        let domain = parts[1]
        return domain.contains(".") && !domain.hasPrefix(".") && !domain.hasSuffix(".")
    }
}
