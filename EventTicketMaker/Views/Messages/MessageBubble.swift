import SwiftUI

/// iMessage-style bubble with an optional tail on the last message of a run.
struct BubbleShape: Shape {
    var isFromMe: Bool
    var hasTail: Bool
    var radius: CGFloat = 20

    func path(in rect: CGRect) -> Path {
        var path = Path(roundedRect: rect, cornerRadius: radius, style: .continuous)
        guard hasTail else { return path }

        let tailWidth: CGFloat = 9
        let bottom = rect.maxY
        var tail = Path()

        if isFromMe {
            let x = rect.maxX
            tail.move(to: CGPoint(x: x - radius, y: bottom))
            tail.addQuadCurve(
                to: CGPoint(x: x + tailWidth, y: bottom),
                control: CGPoint(x: x - 2, y: bottom - 2)
            )
            tail.addQuadCurve(
                to: CGPoint(x: x - 6, y: bottom - radius * 0.55),
                control: CGPoint(x: x - 1, y: bottom - 6)
            )
        } else {
            let x = rect.minX
            tail.move(to: CGPoint(x: x + radius, y: bottom))
            tail.addQuadCurve(
                to: CGPoint(x: x - tailWidth, y: bottom),
                control: CGPoint(x: x + 2, y: bottom - 2)
            )
            tail.addQuadCurve(
                to: CGPoint(x: x + 6, y: bottom - radius * 0.55),
                control: CGPoint(x: x + 1, y: bottom - 6)
            )
        }

        path.addPath(tail)
        return path
    }
}

struct MessageBubble: View {
    let message: ChatMessage
    let hasTail: Bool
    let event: Event?
    let tickets: [Ticket]
    var onOpenTickets: () -> Void

    private var outgoingFill: LinearGradient {
        LinearGradient(
            colors: [Color(red: 0.20, green: 0.56, blue: 1.0), Color(red: 0.05, green: 0.42, blue: 0.98)],
            startPoint: .top,
            endPoint: .bottom
        )
    }

    var body: some View {
        HStack {
            if message.isFromMe { Spacer(minLength: 48) }

            VStack(alignment: message.isFromMe ? .trailing : .leading, spacing: 6) {
                VStack(alignment: .leading, spacing: 12) {
                    Text(message.text)
                        .font(.system(size: 16))
                        .textSelection(.enabled)
                        .foregroundStyle(message.isFromMe ? .white : Color.primary)
                        .fixedSize(horizontal: false, vertical: true)

                    if !tickets.isEmpty {
                        attachment
                    }
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background {
                    if message.isFromMe {
                        BubbleShape(isFromMe: true, hasTail: hasTail).fill(outgoingFill)
                    } else {
                        BubbleShape(isFromMe: false, hasTail: hasTail)
                            .fill(Color(.secondarySystemBackground))
                    }
                }

                if let note = message.deliveryNote {
                    Text(note)
                        .font(.system(size: 11))
                        .foregroundStyle(.secondary)
                        .padding(.horizontal, 6)
                }
            }
            .frame(maxWidth: 300, alignment: message.isFromMe ? .trailing : .leading)

            if !message.isFromMe { Spacer(minLength: 48) }
        }
    }

    /// Ticket attachment rendered inside the bubble, like a link preview.
    private var attachment: some View {
        Button(action: onOpenTickets) {
            HStack(spacing: 10) {
                if let ticket = tickets.first {
                    QRCodeView(payload: ticket.qrPayload, size: 46)
                        .padding(5)
                        .background(.white, in: RoundedRectangle(cornerRadius: 9, style: .continuous))
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(event?.name ?? "Tickets")
                        .font(.system(size: 13, weight: .semibold))
                        .lineLimit(1)
                    Text(tickets.count == 1 ? "1 ticket" : "\(tickets.count) tickets")
                        .font(.system(size: 12))
                        .opacity(0.85)
                }

                Spacer(minLength: 0)

                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .semibold))
                    .opacity(0.7)
            }
            .foregroundStyle(message.isFromMe ? Color.white : Color.primary)
            .padding(8)
            .background(
                (message.isFromMe ? Color.white.opacity(0.18) : Color(.tertiarySystemBackground)),
                in: RoundedRectangle(cornerRadius: 14, style: .continuous)
            )
        }
        .buttonStyle(.plain)
    }
}
