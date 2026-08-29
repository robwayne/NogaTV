# EventTicketMaker

A SwiftUI iPhone app (iOS 26) for generating event tickets with QR codes, and keeping
the confirmation texts for every ticket you issue.

## Three tabs

| Tab | What it does |
| --- | --- |
| **Tickets** | Create tickets and preview them full-size. Each ticket shows the details you entered with its own generated QR code beneath them. |
| **Events** | Add the parties, dinners, or anything else you sell tickets for: name, date & time, location, an optional logo image, and an accent color. |
| **Messages** | Modeled on the iOS 26 Messages app. Every time a batch of tickets is created, the confirmation text is appended to that person's thread, with the tickets attached to the bubble. |

## Creating tickets

1. Add an event on the **Events** tab (name, time, location, optional logo).
2. On **Tickets**, tap **+**. Choose the event, then enter full name, phone number,
   email, price per ticket, and how many tickets to create.
3. The preview at the bottom of the form updates live as you type.
4. Tap **Create**. Each ticket is minted with its own code (`ETM-4F2A-9K3Q`) and QR
   code, and the confirmation text is posted to the Messages tab automatically.

Tickets can be swiped through one at a time, shared as an image, and marked checked in.

## Changing the confirmation text

The wording of the confirmation message lives in exactly one place:

`EventTicketMaker/Services/ConfirmationMessageBuilder.swift` → `text(for:event:)`

Edit that function and every future confirmation uses the new format. The current
format is:

```
🎟️ TICKET CONFIRMATION

Hi Maya, you're all set!

EVENT: Rooftop Summer Party
WHEN: Sat, Sep 6, 2026 at 9:00 PM
WHERE: The Nines Rooftop, 240 Bedford Ave

NAME: Maya Osei
PHONE: (555) 123-4567
EMAIL: maya.osei@example.com
TICKETS: 2
TOTAL: $90.00

TICKET CODES:
• ETM-4F2A-9K3Q
• ETM-7HTB-2M4X

Show the QR code at the door for entry. See you there!
```

## What's in the QR code

Each QR code encodes a pipe-separated payload — `ETM1|code|ticket UUID|event UUID|name`
— so a scanner at the door can validate a ticket without a network connection.
See `Ticket.qrPayload`.

## Building

1. Open `EventTicketMaker.xcodeproj` in Xcode 26.
2. Select the **EventTicketMaker** target → **Signing & Capabilities**, pick your team,
   and change the bundle identifier to something unique to you.
3. Run on your iPhone (iOS 26 or later).

## Project layout

```
EventTicketMaker/
├── EventTicketMakerApp.swift      App entry point
├── Models/                        Event, Ticket, Conversation
├── Store/                         AppStore (state), JSON persistence, first-launch samples
├── Services/                      QR generation, confirmation-text builder, formatters
├── Support/                       Shared styling: detail fields, perforation, empty states
└── Views/
    ├── RootView.swift             The three-tab shell
    ├── Tickets/                   List, create form, full-size ticket, ticket card
    ├── Events/                    Event list and add/edit form
    └── Messages/                  Conversation list, thread, bubbles
```

Data is stored as a single JSON file in Application Support, so nothing leaves the device.
