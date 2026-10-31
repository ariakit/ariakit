import { Badge } from "@ariakit/ui/components/badge.ariakit.react";
import { Button } from "@ariakit/ui/components/button.ariakit.react";
import {
  RadioCard,
  RadioCardContent,
  RadioCardGrid,
  RadioCardLabel,
  RadioCardSlot,
  RadioGroup,
} from "@ariakit/ui/components/radio.ariakit.react";
import { useId, useState } from "react";

interface TimeSlot {
  time: string;
  booked?: boolean;
}

interface Day {
  id: string;
  weekday: string;
  date: string;
  longDate: string;
  times: TimeSlot[];
}

const days: Day[] = [
  {
    id: "tue",
    weekday: "Tue",
    date: "3 Nov",
    longDate: "Tuesday, 3 November",
    times: [
      { time: "09:00" },
      { time: "10:30", booked: true },
      { time: "14:00" },
      { time: "16:00" },
    ],
  },
  {
    id: "wed",
    weekday: "Wed",
    date: "4 Nov",
    longDate: "Wednesday, 4 November",
    times: [
      { time: "08:30" },
      { time: "11:00" },
      { time: "13:30" },
      { time: "17:00", booked: true },
    ],
  },
  {
    id: "thu",
    weekday: "Thu",
    date: "5 Nov",
    longDate: "Thursday, 5 November",
    times: [],
  },
];

function countOpenTimes(day: Day) {
  return day.times.filter((slot) => !slot.booked).length;
}

export default function Example() {
  const hintId = useId();
  const [dayId, setDayId] = useState<string | number | null>("tue");
  const [time, setTime] = useState<string | number | null>(null);
  const day = days.find((item) => item.id === dayId);
  return (
    // The width fits three days and four times in a row, so the cards fill
    // their rows.
    <div className="grid w-[24rem] max-w-full gap-6">
      <RadioCardGrid
        label="Day"
        value={dayId}
        setValue={(value) => {
          setDayId(value);
          // The times belong to a day, so a new day clears the time.
          setTime(null);
        }}
        $minItemSize="7rem"
        className="gap-y-4"
      >
        {days.map((item) => {
          const openTimes = countOpenTimes(item);
          return (
            <RadioCard key={item.id} value={item.id} disabled={!openTimes}>
              <RadioCardContent className="items-center text-center">
                <RadioCardLabel>
                  {item.weekday} {item.date}
                </RadioCardLabel>
              </RadioCardContent>
              <RadioCardSlot $kind="box" $floating>
                <Badge $kind="solid">
                  {openTimes ? `${openTimes} open` : "Full"}
                </Badge>
              </RadioCardSlot>
            </RadioCard>
          );
        })}
      </RadioCardGrid>
      {day && (
        // Each day has its own times, so its group starts fresh.
        <RadioGroup
          key={day.id}
          label={`Time on ${day.longDate}`}
          value={time}
          setValue={setTime}
          aria-describedby={hintId}
          className="grid gap-1"
        >
          <p id={hintId} className="ak-ink-70 text-sm">
            Times in São Paulo time (GMT−3)
          </p>
          {/* The top padding leaves room for the floating badges. */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(4.5rem,1fr))] gap-x-2 gap-y-4 pt-3">
            {day.times.map((slot) => (
              <RadioCard
                key={slot.time}
                value={slot.time}
                disabled={slot.booked}
                $p={2}
              >
                <RadioCardContent className="items-center text-center">
                  <RadioCardLabel className="tabular-nums">
                    {slot.time}
                  </RadioCardLabel>
                </RadioCardContent>
                {slot.booked && (
                  <RadioCardSlot $kind="box" $floating>
                    <Badge $kind="solid">Booked</Badge>
                  </RadioCardSlot>
                )}
              </RadioCard>
            ))}
          </div>
        </RadioGroup>
      )}
      <Button
        $kind="bevel"
        $layer="brand"
        disabled={!day || time == null}
        className="justify-self-start"
      >
        {day && time != null
          ? `Book ${day.weekday} ${day.date} at ${time}`
          : "Book"}
      </Button>
    </div>
  );
}
