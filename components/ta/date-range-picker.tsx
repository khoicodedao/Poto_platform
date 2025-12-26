"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, startOfToday, endOfToday, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays } from "date-fns";
import { vi } from "date-fns/locale";

export type DateRange = {
    from: Date;
    to: Date;
};

type PresetOption = {
    label: string;
    value: string;
    getRange: () => DateRange;
};

interface DateRangePickerProps {
    value: DateRange;
    onChange: (range: DateRange) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const presets: PresetOption[] = [
        {
            label: "Hôm nay",
            value: "today",
            getRange: () => ({
                from: startOfToday(),
                to: endOfToday(),
            }),
        },
        {
            label: "Ngày mai",
            value: "tomorrow",
            getRange: () => {
                const tomorrow = addDays(new Date(), 1);
                return {
                    from: tomorrow,
                    to: tomorrow,
                };
            },
        },
        {
            label: "Tuần này",
            value: "this-week",
            getRange: () => ({
                from: startOfWeek(new Date(), { weekStartsOn: 1 }),
                to: endOfWeek(new Date(), { weekStartsOn: 1 }),
            }),
        },
        {
            label: "Tuần sau",
            value: "next-week",
            getRange: () => {
                const nextWeek = addDays(new Date(), 7);
                return {
                    from: startOfWeek(nextWeek, { weekStartsOn: 1 }),
                    to: endOfWeek(nextWeek, { weekStartsOn: 1 }),
                };
            },
        },
        {
            label: "Tháng này",
            value: "this-month",
            getRange: () => ({
                from: startOfMonth(new Date()),
                to: endOfMonth(new Date()),
            }),
        },
    ];

    const handlePresetClick = (preset: PresetOption) => {
        onChange(preset.getRange());
    };

    return (
        <div className="flex flex-wrap gap-2">
            {/* Preset Buttons */}
            {presets.map((preset) => (
                <Button
                    key={preset.value}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetClick(preset)}
                    className="text-sm"
                >
                    {preset.label}
                </Button>
            ))}

            {/* Custom Date Range Picker */}
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        Tùy chỉnh
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-4 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Từ ngày:</label>
                            <Calendar
                                mode="single"
                                selected={value.from}
                                onSelect={(date) => {
                                    if (date) {
                                        onChange({ ...value, from: date });
                                    }
                                }}
                                locale={vi}
                                className="rounded-md border"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Đến ngày:</label>
                            <Calendar
                                mode="single"
                                selected={value.to}
                                onSelect={(date) => {
                                    if (date) {
                                        onChange({ ...value, to: date });
                                        setIsOpen(false);
                                    }
                                }}
                                locale={vi}
                                disabled={(date) => date < value.from}
                                className="rounded-md border"
                            />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Display Selected Range */}
            <div className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 rounded-md">
                <CalendarIcon className="w-4 h-4 text-gray-500" />
                <span className="font-medium">
                    {format(value.from, "dd/MM/yyyy")} - {format(value.to, "dd/MM/yyyy")}
                </span>
            </div>
        </div>
    );
}
