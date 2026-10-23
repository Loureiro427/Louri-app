package com.loureiro.louri;

import java.util.Calendar;

/** Local calendar arithmetic keeps daily reminders aligned across DST changes. */
public final class ReminderClock {
    private ReminderClock() {}
    public static int variant(int day, String slotId, int count) {
        return count > 0 ? Math.floorMod(day + slotId.hashCode(), count) : 0;
    }
    public static long next(Calendar now, int minute) {
        Calendar next = (Calendar) now.clone();
        next.set(Calendar.HOUR_OF_DAY, minute / 60);
        next.set(Calendar.MINUTE, minute % 60);
        next.set(Calendar.SECOND, 0);
        next.set(Calendar.MILLISECOND, 0);
        if (next.getTimeInMillis() <= now.getTimeInMillis()) next.add(Calendar.DATE, 1);
        return next.getTimeInMillis();
    }
    public static boolean silent(int minute, int start, int end) {
        if (start == end) return false;
        return start < end ? minute >= start && minute < end : minute >= start || minute < end;
    }
}
