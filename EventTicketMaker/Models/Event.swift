import Foundation
import SwiftUI
import UIKit

/// An event that tickets can be issued for.
struct Event: Identifiable, Codable, Hashable {
    var id: UUID
    var name: String
    var date: Date
    var location: String
    /// Optional logo, stored as PNG/JPEG data so it survives app launches.
    var logoData: Data?
    /// Index into `EventTheme.palette` — gives every event its own accent color.
    var themeIndex: Int

    init(
        id: UUID = UUID(),
        name: String,
        date: Date,
        location: String,
        logoData: Data? = nil,
        themeIndex: Int = 0
    ) {
        self.id = id
        self.name = name
        self.date = date
        self.location = location
        self.logoData = logoData
        self.themeIndex = themeIndex
    }

    var theme: EventTheme { EventTheme.palette[themeIndex % EventTheme.palette.count] }

    var logoImage: Image? {
        guard let logoData, let uiImage = UIImage(data: logoData) else { return nil }
        return Image(uiImage: uiImage)
    }

    var isUpcoming: Bool { date >= Date() }

    var dayLabel: String {
        date.formatted(.dateTime.weekday(.abbreviated).month(.abbreviated).day())
    }

    var timeLabel: String {
        date.formatted(date: .omitted, time: .shortened)
    }

    /// "Fri, Aug 29, 2026 at 9:00 PM" — used in tickets and confirmation texts.
    var fullDateLabel: String {
        date.formatted(.dateTime.weekday(.abbreviated).month(.abbreviated).day().year())
            + " at " + timeLabel
    }
}

/// Accent colors an event can be tagged with.
struct EventTheme: Hashable {
    var name: String
    var start: Color
    var end: Color

    var gradient: LinearGradient {
        LinearGradient(colors: [start, end], startPoint: .topLeading, endPoint: .bottomTrailing)
    }

    static let palette: [EventTheme] = [
        EventTheme(name: "Sunset", start: Color(red: 1.00, green: 0.42, blue: 0.42), end: Color(red: 0.98, green: 0.27, blue: 0.55)),
        EventTheme(name: "Midnight", start: Color(red: 0.35, green: 0.34, blue: 0.84), end: Color(red: 0.55, green: 0.27, blue: 0.90)),
        EventTheme(name: "Lagoon", start: Color(red: 0.13, green: 0.66, blue: 0.86), end: Color(red: 0.20, green: 0.83, blue: 0.66)),
        EventTheme(name: "Ember", start: Color(red: 0.98, green: 0.61, blue: 0.20), end: Color(red: 0.95, green: 0.33, blue: 0.24)),
        EventTheme(name: "Orchid", start: Color(red: 0.74, green: 0.31, blue: 0.86), end: Color(red: 0.40, green: 0.36, blue: 0.95)),
        EventTheme(name: "Forest", start: Color(red: 0.24, green: 0.66, blue: 0.42), end: Color(red: 0.13, green: 0.46, blue: 0.51))
    ]
}
