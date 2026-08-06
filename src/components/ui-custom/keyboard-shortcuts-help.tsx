import { KEYBOARD_SHORTCUTS } from "@/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const items = [
  { label: "Search", key: KEYBOARD_SHORTCUTS.SEARCH },
  { label: "New Sale", key: KEYBOARD_SHORTCUTS.NEW_SALE },
  { label: "Hold Order", key: KEYBOARD_SHORTCUTS.HOLD_ORDER },
  { label: "Payment", key: KEYBOARD_SHORTCUTS.PAYMENT },
  { label: "Print", key: KEYBOARD_SHORTCUTS.PRINT },
  { label: "Settings", key: KEYBOARD_SHORTCUTS.SETTINGS },
];

export function KeyboardShortcutsHelp() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Keyboard Shortcuts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-3"
          >
            <span className="text-sm">{item.label}</span>
            <kbd className="rounded border bg-muted px-2 py-1 text-xs font-medium">
              {item.key}
            </kbd>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}