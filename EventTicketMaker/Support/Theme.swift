import SwiftUI

enum Layout {
    static let cardCorner: CGFloat = 26
    static let cardPadding: CGFloat = 18
}

/// Small uppercase label + value pair used throughout ticket cards.
struct DetailField: View {
    let label: String
    let value: String
    var alignment: HorizontalAlignment = .leading
    var tint: Color = .primary

    var body: some View {
        VStack(alignment: alignment, spacing: 3) {
            Text(label.uppercased())
                .font(.system(size: 10, weight: .semibold))
                .tracking(0.8)
                .foregroundStyle(.secondary)
            Text(value)
                .font(.system(size: 15, weight: .semibold, design: .rounded))
                .foregroundStyle(tint)
                .lineLimit(2)
                .minimumScaleFactor(0.7)
        }
        .frame(maxWidth: .infinity, alignment: alignment == .trailing ? .trailing : .leading)
    }
}

/// The tear line between a ticket's details and its QR stub.
struct PerforationLine: View {
    var notchColor: Color = Color(.systemGroupedBackground)

    var body: some View {
        HStack(spacing: 0) {
            Circle()
                .fill(notchColor)
                .frame(width: 22, height: 22)
                .offset(x: -11)
            Line()
                .stroke(style: StrokeStyle(lineWidth: 1.5, dash: [5, 5]))
                .foregroundStyle(.quaternary)
                .frame(height: 1.5)
                .padding(.horizontal, 2)
            Circle()
                .fill(notchColor)
                .frame(width: 22, height: 22)
                .offset(x: 11)
        }
        .frame(height: 22)
    }
}

struct Line: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: rect.minX, y: rect.midY))
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.midY))
        return path
    }
}

/// Placeholder used by empty states across the three tabs.
struct EmptyStateView: View {
    let icon: String
    let title: String
    let message: String
    var actionTitle: String? = nil
    var action: (() -> Void)? = nil

    var body: some View {
        VStack(spacing: 14) {
            Image(systemName: icon)
                .font(.system(size: 44, weight: .light))
                .foregroundStyle(.secondary)
            Text(title)
                .font(.title3.weight(.semibold))
            Text(message)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .frame(maxWidth: 300)
            if let actionTitle, let action {
                Button(actionTitle, action: action)
                    .buttonStyle(.glassProminent)
                    .padding(.top, 4)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 48)
    }
}
