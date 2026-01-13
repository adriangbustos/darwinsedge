import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, CaptionProps, useNavigation } from "react-day-picker";
import { format, setMonth, setYear, addMonths, subMonths } from "date-fns";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

// Custom caption with chevrons AND month/year dropdowns
function CustomCaption(props: CaptionProps) {
  const { goToMonth, currentMonth } = useNavigation();
  const currentYear = currentMonth.getFullYear();
  
  // Generate years from current year to +5 years
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 1 + i);
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleMonthChange = (value: string) => {
    const newDate = setMonth(currentMonth, parseInt(value));
    goToMonth(newDate);
  };

  const handleYearChange = (value: string) => {
    const newDate = setYear(currentMonth, parseInt(value));
    goToMonth(newDate);
  };

  const handlePreviousMonth = () => {
    goToMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    goToMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className="flex items-center justify-between gap-1 py-2 px-1">
      {/* Previous Month Button */}
      <button
        onClick={handlePreviousMonth}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        )}
        type="button"
        aria-label="Go to previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Month & Year Dropdowns */}
      <div className="flex items-center gap-1">
        <Select
          value={currentMonth.getMonth().toString()}
          onValueChange={handleMonthChange}
        >
          <SelectTrigger className="h-7 w-[100px] text-xs bg-secondary border-border">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent className="bg-secondary border-border">
            {months.map((month, index) => (
              <SelectItem key={month} value={index.toString()} className="text-sm">
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={currentYear.toString()}
          onValueChange={handleYearChange}
        >
          <SelectTrigger className="h-7 w-[70px] text-xs bg-secondary border-border">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent className="bg-secondary border-border">
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()} className="text-sm">
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Next Month Button */}
      <button
        onClick={handleNextMonth}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        )}
        type="button"
        aria-label="Go to next month"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "hidden", // Hide default label since we use custom caption
        nav: "hidden", // Hide default nav since we have custom buttons in caption
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Caption: CustomCaption,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
