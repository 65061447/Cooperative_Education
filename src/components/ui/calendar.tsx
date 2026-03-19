"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import {
  DayButton,
  DayPicker,
  getDefaultClassNames,
  type DayPickerProps,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

export type CalendarProps = DayPickerProps & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:2rem]",
        className
      )}
      modifiersClassNames={{
        selected: "bg-[#334e5e] text-white hover:bg-[#334e5e]",
      }}
      formatters={{
        // FIX: The static label display (e.g. March 2569)
        formatCaption: (date, options) => {
          const month = date.toLocaleString(options?.locale?.code || "default", { month: "long" });
          return `${month} ${date.getFullYear() + 543}`;
        },
        // FIX: The text inside the Year dropdown button
        formatYearDropdown: (date) => {
          return (date.getFullYear() + 543).toString();
        },
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn("absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1", defaultClassNames.nav),
        button_previous: cn(buttonVariants({ variant: buttonVariant }), "h-[--cell-size] w-[--cell-size] p-0 z-10", defaultClassNames.button_previous),
        button_next: cn(buttonVariants({ variant: buttonVariant }), "h-[--cell-size] w-[--cell-size] p-0 z-10", defaultClassNames.button_next),
        month_caption: cn("flex h-[--cell-size] items-center justify-center px-[--cell-size]", defaultClassNames.month_caption),
        dropdowns: cn("flex h-[--cell-size] items-center justify-center gap-1.5 text-sm font-medium relative z-20", defaultClassNames.dropdowns),
        dropdown_root: cn("relative rounded-md border border-input bg-background shadow-sm", defaultClassNames.dropdown_root),
        dropdown: cn("absolute inset-0 opacity-0 cursor-pointer z-30", defaultClassNames.dropdown),
        caption_label: cn("select-none font-medium text-sm flex h-8 items-center gap-1 rounded-md px-2 pointer-events-none", defaultClassNames.caption_label),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn("text-muted-foreground flex-1 text-[0.8rem] font-normal", defaultClassNames.weekday),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        day: cn("group/day relative aspect-square h-full w-full p-0 text-center", defaultClassNames.day),
        today: cn("bg-accent text-accent-foreground rounded-md", defaultClassNames.today),
        outside: cn("text-muted-foreground opacity-50", defaultClassNames.outside),
        disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === "left") return <ChevronLeftIcon className="size-4" />
          if (orientation === "right") return <ChevronRightIcon className="size-4" />
          return <ChevronDownIcon className="size-4" />
        },
        DayButton: CalendarDayButton,
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      className={cn(
        "h-full w-full p-0 font-normal data-[selected=true]:bg-[#334e5e] data-[selected=true]:text-white aria-selected:bg-[#334e5e] aria-selected:text-white",
        className
      )}
      data-selected={modifiers.selected}
      {...props}
    />
  )
}

export { Calendar }