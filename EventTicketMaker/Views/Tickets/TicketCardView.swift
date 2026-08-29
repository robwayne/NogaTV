import SwiftUI

/// The ticket itself: event header, the details that were entered on the form,
/// and the ticket's own QR code below them.
struct TicketCardView: View {
    let ticket: Ticket
    let event: Event
    var qrSize: CGFloat = 150
    var notchColor: Color = Color(.systemGroupedBackground)

    var body: some View {
        VStack(spacing: 0) {
            header
            details
            PerforationLine(notchColor: notchColor)
                .padding(.vertical, 2)
            stub
        }
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: Layout.cardCorner, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: Layout.cardCorner, style: .continuous)
                .strokeBorder(Color(.separator).opacity(0.5), lineWidth: 0.5)
        }
        .shadow(color: .black.opacity(0.10), radius: 14, x: 0, y: 6)
    }

    // MARK: - Sections

    private var header: some View {
        HStack(alignment: .top, spacing: 14) {
            VStack(alignment: .leading, spacing: 6) {
                Text("ADMIT ONE")
                    .font(.system(size: 10, weight: .heavy))
                    .tracking(1.6)
                    .foregroundStyle(.white.opacity(0.85))

                Text(event.name)
                    .font(.system(size: 22, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)
                    .lineLimit(2)
                    .minimumScaleFactor(0.75)

                Label(event.fullDateLabel, systemImage: "clock")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(.white.opacity(0.9))

                Label(event.location, systemImage: "mappin.and.ellipse")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(.white.opacity(0.9))
                    .lineLimit(2)
            }

            Spacer(minLength: 0)

            logo
        }
        .padding(Layout.cardPadding)
        .background(event.theme.gradient)
    }

    @ViewBuilder
    private var logo: some View {
        if let image = event.logoImage {
            image
                .resizable()
                .scaledToFill()
                .frame(width: 54, height: 54)
                .clipShape(Circle())
                .overlay { Circle().strokeBorder(.white.opacity(0.7), lineWidth: 2) }
        } else {
            Circle()
                .fill(.white.opacity(0.2))
                .frame(width: 54, height: 54)
                .overlay {
                    Image(systemName: "ticket.fill")
                        .font(.system(size: 22, weight: .semibold))
                        .foregroundStyle(.white)
                }
                .overlay { Circle().strokeBorder(.white.opacity(0.45), lineWidth: 2) }
        }
    }

    private var details: some View {
        VStack(spacing: 14) {
            HStack(alignment: .top, spacing: 12) {
                DetailField(label: "Name", value: ticket.fullName)
                DetailField(label: "Price", value: ticket.priceLabel, alignment: .trailing)
            }
            HStack(alignment: .top, spacing: 12) {
                DetailField(label: "Phone", value: PhoneFormat.display(ticket.phone))
                DetailField(label: "Ticket", value: ticket.seatLabel, alignment: .trailing)
            }
            DetailField(label: "Email", value: ticket.email)
        }
        .padding(.horizontal, Layout.cardPadding)
        .padding(.vertical, 16)
    }

    private var stub: some View {
        VStack(spacing: 10) {
            QRCodeView(payload: ticket.qrPayload, size: qrSize)
                .padding(10)
                .background(.white, in: RoundedRectangle(cornerRadius: 14, style: .continuous))

            Text(ticket.code)
                .font(.system(size: 15, weight: .bold, design: .monospaced))
                .tracking(1.2)

            Text("Scan at the door")
                .font(.system(size: 11, weight: .medium))
                .foregroundStyle(.secondary)

            if ticket.isCheckedIn {
                Label("Checked in", systemImage: "checkmark.seal.fill")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(.green)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.horizontal, Layout.cardPadding)
        .padding(.top, 14)
        .padding(.bottom, Layout.cardPadding)
    }
}

/// Condensed row used in lists — same identity as the full card, less height.
struct TicketRowView: View {
    let ticket: Ticket
    let event: Event

    var body: some View {
        HStack(spacing: 14) {
            QRCodeView(payload: ticket.qrPayload, size: 44)

            VStack(alignment: .leading, spacing: 3) {
                Text(ticket.fullName)
                    .font(.system(size: 15, weight: .semibold))
                Text(ticket.code)
                    .font(.system(size: 12, weight: .medium, design: .monospaced))
                    .foregroundStyle(.secondary)
            }

            Spacer(minLength: 0)

            VStack(alignment: .trailing, spacing: 3) {
                Text(ticket.priceLabel)
                    .font(.system(size: 14, weight: .semibold))
                Text(ticket.seatLabel)
                    .font(.system(size: 11))
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}
