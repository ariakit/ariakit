import { Badge } from "@ariakit/ui/components/badge.ariakit.react";
import { Button } from "@ariakit/ui/components/button.ariakit.react";
import {
  RadioCard,
  RadioCardGrid,
  RadioCardLabel,
  RadioCardSlot,
  RadioGroup,
} from "@ariakit/ui/components/radio.ariakit.react";
import { useState } from "react";

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
  const [dayId, setDayId] = useState<string | number | null>("tue");
  const [time, setTime] = useState<string | number | null>(null);
  const day = days.find((item) => item.id === dayId);
  return (
    // The width fits three days and four times in a row, so the cards fill
    // their rows.
    <div className="grid w-[24rem] max-w-full gap-6">
      <RadioGroup
        label="Day"
        value={dayId}
        setValue={(value) => {
          setDayId(value);
          // The times belong to a day, so a new day clears the time.
          setTime(null);
        }}
        $gap="lg"
      >
        {/* The badges hang over the top of each card, so the rows take a
            larger gap, and the group takes a larger gap to keep its label
            further from the cards. */}
        <RadioCardGrid $minItemSize="7rem" $gap="xl">
          {days.map((item) => {
            const openTimes = countOpenTimes(item);
            return (
              <RadioCard
                key={item.id}
                value={item.id}
                disabled={!openTimes}
                $p={2}
              >
                <RadioCardLabel className="text-center">
                  {item.weekday} {item.date}
                </RadioCardLabel>
                <RadioCardSlot $kind="box" $floating>
                  <Badge $kind="solid">
                    {openTimes ? `${openTimes} open` : "Full"}
                  </Badge>
                </RadioCardSlot>
              </RadioCard>
            );
          })}
        </RadioCardGrid>
      </RadioGroup>
      {day && (
        // Each day has its own times, so its group starts fresh.
        <RadioGroup
          key={day.id}
          label={`Time on ${day.longDate}`}
          description="Times in São Paulo time (GMT−3)"
          value={time}
          setValue={setTime}
          $gap="lg"
        >
          {/* The badges hang over the top of each card, so the rows take a
              larger gap, and the group takes a larger gap to keep its label
              further from the cards. */}
          <RadioCardGrid $minItemSize="4.5rem" $gap="xl">
            {day.times.map((slot) => (
              <RadioCard
                key={slot.time}
                value={slot.time}
                disabled={slot.booked}
                $p={2}
              >
                <RadioCardLabel className="text-center tabular-nums">
                  {slot.time}
                </RadioCardLabel>
                {slot.booked && (
                  <RadioCardSlot $kind="box" $floating>
                    <Badge $kind="solid">Booked</Badge>
                  </RadioCardSlot>
                )}
              </RadioCard>
            ))}
          </RadioCardGrid>
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
